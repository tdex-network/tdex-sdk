// GENERATED CODE -- DO NOT EDIT!

// package: tdex.v1
// file: tdex/v1/trade.proto

import * as tdex_v1_trade_pb from "../../tdex/v1/trade_pb";
import * as grpc from "grpc";

interface ITradeService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  markets: grpc.MethodDefinition<tdex_v1_trade_pb.MarketsRequest, tdex_v1_trade_pb.MarketsReply>;
  balances: grpc.MethodDefinition<tdex_v1_trade_pb.BalancesRequest, tdex_v1_trade_pb.BalancesReply>;
  marketPrice: grpc.MethodDefinition<tdex_v1_trade_pb.MarketPriceRequest, tdex_v1_trade_pb.MarketPriceReply>;
  tradePropose: grpc.MethodDefinition<tdex_v1_trade_pb.TradeProposeRequest, tdex_v1_trade_pb.TradeProposeReply>;
  proposeTrade: grpc.MethodDefinition<tdex_v1_trade_pb.ProposeTradeRequest, tdex_v1_trade_pb.ProposeTradeReply>;
  tradeComplete: grpc.MethodDefinition<tdex_v1_trade_pb.TradeCompleteRequest, tdex_v1_trade_pb.TradeCompleteReply>;
  completeTrade: grpc.MethodDefinition<tdex_v1_trade_pb.CompleteTradeRequest, tdex_v1_trade_pb.CompleteTradeReply>;
}

export const TradeService: ITradeService;

export class TradeClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  markets(argument: tdex_v1_trade_pb.MarketsRequest, callback: grpc.requestCallback<tdex_v1_trade_pb.MarketsReply>): grpc.ClientUnaryCall;
  markets(argument: tdex_v1_trade_pb.MarketsRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.MarketsReply>): grpc.ClientUnaryCall;
  markets(argument: tdex_v1_trade_pb.MarketsRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.MarketsReply>): grpc.ClientUnaryCall;
  balances(argument: tdex_v1_trade_pb.BalancesRequest, callback: grpc.requestCallback<tdex_v1_trade_pb.BalancesReply>): grpc.ClientUnaryCall;
  balances(argument: tdex_v1_trade_pb.BalancesRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.BalancesReply>): grpc.ClientUnaryCall;
  balances(argument: tdex_v1_trade_pb.BalancesRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.BalancesReply>): grpc.ClientUnaryCall;
  marketPrice(argument: tdex_v1_trade_pb.MarketPriceRequest, callback: grpc.requestCallback<tdex_v1_trade_pb.MarketPriceReply>): grpc.ClientUnaryCall;
  marketPrice(argument: tdex_v1_trade_pb.MarketPriceRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.MarketPriceReply>): grpc.ClientUnaryCall;
  marketPrice(argument: tdex_v1_trade_pb.MarketPriceRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.MarketPriceReply>): grpc.ClientUnaryCall;
  tradePropose(argument: tdex_v1_trade_pb.TradeProposeRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<tdex_v1_trade_pb.TradeProposeReply>;
  tradePropose(argument: tdex_v1_trade_pb.TradeProposeRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<tdex_v1_trade_pb.TradeProposeReply>;
  proposeTrade(argument: tdex_v1_trade_pb.ProposeTradeRequest, callback: grpc.requestCallback<tdex_v1_trade_pb.ProposeTradeReply>): grpc.ClientUnaryCall;
  proposeTrade(argument: tdex_v1_trade_pb.ProposeTradeRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.ProposeTradeReply>): grpc.ClientUnaryCall;
  proposeTrade(argument: tdex_v1_trade_pb.ProposeTradeRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.ProposeTradeReply>): grpc.ClientUnaryCall;
  tradeComplete(argument: tdex_v1_trade_pb.TradeCompleteRequest, metadataOrOptions?: grpc.Metadata | grpc.CallOptions | null): grpc.ClientReadableStream<tdex_v1_trade_pb.TradeCompleteReply>;
  tradeComplete(argument: tdex_v1_trade_pb.TradeCompleteRequest, metadata?: grpc.Metadata | null, options?: grpc.CallOptions | null): grpc.ClientReadableStream<tdex_v1_trade_pb.TradeCompleteReply>;
  completeTrade(argument: tdex_v1_trade_pb.CompleteTradeRequest, callback: grpc.requestCallback<tdex_v1_trade_pb.CompleteTradeReply>): grpc.ClientUnaryCall;
  completeTrade(argument: tdex_v1_trade_pb.CompleteTradeRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.CompleteTradeReply>): grpc.ClientUnaryCall;
  completeTrade(argument: tdex_v1_trade_pb.CompleteTradeRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_trade_pb.CompleteTradeReply>): grpc.ClientUnaryCall;
}
