/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ProtobufAny {
  '@type'?: string;
  [key: string]: any;
}

export interface RpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}

export interface V1Balance {
  /** @format uint64 */
  baseAmount?: string;
  /** @format uint64 */
  quoteAmount?: string;
}

export interface V1BalanceWithFee {
  balance?: V1Balance;
  fee?: V1Fee;
}

export interface V1CompleteTradeRequest {
  swapComplete?: V1SwapComplete;
  swapFail?: V1SwapFail;
}

export interface V1CompleteTradeResponse {
  txid?: string;
  swapFail?: V1SwapFail;
}

export interface V1Fee {
  /** @format int64 */
  basisPoint?: string;
  fixed?: V1Fixed;
}

export interface V1Fixed {
  /** @format int64 */
  baseFee?: string;
  /** @format int64 */
  quoteFee?: string;
}

export interface V1GetMarketBalanceRequest {
  market?: V1Market;
}

export interface V1GetMarketBalanceResponse {
  balance?: V1BalanceWithFee;
}

export interface V1ListMarketsResponse {
  markets?: V1MarketWithFee[];
}

export interface V1Market {
  baseAsset?: string;
  quoteAsset?: string;
}

export interface V1MarketWithFee {
  market?: V1Market;
  fee?: V1Fee;
}

export interface V1Preview {
  price?: V1Price;
  fee?: V1Fee;
  /** @format uint64 */
  amount?: string;
  asset?: string;
  balance?: V1Balance;
}

export interface V1PreviewTradeRequest {
  market?: V1Market;
  type?: V1TradeType;
  /** @format uint64 */
  amount?: string;
  asset?: string;
}

export interface V1PreviewTradeResponse {
  previews?: V1Preview[];
}

export interface V1Price {
  /** @format double */
  basePrice?: number;
  /** @format double */
  quotePrice?: number;
}

export interface V1ProposeTradeRequest {
  market?: V1Market;
  type?: V1TradeType;
  swapRequest?: V1SwapRequest;
}

export interface V1ProposeTradeResponse {
  swapAccept?: V1SwapAccept;
  swapFail?: V1SwapFail;
  /** @format uint64 */
  expiryTimeUnix?: string;
}

export interface V1SwapAccept {
  /** Random unique identifier for the current message */
  id?: string;
  /** indetifier of the SwapRequest message */
  requestId?: string;
  /**
   * The partial signed transaction base64 encoded containing the Responder's
   * signed inputs in a PSBT format
   */
  transaction?: string;
  /**
   * In case of a confidential transaction the blinding key of each confidential
   * input is included. Each blinding key is identified by the prevout script
   * hex encoded.
   */
  inputBlindingKey?: Record<string, string>;
  /**
   * In case of a confidential transaction the blinding key of each confidential
   * output is included. Each blinding key is identified by the output script
   * hex encoded.
   */
  outputBlindingKey?: Record<string, string>;
  /**
   * In case of psetv2 transaction, the original list of trader's unblinded inputs,
   * including also those of the inputs added by the provider.
   */
  unblindedInputs?: V1UnblindedInput[];
}

export interface V1SwapComplete {
  /** Random unique identifier for the current message */
  id?: string;
  /** indetifier of the SwapAccept message */
  acceptId?: string;
  /**
   * The signed transaction base64 encoded containing the Proposers's signed
   * inputs in a PSBT format
   */
  transaction?: string;
}

export interface V1SwapFail {
  /** Random unique identifier for the current message */
  id?: string;
  /** indetifier of either SwapRequest or SwapAccept message. It can be empty */
  messageId?: string;
  /**
   * The failure code. It can be empty
   * @format int64
   */
  failureCode?: number;
  /** The failure reason messaged */
  failureMessage?: string;
}

export interface V1SwapRequest {
  /** Random unique identifier for the current message */
  id?: string;
  /**
   * The proposer's quantity
   * @format uint64
   */
  amountP?: string;
  /** The proposer's asset hash */
  assetP?: string;
  /**
   * The responder's quantity
   * @format uint64
   */
  amountR?: string;
  /** The responder's asset hash */
  assetR?: string;
  /** The proposer's unsigned transaction in PSBT format (base64 string) */
  transaction?: string;
  /**
   * In case of a confidential psetv0 transaction the blinding key of each
   * confidential input is included. Each blinding key is identified by the
   * prevout script hex encoded.
   */
  inputBlindingKey?: Record<string, string>;
  /**
   * In case of a confidential psetv0 transaction the blinding key of each
   * confidential output is included. Each blinding key is identified by the
   * output script hex encoded.
   */
  outputBlindingKey?: Record<string, string>;
  /**
   * In case of psetv2 transaction, the list of trader's unblinded inputs data,
   * even in case they are unconfidential.
   */
  unblindedInputs?: V1UnblindedInput[];
}

/** @default "TRADE_TYPE_BUY" */
export enum V1TradeType {
  TRADE_TYPE_BUY = 'TRADE_TYPE_BUY',
  TRADE_TYPE_SELL = 'TRADE_TYPE_SELL',
}

/** Custom Types */
export interface V1UnblindedInput {
  /** @format int64 */
  index?: number;
  asset?: string;
  /** @format uint64 */
  amount?: string;
  assetBlinder?: string;
  amountBlinder?: string;
}
