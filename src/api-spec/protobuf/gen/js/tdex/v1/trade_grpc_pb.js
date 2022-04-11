// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var tdex_v1_trade_pb = require('../../tdex/v1/trade_pb.js');
var tdex_v1_swap_pb = require('../../tdex/v1/swap_pb.js');
var tdex_v1_types_pb = require('../../tdex/v1/types_pb.js');
var google_api_annotations_pb = require('../../google/api/annotations_pb.js');

function serialize_tdex_v1_BalancesReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.BalancesReply)) {
    throw new Error('Expected argument of type tdex.v1.BalancesReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_BalancesReply(buffer_arg) {
  return tdex_v1_trade_pb.BalancesReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_BalancesRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.BalancesRequest)) {
    throw new Error('Expected argument of type tdex.v1.BalancesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_BalancesRequest(buffer_arg) {
  return tdex_v1_trade_pb.BalancesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_CompleteTradeReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.CompleteTradeReply)) {
    throw new Error('Expected argument of type tdex.v1.CompleteTradeReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_CompleteTradeReply(buffer_arg) {
  return tdex_v1_trade_pb.CompleteTradeReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_CompleteTradeRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.CompleteTradeRequest)) {
    throw new Error('Expected argument of type tdex.v1.CompleteTradeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_CompleteTradeRequest(buffer_arg) {
  return tdex_v1_trade_pb.CompleteTradeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_MarketPriceReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.MarketPriceReply)) {
    throw new Error('Expected argument of type tdex.v1.MarketPriceReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_MarketPriceReply(buffer_arg) {
  return tdex_v1_trade_pb.MarketPriceReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_MarketPriceRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.MarketPriceRequest)) {
    throw new Error('Expected argument of type tdex.v1.MarketPriceRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_MarketPriceRequest(buffer_arg) {
  return tdex_v1_trade_pb.MarketPriceRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_MarketsReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.MarketsReply)) {
    throw new Error('Expected argument of type tdex.v1.MarketsReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_MarketsReply(buffer_arg) {
  return tdex_v1_trade_pb.MarketsReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_MarketsRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.MarketsRequest)) {
    throw new Error('Expected argument of type tdex.v1.MarketsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_MarketsRequest(buffer_arg) {
  return tdex_v1_trade_pb.MarketsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_ProposeTradeReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.ProposeTradeReply)) {
    throw new Error('Expected argument of type tdex.v1.ProposeTradeReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_ProposeTradeReply(buffer_arg) {
  return tdex_v1_trade_pb.ProposeTradeReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_ProposeTradeRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.ProposeTradeRequest)) {
    throw new Error('Expected argument of type tdex.v1.ProposeTradeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_ProposeTradeRequest(buffer_arg) {
  return tdex_v1_trade_pb.ProposeTradeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_TradeCompleteReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.TradeCompleteReply)) {
    throw new Error('Expected argument of type tdex.v1.TradeCompleteReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_TradeCompleteReply(buffer_arg) {
  return tdex_v1_trade_pb.TradeCompleteReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_TradeCompleteRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.TradeCompleteRequest)) {
    throw new Error('Expected argument of type tdex.v1.TradeCompleteRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_TradeCompleteRequest(buffer_arg) {
  return tdex_v1_trade_pb.TradeCompleteRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_TradeProposeReply(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.TradeProposeReply)) {
    throw new Error('Expected argument of type tdex.v1.TradeProposeReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_TradeProposeReply(buffer_arg) {
  return tdex_v1_trade_pb.TradeProposeReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_TradeProposeRequest(arg) {
  if (!(arg instanceof tdex_v1_trade_pb.TradeProposeRequest)) {
    throw new Error('Expected argument of type tdex.v1.TradeProposeRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_TradeProposeRequest(buffer_arg) {
  return tdex_v1_trade_pb.TradeProposeRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var TradeService = exports.TradeService = {
  // Markets: List all the markets open for trading.
markets: {
    path: '/tdex.v1.Trade/Markets',
    requestStream: false,
    responseStream: false,
    requestType: tdex_v1_trade_pb.MarketsRequest,
    responseType: tdex_v1_trade_pb.MarketsReply,
    requestSerialize: serialize_tdex_v1_MarketsRequest,
    requestDeserialize: deserialize_tdex_v1_MarketsRequest,
    responseSerialize: serialize_tdex_v1_MarketsReply,
    responseDeserialize: deserialize_tdex_v1_MarketsReply,
  },
  // Balances: Gets the balances of the two current reserves in the given
// market.
balances: {
    path: '/tdex.v1.Trade/Balances',
    requestStream: false,
    responseStream: false,
    requestType: tdex_v1_trade_pb.BalancesRequest,
    responseType: tdex_v1_trade_pb.BalancesReply,
    requestSerialize: serialize_tdex_v1_BalancesRequest,
    requestDeserialize: deserialize_tdex_v1_BalancesRequest,
    responseSerialize: serialize_tdex_v1_BalancesReply,
    responseDeserialize: deserialize_tdex_v1_BalancesReply,
  },
  // MarketPrice: Gets the current market price. In case of AMM startegy, the
// trade type and
// the amount of asset to be either sent or received.
//
// BUY = quote asset as input
// SELL = base asset as input
//
// If the type of the trade is BUY it means the base asset will be received by
// the trader.
//
// If the type of the trade is SELL it means the base asset will be sent by
// the trader.
marketPrice: {
    path: '/tdex.v1.Trade/MarketPrice',
    requestStream: false,
    responseStream: false,
    requestType: tdex_v1_trade_pb.MarketPriceRequest,
    responseType: tdex_v1_trade_pb.MarketPriceReply,
    requestSerialize: serialize_tdex_v1_MarketPriceRequest,
    requestDeserialize: deserialize_tdex_v1_MarketPriceRequest,
    responseSerialize: serialize_tdex_v1_MarketPriceReply,
    responseDeserialize: deserialize_tdex_v1_MarketPriceReply,
  },
  // DEPRECATED TradePropose: Sends a swap request message containing a partial signed
// transaction.
//
// BUY = quote asset as input
// SELL = base asset as input
//
//
// If the type of the trade is BUY it means the base asset will be received by
// the trader.
//
// If the type of the trade is SELL it means the base asset will be sent by
// the trader.
tradePropose: {
    path: '/tdex.v1.Trade/TradePropose',
    requestStream: false,
    responseStream: true,
    requestType: tdex_v1_trade_pb.TradeProposeRequest,
    responseType: tdex_v1_trade_pb.TradeProposeReply,
    requestSerialize: serialize_tdex_v1_TradeProposeRequest,
    requestDeserialize: deserialize_tdex_v1_TradeProposeRequest,
    responseSerialize: serialize_tdex_v1_TradeProposeReply,
    responseDeserialize: deserialize_tdex_v1_TradeProposeReply,
  },
  // Unary RPC for TradePropose.
proposeTrade: {
    path: '/tdex.v1.Trade/ProposeTrade',
    requestStream: false,
    responseStream: false,
    requestType: tdex_v1_trade_pb.ProposeTradeRequest,
    responseType: tdex_v1_trade_pb.ProposeTradeReply,
    requestSerialize: serialize_tdex_v1_ProposeTradeRequest,
    requestDeserialize: deserialize_tdex_v1_ProposeTradeRequest,
    responseSerialize: serialize_tdex_v1_ProposeTradeReply,
    responseDeserialize: deserialize_tdex_v1_ProposeTradeReply,
  },
  // DEPRECATED TradeComplete: Sends the trader's counter-signed transaction to the
// provider. If something wrong, a swap fail message is sent. It returns the
// transaction hash of the broadcasted transaction.
tradeComplete: {
    path: '/tdex.v1.Trade/TradeComplete',
    requestStream: false,
    responseStream: true,
    requestType: tdex_v1_trade_pb.TradeCompleteRequest,
    responseType: tdex_v1_trade_pb.TradeCompleteReply,
    requestSerialize: serialize_tdex_v1_TradeCompleteRequest,
    requestDeserialize: deserialize_tdex_v1_TradeCompleteRequest,
    responseSerialize: serialize_tdex_v1_TradeCompleteReply,
    responseDeserialize: deserialize_tdex_v1_TradeCompleteReply,
  },
  // Unary RPC for TradeComplete.
completeTrade: {
    path: '/tdex.v1.Trade/CompleteTrade',
    requestStream: false,
    responseStream: false,
    requestType: tdex_v1_trade_pb.CompleteTradeRequest,
    responseType: tdex_v1_trade_pb.CompleteTradeReply,
    requestSerialize: serialize_tdex_v1_CompleteTradeRequest,
    requestDeserialize: deserialize_tdex_v1_CompleteTradeRequest,
    responseSerialize: serialize_tdex_v1_CompleteTradeReply,
    responseDeserialize: deserialize_tdex_v1_CompleteTradeReply,
  },
};

exports.TradeClient = grpc.makeGenericClientConstructor(TradeService);
