import Core, { CoreInterface, NetworkString } from './core';
import { Swap } from 'swap';
import { Psbt } from 'liquidjs-lib/src/psbt';
import TraderClientInterface from './clientInterface';
import { SwapTransaction, UnblindedOutput } from 'transaction';
import {
  Extractor,
  Finalizer,
  networks,
  payments,
  Pset,
  script as bscript,
  Signer,
  Transaction,
} from 'liquidjs-lib';
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { mnemonicToSeedSync } from 'bip39';
import { decodePset, isPsetV0, isRawTransaction, isValidAmount } from 'utils';
import { SLIP77Factory } from 'slip77';
import { SwapAccept as SwapAcceptV1 } from 'api-spec/protobuf/gen/js/tdex/v1/swap_pb';
import { SwapAccept as SwapAcceptV2 } from 'api-spec/protobuf/gen/js/tdex/v2/swap_pb';

const bip32 = BIP32Factory(ecc);
const slip77 = SLIP77Factory(ecc);

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
  baseAmount?: string;
  quoteAmount?: string;
  feeBasisPoint?: number;
}

export interface TradeOrder {
  type: TradeType;
  market: TDEXMarket;
  traderClient: TraderClientInterface;
}

export interface TradeInterface extends CoreInterface {
  utxos: Array<UnblindedOutput>;
}

export enum TradeType {
  BUY = 0,
  SELL = 1,
}

export interface TradeOpts {
  providerUrl: string;
  explorerUrl: string;
  utxos: Array<UnblindedOutput>;
  protoVersion: 'v1' | 'v2';
  chain: NetworkString;
  mnemonic: string;
  baseDerivationPath: string;
}

export interface BuySellOpts {
  market: MarketInterface;
  amount: number;
  asset: string;
}

export type TraderClientInterfaceFactory = (
  providerUrl: string
) => TraderClientInterface;

interface ScriptDetails {
  confidentialAddress: string;
  derivationPath: string;
  publicKey: Buffer;
}

export class TradeCore extends Core implements TradeInterface {
  client: TraderClientInterface;
  utxos: Array<UnblindedOutput>;
  masterNode: BIP32Interface;
  masterPubKeyNode: BIP32Interface;
  masterBlindingKey: string;
  baseDerivationPath: string;

  constructor(
    args: TradeOpts,
    factoryTraderClient: TraderClientInterfaceFactory
  ) {
    super(args);

    this.validate(args);
    this.utxos = args.utxos;
    this.client = factoryTraderClient(args.providerUrl);
    this.baseDerivationPath = args.baseDerivationPath;
    const seed = mnemonicToSeedSync(args.mnemonic);
    this.masterNode = bip32.fromSeed(seed);
    this.masterPubKeyNode = this.masterNode
      .derivePath(args.baseDerivationPath)
      .neutered();
    this.masterBlindingKey = slip77.fromSeed(seed).masterKey.toString('hex');
  }

  protected scriptDetailsCache: Record<string, ScriptDetails> = {};

  validate(args: TradeOpts) {
    if (!this.protoVersion)
      throw new Error(
        'To be able to trade you need to select a protoVersion via { protoVersion }'
      );

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
  async buy({ market, amount, asset }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.BUY,
      amount,
      asset
    );

    // Retry in case we are too early and the provider doesn't find any trade
    // matching the swapAccept id
    while (true) {
      try {
        return await this.marketOrderComplete(swapAccept);
      } catch (e) {
        const err = e as Error;
        if (err.message && err.message.includes('not found')) {
          continue;
        }
        throw e;
      }
    }
  }

  /**
   * Trade.buyWihtoutComplete let the trader buy the baseAsset,
   * sending his own quoteAsset using the current market price wihtout
   * broadcasting the tx
   */
  async buyWithoutComplete({
    market,
    amount,
    asset,
  }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.BUY,
      amount,
      asset
    );
    const autoComplete = true;
    return await this.marketOrderComplete(swapAccept, autoComplete);
  }

  /**
   * Trade.sell let the trader sell the baseAsset,
   * receiving the quoteAsset using the current market price
   */
  async sell({ market, amount, asset }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.SELL,
      amount,
      asset
    );

    // Retry in case we are too early and the provider doesn't find any trade
    // matching the swapAccept id
    while (true) {
      try {
        return await this.marketOrderComplete(swapAccept);
      } catch (e) {
        const err = e as Error;
        if (err.message && err.message.includes('not found')) {
          continue;
        }
        throw e;
      }
    }
  }

  /**
   * Trade.sellWithoutComplete let the trader sell the baseAsset,
   * receiving the quoteAsset using the current market price without
   * broadcasting the tx
   */
  async sellWithoutComplete({
    market,
    amount,
    asset,
  }: BuySellOpts): Promise<string> {
    const swapAccept = await this.marketOrderRequest(
      market,
      TradeType.SELL,
      amount,
      asset
    );
    const autoComplete = true;
    return await this.marketOrderComplete(swapAccept, autoComplete);
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

    const prices = await this.client.marketPrice(
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
        amountToBeSent:
          asset === baseAsset ? Number(previewedAmount) : Number(amount),
        assetToReceive: baseAsset,
        amountToReceive:
          asset === baseAsset ? Number(amount) : Number(previewedAmount),
      };
    }

    return {
      assetToBeSent: baseAsset,
      amountToBeSent:
        asset === quoteAsset ? Number(previewedAmount) : Number(amount),
      assetToReceive: quoteAsset,
      amountToReceive:
        asset === quoteAsset ? Number(amount) : Number(previewedAmount),
    };
  }

  private async marketOrderRequest(
    market: MarketInterface,
    tradeType: TradeType,
    amountInSatoshis: number,
    assetHash: string
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

    const addressForOutput = await this._getNextAddress(false);
    const addressForChange = await this._getNextAddress(true);

    const swapTx = new SwapTransaction({
      network: networks[this.chain],
      masterBlindingKey: this.masterBlindingKey,
    });
    await swapTx.create(
      this.utxos,
      amountToBeSent,
      amountToReceive,
      assetToBeSent,
      assetToReceive,
      addressForOutput.confidentialAddress,
      addressForChange.confidentialAddress
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
      swapAcceptSerialized = await this.client.proposeTrade(
        market,
        tradeType,
        swapRequestSerialized
      );
    } catch (e) {
      throw e;
    }

    return swapAcceptSerialized;
  }

  private async marketOrderComplete(
    swapAcceptSerialized: Uint8Array,
    autoComplete?: boolean
  ): Promise<string> {
    // trader need to check the signed inputs by the provider
    // and add his own inputs if all is correct
    let swapAcceptMessage;
    if (this.protoVersion === 'v1') {
      swapAcceptMessage = SwapAcceptV1.fromBinary(swapAcceptSerialized);
    } else {
      swapAcceptMessage = SwapAcceptV2.fromBinary(swapAcceptSerialized);
    }
    const psetBase64 = swapAcceptMessage.transaction;
    const signedPset = await this._signPset(psetBase64);
    const signedHex = this._finalizeAndExtract(signedPset);

    if (autoComplete) {
      if (isRawTransaction(signedHex)) {
        return signedHex;
      }
      if (isPsetV0(signedHex)) {
        const pset = Psbt.fromBase64(signedHex);
        pset.finalizeAllInputs();
        return pset.extractTransaction().toHex();
      }
    }

    // Trader  adds his signed inputs to the transaction
    const swap = new Swap();
    const swapCompleteSerialized = swap.complete({
      message: swapAcceptSerialized,
      psetBase64OrHex: signedHex,
    });
    // Trader call the completeTrade endpoint to finalize the swap
    let txid: string;
    try {
      txid = await this.client.completeTrade(swapCompleteSerialized);
    } catch (e) {
      throw e;
    }
    return txid;
  }

  private async _getNextAddress(isInternal: boolean): Promise<ScriptDetails> {
    // Get next index
    const chain = isInternal ? 1 : 0;
    const child = this.masterPubKeyNode.derive(chain).derive(index);
    if (!child.publicKey) throw new Error('Could not derive public key');
    const publicKey = child.publicKey;
    const derivationPath = `${this.baseDerivationPath}/${chain}/${index}`;
    // increment next index
    const p2wpkhPayment = payments.p2wpkh({
      pubkey: publicKey,
      network: networks[this.chain],
    });
    const script = p2wpkhPayment.output;
    if (!script) throw new Error('Could not derive script');
    const scriptDetails = {
      publicKey,
      derivationPath,
      confidentialAddress: p2wpkhPayment.confidentialAddress ?? '',
    };
    this.scriptDetailsCache[script.toString('hex')] = scriptDetails;
    return scriptDetails;
  }

  private async _signPset(psetBase64: string): Promise<Pset> {
    const pset = decodePset(psetBase64);
    const signer = new Signer(pset);
    for (const [index, input] of signer.pset.inputs.entries()) {
      const script = input.witnessUtxo?.script;
      if (!script) continue;
      const scriptDetails = this.scriptDetailsCache[script.toString('hex')];
      if (!scriptDetails || !scriptDetails.derivationPath) continue;
      const key = this.masterNode
        .derivePath(this.baseDerivationPath)
        .derivePath(scriptDetails.derivationPath.replace('m/', '')!);
      const sighash = input.sighashType || Transaction.SIGHASH_ALL; // '||' lets to overwrite SIGHASH_DEFAULT (0x00)
      const signature = key.sign(pset.getInputPreimage(index, sighash));
      signer.addSignature(
        index,
        {
          partialSig: {
            pubkey: key.publicKey,
            signature: bscript.signature.encode(signature, sighash),
          },
        },
        Pset.ECDSASigValidator(ecc)
      );
    }
    return signer.pset;
  }

  private _finalizeAndExtract(pset: Pset): string {
    const finalizer = new Finalizer(pset);
    finalizer.finalize();
    return Extractor.extract(finalizer.pset).toHex();
  }
}
