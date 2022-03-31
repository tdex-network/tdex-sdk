import Core, { CoreInterface } from './core';
import { Swap } from './swap';
import {
  UnblindedOutput,
  IdentityInterface,
  CoinSelector,
  isValidAmount,
} from 'ldk';
import TraderClientInterface from './grpcClientInterface';
import { SwapAccept } from './api-spec/generated/js/tdex/v1/swap_pb';
import { SwapTransaction } from './transaction';

export interface TDEXProvider {
  name: string;
  endpoint: string;
}

export interface MarketInterface {
  baseAsset: string;
  quoteAsset: string;
}

export interface TDEXMarket {
  baseAsset: string;
  quoteAsset: string;
  provider: TDEXProvider;
  baseAmount?: number;
  quoteAmount?: number;
  feeBasisPoint?: number;
}

export interface TradeOrder {
  type: TradeType;
  market: TDEXMarket;
  traderClient: TraderClientInterface;
}

export interface TradeInterface extends CoreInterface {
  utxos: Array<UnblindedOutput>;
  coinSelector: CoinSelector;
}

export enum TradeType {
  BUY = 0,
  SELL = 1,
}

export interface TradeOpts {
  providerUrl: string;
  explorerUrl: string;
  utxos: Array<UnblindedOutput>;
  coinSelector: CoinSelector;
}

export interface BuySellOpts {
  market: MarketInterface;
  amount: number;
  asset: string;
  identity: IdentityInterface;
}

type TraderClientInterfaceFactory = (
  providerUrl: string
) => TraderClientInterface;

export class TradeCore extends Core implements TradeInterface {
  grpcClient: TraderClientInterface;
  utxos: Array<UnblindedOutput>;
  coinSelector: CoinSelector;

  constructor(
    args: TradeOpts,
    factoryTraderClient: TraderClientInterfaceFactory
  ) {
    super(args);

    this.validate(args);
    this.utxos = args.utxos;
    this.coinSelector = args.coinSelector;
    this.grpcClient = factoryTraderClient(args.providerUrl);
  }

  validate(args: TradeOpts) {
    if (!this.providerUrl)
      throw new Error(
        'To be able to trade you need to select a liquidity provider via { providerUrl }'
      );

    if (!this.explorerUrl)
      throw new Error(
        'To be able to trade you need to select an explorer via { explorerUrl }'
      );

    if (args.utxos.length <= 0) {
      throw new Error('You need at least one utxo to trade');
    }
  }

  /**
   * Trade.buy let the trader buy the baseAsset,
   * sending his own quoteAsset using the current market price
   */
  async buy({ market, amount, asset, identity }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.BUY,
      amount,
      asset,
      identity
    );
    const txid = await this.marketOrderComplete(swapAccept, identity);
    return txid;
  }

  /**
   * Trade.sell let the trader sell the baseAsset,
   * receiving the quoteAsset using the current market price
   */
  async sell({
    market,
    amount,
    asset,
    identity,
  }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.SELL,
      amount,
      asset,
      identity
    );
    const txid = await this.marketOrderComplete(swapAccept, identity);
    return txid;
  }

  async preview({
    market,
    tradeType,
    amount,
    asset,
  }: {
    market: MarketInterface;
    tradeType: TradeType;
    amount: number;
    asset: string;
  }): Promise<{
    assetToBeSent: string;
    amountToBeSent: number;
    assetToReceive: string;
    amountToReceive: number;
  }> {
    if (!isValidAmount(amount)) {
      throw new Error('Amount is not valid');
    }
    const { baseAsset, quoteAsset } = market;

    const prices = await this.grpcClient.marketPrice(
      {
        baseAsset,
        quoteAsset,
      },
      tradeType,
      amount,
      asset
    );

    const previewedAmount = prices[0].amount;
    if (tradeType === TradeType.BUY) {
      return {
        assetToBeSent: quoteAsset,
        amountToBeSent: asset === baseAsset ? previewedAmount : amount,
        assetToReceive: baseAsset,
        amountToReceive: asset === baseAsset ? amount : previewedAmount,
      };
    }

    return {
      assetToBeSent: baseAsset,
      amountToBeSent: asset === quoteAsset ? previewedAmount : amount,
      assetToReceive: quoteAsset,
      amountToReceive: asset === quoteAsset ? amount : previewedAmount,
    };
  }

  private async marketOrderRequest(
    market: MarketInterface,
    tradeType: TradeType,
    amountInSatoshis: number,
    assetHash: string,
    identity: IdentityInterface
  ): Promise<Uint8Array> {
    const {
      assetToBeSent,
      amountToBeSent,
      assetToReceive,
      amountToReceive,
    } = await this.preview({
      market,
      tradeType,
      amount: amountInSatoshis,
      asset: assetHash,
    });

    const addressForOutput = await identity.getNextAddress();
    const addressForChange = await identity.getNextChangeAddress();

    const swapTx = new SwapTransaction(identity);
    await swapTx.create(
      this.utxos,
      amountToBeSent,
      amountToReceive,
      assetToBeSent,
      assetToReceive,
      addressForOutput.confidentialAddress,
      addressForChange.confidentialAddress,
      this.coinSelector
    );

    const swap = new Swap();
    const swapRequestSerialized = await swap.request({
      assetToBeSent,
      amountToBeSent,
      assetToReceive,
      amountToReceive,
      psetBase64: swapTx.pset.toBase64(),
      inputBlindingKeys: swapTx.inputBlindingKeys,
      outputBlindingKeys: swapTx.outputBlindingKeys,
    });

    // 0 === Buy === receiving base_asset; 1 === sell === receiving base_asset
    let swapAcceptSerialized: Uint8Array;
    try {
      swapAcceptSerialized = await this.grpcClient.proposeTrade(
        market,
        tradeType,
        swapRequestSerialized
      );
    } catch (e) {
      if ((e as any).code && (e as any).code === 12) {
        swapAcceptSerialized = await this.grpcClient.tradePropose(
          market,
          tradeType,
          swapRequestSerialized
        );
      } else {
        throw e;
      }
    }

    return swapAcceptSerialized;
  }

  private async marketOrderComplete(
    swapAcceptSerialized: Uint8Array,
    identity: IdentityInterface
  ): Promise<string> {
    // trader need to check the signed inputs by the provider
    // and add his own inputs if all is correct
    const swapAcceptMessage = SwapAccept.deserializeBinary(
      swapAcceptSerialized
    );
    const transaction = swapAcceptMessage.getTransaction();

    const signedHex = await identity.signPset(transaction);

    // Trader  adds his signed inputs to the transaction
    const swap = new Swap();
    const swapCompleteSerialized = swap.complete({
      message: swapAcceptSerialized,
      psetBase64OrHex: signedHex,
    });

    // Trader call the tradeComplete endpoint to finalize the swap
    let txid: string;
    try {
      txid = await this.grpcClient.completeTrade(swapCompleteSerialized);
    } catch (e) {
      if ((e as any).code && (e as any).code === 12) {
        txid = await this.grpcClient.tradeComplete(swapCompleteSerialized);
      } else {
        throw e;
      }
    }

    return txid;
  }
}
