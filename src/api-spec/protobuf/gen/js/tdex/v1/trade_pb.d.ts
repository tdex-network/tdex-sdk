// package: tdex.v1
// file: tdex/v1/trade.proto

import * as jspb from "google-protobuf";
import * as tdex_v1_swap_pb from "../../tdex/v1/swap_pb";
import * as tdex_v1_types_pb from "../../tdex/v1/types_pb";
import * as google_api_annotations_pb from "../../google/api/annotations_pb";

export class MarketsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MarketsRequest): MarketsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketsRequest;
  static deserializeBinaryFromReader(message: MarketsRequest, reader: jspb.BinaryReader): MarketsRequest;
}

export namespace MarketsRequest {
  export type AsObject = {
  }
}

export class MarketsReply extends jspb.Message {
  clearMarketsList(): void;
  getMarketsList(): Array<tdex_v1_types_pb.MarketWithFee>;
  setMarketsList(value: Array<tdex_v1_types_pb.MarketWithFee>): void;
  addMarkets(value?: tdex_v1_types_pb.MarketWithFee, index?: number): tdex_v1_types_pb.MarketWithFee;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketsReply.AsObject;
  static toObject(includeInstance: boolean, msg: MarketsReply): MarketsReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketsReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketsReply;
  static deserializeBinaryFromReader(message: MarketsReply, reader: jspb.BinaryReader): MarketsReply;
}

export namespace MarketsReply {
  export type AsObject = {
    marketsList: Array<tdex_v1_types_pb.MarketWithFee.AsObject>,
  }
}

export class BalancesRequest extends jspb.Message {
  hasMarket(): boolean;
  clearMarket(): void;
  getMarket(): tdex_v1_types_pb.Market | undefined;
  setMarket(value?: tdex_v1_types_pb.Market): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BalancesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BalancesRequest): BalancesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BalancesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BalancesRequest;
  static deserializeBinaryFromReader(message: BalancesRequest, reader: jspb.BinaryReader): BalancesRequest;
}

export namespace BalancesRequest {
  export type AsObject = {
    market?: tdex_v1_types_pb.Market.AsObject,
  }
}

export class BalancesReply extends jspb.Message {
  clearBalancesList(): void;
  getBalancesList(): Array<tdex_v1_types_pb.BalanceWithFee>;
  setBalancesList(value: Array<tdex_v1_types_pb.BalanceWithFee>): void;
  addBalances(value?: tdex_v1_types_pb.BalanceWithFee, index?: number): tdex_v1_types_pb.BalanceWithFee;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BalancesReply.AsObject;
  static toObject(includeInstance: boolean, msg: BalancesReply): BalancesReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BalancesReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BalancesReply;
  static deserializeBinaryFromReader(message: BalancesReply, reader: jspb.BinaryReader): BalancesReply;
}

export namespace BalancesReply {
  export type AsObject = {
    balancesList: Array<tdex_v1_types_pb.BalanceWithFee.AsObject>,
  }
}

export class MarketPriceRequest extends jspb.Message {
  hasMarket(): boolean;
  clearMarket(): void;
  getMarket(): tdex_v1_types_pb.Market | undefined;
  setMarket(value?: tdex_v1_types_pb.Market): void;

  getType(): TradeTypeMap[keyof TradeTypeMap];
  setType(value: TradeTypeMap[keyof TradeTypeMap]): void;

  getAmount(): number;
  setAmount(value: number): void;

  getAsset(): string;
  setAsset(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketPriceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MarketPriceRequest): MarketPriceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketPriceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketPriceRequest;
  static deserializeBinaryFromReader(message: MarketPriceRequest, reader: jspb.BinaryReader): MarketPriceRequest;
}

export namespace MarketPriceRequest {
  export type AsObject = {
    market?: tdex_v1_types_pb.Market.AsObject,
    type: TradeTypeMap[keyof TradeTypeMap],
    amount: number,
    asset: string,
  }
}

export class MarketPriceReply extends jspb.Message {
  clearPricesList(): void;
  getPricesList(): Array<tdex_v1_types_pb.PriceWithFee>;
  setPricesList(value: Array<tdex_v1_types_pb.PriceWithFee>): void;
  addPrices(value?: tdex_v1_types_pb.PriceWithFee, index?: number): tdex_v1_types_pb.PriceWithFee;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MarketPriceReply.AsObject;
  static toObject(includeInstance: boolean, msg: MarketPriceReply): MarketPriceReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MarketPriceReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MarketPriceReply;
  static deserializeBinaryFromReader(message: MarketPriceReply, reader: jspb.BinaryReader): MarketPriceReply;
}

export namespace MarketPriceReply {
  export type AsObject = {
    pricesList: Array<tdex_v1_types_pb.PriceWithFee.AsObject>,
  }
}

export class TradeProposeRequest extends jspb.Message {
  hasMarket(): boolean;
  clearMarket(): void;
  getMarket(): tdex_v1_types_pb.Market | undefined;
  setMarket(value?: tdex_v1_types_pb.Market): void;

  getType(): TradeTypeMap[keyof TradeTypeMap];
  setType(value: TradeTypeMap[keyof TradeTypeMap]): void;

  hasSwapRequest(): boolean;
  clearSwapRequest(): void;
  getSwapRequest(): tdex_v1_swap_pb.SwapRequest | undefined;
  setSwapRequest(value?: tdex_v1_swap_pb.SwapRequest): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TradeProposeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TradeProposeRequest): TradeProposeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TradeProposeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TradeProposeRequest;
  static deserializeBinaryFromReader(message: TradeProposeRequest, reader: jspb.BinaryReader): TradeProposeRequest;
}

export namespace TradeProposeRequest {
  export type AsObject = {
    market?: tdex_v1_types_pb.Market.AsObject,
    type: TradeTypeMap[keyof TradeTypeMap],
    swapRequest?: tdex_v1_swap_pb.SwapRequest.AsObject,
  }
}

export class TradeProposeReply extends jspb.Message {
  hasSwapAccept(): boolean;
  clearSwapAccept(): void;
  getSwapAccept(): tdex_v1_swap_pb.SwapAccept | undefined;
  setSwapAccept(value?: tdex_v1_swap_pb.SwapAccept): void;

  hasSwapFail(): boolean;
  clearSwapFail(): void;
  getSwapFail(): tdex_v1_swap_pb.SwapFail | undefined;
  setSwapFail(value?: tdex_v1_swap_pb.SwapFail): void;

  getExpiryTimeUnix(): number;
  setExpiryTimeUnix(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TradeProposeReply.AsObject;
  static toObject(includeInstance: boolean, msg: TradeProposeReply): TradeProposeReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TradeProposeReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TradeProposeReply;
  static deserializeBinaryFromReader(message: TradeProposeReply, reader: jspb.BinaryReader): TradeProposeReply;
}

export namespace TradeProposeReply {
  export type AsObject = {
    swapAccept?: tdex_v1_swap_pb.SwapAccept.AsObject,
    swapFail?: tdex_v1_swap_pb.SwapFail.AsObject,
    expiryTimeUnix: number,
  }
}

export class TradeCompleteRequest extends jspb.Message {
  hasSwapComplete(): boolean;
  clearSwapComplete(): void;
  getSwapComplete(): tdex_v1_swap_pb.SwapComplete | undefined;
  setSwapComplete(value?: tdex_v1_swap_pb.SwapComplete): void;

  hasSwapFail(): boolean;
  clearSwapFail(): void;
  getSwapFail(): tdex_v1_swap_pb.SwapFail | undefined;
  setSwapFail(value?: tdex_v1_swap_pb.SwapFail): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TradeCompleteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TradeCompleteRequest): TradeCompleteRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TradeCompleteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TradeCompleteRequest;
  static deserializeBinaryFromReader(message: TradeCompleteRequest, reader: jspb.BinaryReader): TradeCompleteRequest;
}

export namespace TradeCompleteRequest {
  export type AsObject = {
    swapComplete?: tdex_v1_swap_pb.SwapComplete.AsObject,
    swapFail?: tdex_v1_swap_pb.SwapFail.AsObject,
  }
}

export class TradeCompleteReply extends jspb.Message {
  getTxid(): string;
  setTxid(value: string): void;

  hasSwapFail(): boolean;
  clearSwapFail(): void;
  getSwapFail(): tdex_v1_swap_pb.SwapFail | undefined;
  setSwapFail(value?: tdex_v1_swap_pb.SwapFail): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TradeCompleteReply.AsObject;
  static toObject(includeInstance: boolean, msg: TradeCompleteReply): TradeCompleteReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TradeCompleteReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TradeCompleteReply;
  static deserializeBinaryFromReader(message: TradeCompleteReply, reader: jspb.BinaryReader): TradeCompleteReply;
}

export namespace TradeCompleteReply {
  export type AsObject = {
    txid: string,
    swapFail?: tdex_v1_swap_pb.SwapFail.AsObject,
  }
}

export class ProposeTradeRequest extends jspb.Message {
  hasMarket(): boolean;
  clearMarket(): void;
  getMarket(): tdex_v1_types_pb.Market | undefined;
  setMarket(value?: tdex_v1_types_pb.Market): void;

  getType(): TradeTypeMap[keyof TradeTypeMap];
  setType(value: TradeTypeMap[keyof TradeTypeMap]): void;

  hasSwapRequest(): boolean;
  clearSwapRequest(): void;
  getSwapRequest(): tdex_v1_swap_pb.SwapRequest | undefined;
  setSwapRequest(value?: tdex_v1_swap_pb.SwapRequest): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposeTradeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ProposeTradeRequest): ProposeTradeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProposeTradeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposeTradeRequest;
  static deserializeBinaryFromReader(message: ProposeTradeRequest, reader: jspb.BinaryReader): ProposeTradeRequest;
}

export namespace ProposeTradeRequest {
  export type AsObject = {
    market?: tdex_v1_types_pb.Market.AsObject,
    type: TradeTypeMap[keyof TradeTypeMap],
    swapRequest?: tdex_v1_swap_pb.SwapRequest.AsObject,
  }
}

export class ProposeTradeReply extends jspb.Message {
  hasSwapAccept(): boolean;
  clearSwapAccept(): void;
  getSwapAccept(): tdex_v1_swap_pb.SwapAccept | undefined;
  setSwapAccept(value?: tdex_v1_swap_pb.SwapAccept): void;

  hasSwapFail(): boolean;
  clearSwapFail(): void;
  getSwapFail(): tdex_v1_swap_pb.SwapFail | undefined;
  setSwapFail(value?: tdex_v1_swap_pb.SwapFail): void;

  getExpiryTimeUnix(): number;
  setExpiryTimeUnix(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProposeTradeReply.AsObject;
  static toObject(includeInstance: boolean, msg: ProposeTradeReply): ProposeTradeReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ProposeTradeReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProposeTradeReply;
  static deserializeBinaryFromReader(message: ProposeTradeReply, reader: jspb.BinaryReader): ProposeTradeReply;
}

export namespace ProposeTradeReply {
  export type AsObject = {
    swapAccept?: tdex_v1_swap_pb.SwapAccept.AsObject,
    swapFail?: tdex_v1_swap_pb.SwapFail.AsObject,
    expiryTimeUnix: number,
  }
}

export class CompleteTradeRequest extends jspb.Message {
  hasSwapComplete(): boolean;
  clearSwapComplete(): void;
  getSwapComplete(): tdex_v1_swap_pb.SwapComplete | undefined;
  setSwapComplete(value?: tdex_v1_swap_pb.SwapComplete): void;

  hasSwapFail(): boolean;
  clearSwapFail(): void;
  getSwapFail(): tdex_v1_swap_pb.SwapFail | undefined;
  setSwapFail(value?: tdex_v1_swap_pb.SwapFail): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompleteTradeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CompleteTradeRequest): CompleteTradeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompleteTradeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompleteTradeRequest;
  static deserializeBinaryFromReader(message: CompleteTradeRequest, reader: jspb.BinaryReader): CompleteTradeRequest;
}

export namespace CompleteTradeRequest {
  export type AsObject = {
    swapComplete?: tdex_v1_swap_pb.SwapComplete.AsObject,
    swapFail?: tdex_v1_swap_pb.SwapFail.AsObject,
  }
}

export class CompleteTradeReply extends jspb.Message {
  getTxid(): string;
  setTxid(value: string): void;

  hasSwapFail(): boolean;
  clearSwapFail(): void;
  getSwapFail(): tdex_v1_swap_pb.SwapFail | undefined;
  setSwapFail(value?: tdex_v1_swap_pb.SwapFail): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompleteTradeReply.AsObject;
  static toObject(includeInstance: boolean, msg: CompleteTradeReply): CompleteTradeReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CompleteTradeReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompleteTradeReply;
  static deserializeBinaryFromReader(message: CompleteTradeReply, reader: jspb.BinaryReader): CompleteTradeReply;
}

export namespace CompleteTradeReply {
  export type AsObject = {
    txid: string,
    swapFail?: tdex_v1_swap_pb.SwapFail.AsObject,
  }
}

export interface TradeTypeMap {
  BUY: 0;
  SELL: 1;
}

export const TradeType: TradeTypeMap;

