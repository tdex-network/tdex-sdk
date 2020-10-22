import Core, { CoreInterface } from './core';
import { Swap } from './swap';
import { WalletInterface, fetchUtxos, walletFromAddresses } from './wallet';
import { TraderClient } from './grpcClient';
import TraderClientInterface from './grpcClientInterface';
import { isValidAmount } from './utils';
import { SwapAccept } from 'tdex-protobuf/generated/js/swap_pb';
import { IdentityInterface, IdentityOpts, IdentityType } from './identity';
import PrivateKey from './identities/privatekey';
import Mnemonic from './identities/mnemonic';

export interface MarketInterface {
  baseAsset: string;
  quoteAsset: string;
}

export interface TradeInterface extends CoreInterface {
  identity: IdentityInterface;
}

export enum TradeType {
  BUY = 0,
  SELL = 1,
}

export class Trade extends Core implements TradeInterface {
  grpcClient: TraderClientInterface;
  identity!: IdentityInterface;

  constructor(args: any) {
    super(args);

    this.validate(args);
    this.setIdentity(args.identity);

    this.grpcClient = new TraderClient(this.providerUrl!);
  }

  validate(args: any) {
    if (!this.providerUrl)
      throw new Error(
        'To be able to trade you need to select a liquidity provider via { providerUrl }'
      );

    if (!this.explorerUrl)
      throw new Error(
        'To be able to trade you need to select an explorer via { explorerUrl }'
      );

    if (!args.identity || !args.identity.chain)
      throw new Error(
        'To be able to trade you need to select an identity via { identity }'
      );
  }

  setIdentity(identity: IdentityOpts) {
    switch (identity.type) {
      case IdentityType.PrivateKey:
        this.identity = new PrivateKey(identity);
        break;

      case IdentityType.Mnemonic:
        this.identity = new Mnemonic(identity);
        break;

      default:
        throw new Error('Selected identity type not supported');
    }

    this.chain = identity.chain;
  }

  /**
   * Trade.buy let the trder buy the baseAsset,
   * sending his own quoteAsset using the current market price
   */
  async buy({
    market,
    amount,
    address,
    privateKey,
  }: {
    market: MarketInterface;
    amount: number; //this is fractional amount
    address?: string;
    privateKey?: string;
  }): Promise<string> {
    if (!privateKey && !address)
      throw new Error(
        'Either private key or native segwit address is required'
      );

    const addresses = this.identity.getAddresses();
    const wallet: WalletInterface = walletFromAddresses(addresses, this.chain!);

    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.BUY,
      amount,
      wallet
    );
    const txid = await this.marketOrderComplete(swapAccept);
    return txid;
  }

  /**
   * Trade.sell let the trder sell the baseAsset,
   * receiving the quoteAsset using the current market price
   */

  async sell({
    market,
    amount,
    address,
    privateKey,
  }: {
    market: MarketInterface;
    amount: number; // this is fractional amount
    address?: string;
    privateKey?: string;
  }): Promise<Uint8Array | string> {
    if (!privateKey && !address)
      throw new Error(
        'Either private key or native segwit address is required'
      );

    const addresses = this.identity.getAddresses();
    const wallet: WalletInterface = walletFromAddresses(addresses, this.chain!);

    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.SELL,
      amount,
      wallet
    );
    const txid = await this.marketOrderComplete(swapAccept);
    return txid;
  }

  async preview(
    market: MarketInterface,
    tradeType: TradeType,
    amountInSatoshis: number
  ): Promise<any> {
    if (!isValidAmount(amountInSatoshis)) {
      throw new Error('Amount is not valid');
    }
    const { baseAsset, quoteAsset } = market;

    const prices = await this.grpcClient.marketPrice(
      {
        baseAsset,
        quoteAsset,
      },
      tradeType,
      amountInSatoshis
    );

    if (tradeType === TradeType.BUY) {
      return {
        assetToBeSent: quoteAsset,
        amountToBeSent: prices[0].amount,
        assetToReceive: baseAsset,
        amountToReceive: amountInSatoshis,
      };
    }

    return {
      assetToBeSent: baseAsset,
      amountToBeSent: amountInSatoshis,
      assetToReceive: quoteAsset,
      amountToReceive: prices[0].amount,
    };
  }

  private async marketOrderRequest(
    market: MarketInterface,
    tradeType: TradeType,
    amountInSatoshis: number,
    wallet: WalletInterface
  ): Promise<Uint8Array> {
    const {
      assetToBeSent,
      amountToBeSent,
      assetToReceive,
      amountToReceive,
    } = await this.preview(market, tradeType, amountInSatoshis);

    const [firstAddress] = wallet.addresses;
    //TODO do actual fetching from list of addresses instead of single one.
    const traderUtxos = await fetchUtxos(
      firstAddress.confidentialAddress,
      this.explorerUrl!
    );

    const emptyPsbt = wallet.createTx();
    const psetBase64 = wallet.updateTx(
      emptyPsbt,
      traderUtxos,
      amountToBeSent,
      amountToReceive,
      assetToBeSent,
      assetToReceive
    );

    const swap = new Swap();
    const swapRequestSerialized = swap.request({
      assetToBeSent,
      amountToBeSent,
      assetToReceive,
      amountToReceive,
      psbtBase64: psetBase64,
    });

    // 0 === Buy === receiving base_asset; 1 === sell === receiving base_asset
    const swapAcceptSerialized: Uint8Array = await this.grpcClient.tradePropose(
      market,
      tradeType,
      swapRequestSerialized
    );

    return swapAcceptSerialized;
  }

  private async marketOrderComplete(
    swapAcceptSerialized: Uint8Array
  ): Promise<string> {
    // trader need to check the signed inputs by the provider
    // and add his own inputs if all is correct
    const swapAcceptMessage = SwapAccept.deserializeBinary(
      swapAcceptSerialized
    );
    const transaction = swapAcceptMessage.getTransaction();
    const signedPset = await this.identity.signPset(transaction);

    // Trader  adds his signed inputs to the transaction
    const swap = new Swap();
    const swapCompleteSerialized = swap.complete({
      message: swapAcceptSerialized,
      psbtBase64: signedPset,
    });

    // Trader call the tradeComplete endpoint to finalize the swap
    const txid = await this.grpcClient.tradeComplete(swapCompleteSerialized);
    return txid;
  }
}
