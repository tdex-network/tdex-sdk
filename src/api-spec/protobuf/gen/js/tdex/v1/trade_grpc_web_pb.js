/**
 * @fileoverview gRPC-Web generated client stub for tdex.v1
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');


var tdex_v1_swap_pb = require('../../tdex/v1/swap_pb.js')

var tdex_v1_types_pb = require('../../tdex/v1/types_pb.js')

var google_api_annotations_pb = require('../../google/api/annotations_pb.js')
const proto = {};
proto.tdex = {};
proto.tdex.v1 = require('./trade_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.tdex.v1.TradeClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.tdex.v1.TradePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.MarketsRequest,
 *   !proto.tdex.v1.MarketsReply>}
 */
const methodDescriptor_Trade_Markets = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/Markets',
  grpc.web.MethodType.UNARY,
  proto.tdex.v1.MarketsRequest,
  proto.tdex.v1.MarketsReply,
  /**
   * @param {!proto.tdex.v1.MarketsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.MarketsReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.MarketsRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.tdex.v1.MarketsReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.MarketsReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.markets =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/tdex.v1.Trade/Markets',
      request,
      metadata || {},
      methodDescriptor_Trade_Markets,
      callback);
};


/**
 * @param {!proto.tdex.v1.MarketsRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.tdex.v1.MarketsReply>}
 *     Promise that resolves to the response
 */
proto.tdex.v1.TradePromiseClient.prototype.markets =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/tdex.v1.Trade/Markets',
      request,
      metadata || {},
      methodDescriptor_Trade_Markets);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.BalancesRequest,
 *   !proto.tdex.v1.BalancesReply>}
 */
const methodDescriptor_Trade_Balances = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/Balances',
  grpc.web.MethodType.UNARY,
  proto.tdex.v1.BalancesRequest,
  proto.tdex.v1.BalancesReply,
  /**
   * @param {!proto.tdex.v1.BalancesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.BalancesReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.BalancesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.tdex.v1.BalancesReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.BalancesReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.balances =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/tdex.v1.Trade/Balances',
      request,
      metadata || {},
      methodDescriptor_Trade_Balances,
      callback);
};


/**
 * @param {!proto.tdex.v1.BalancesRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.tdex.v1.BalancesReply>}
 *     Promise that resolves to the response
 */
proto.tdex.v1.TradePromiseClient.prototype.balances =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/tdex.v1.Trade/Balances',
      request,
      metadata || {},
      methodDescriptor_Trade_Balances);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.MarketPriceRequest,
 *   !proto.tdex.v1.MarketPriceReply>}
 */
const methodDescriptor_Trade_MarketPrice = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/MarketPrice',
  grpc.web.MethodType.UNARY,
  proto.tdex.v1.MarketPriceRequest,
  proto.tdex.v1.MarketPriceReply,
  /**
   * @param {!proto.tdex.v1.MarketPriceRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.MarketPriceReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.MarketPriceRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.tdex.v1.MarketPriceReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.MarketPriceReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.marketPrice =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/tdex.v1.Trade/MarketPrice',
      request,
      metadata || {},
      methodDescriptor_Trade_MarketPrice,
      callback);
};


/**
 * @param {!proto.tdex.v1.MarketPriceRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.tdex.v1.MarketPriceReply>}
 *     Promise that resolves to the response
 */
proto.tdex.v1.TradePromiseClient.prototype.marketPrice =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/tdex.v1.Trade/MarketPrice',
      request,
      metadata || {},
      methodDescriptor_Trade_MarketPrice);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.TradeProposeRequest,
 *   !proto.tdex.v1.TradeProposeReply>}
 */
const methodDescriptor_Trade_TradePropose = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/TradePropose',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.tdex.v1.TradeProposeRequest,
  proto.tdex.v1.TradeProposeReply,
  /**
   * @param {!proto.tdex.v1.TradeProposeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.TradeProposeReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.TradeProposeRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.TradeProposeReply>}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.tradePropose =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/tdex.v1.Trade/TradePropose',
      request,
      metadata || {},
      methodDescriptor_Trade_TradePropose);
};


/**
 * @param {!proto.tdex.v1.TradeProposeRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.TradeProposeReply>}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradePromiseClient.prototype.tradePropose =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/tdex.v1.Trade/TradePropose',
      request,
      metadata || {},
      methodDescriptor_Trade_TradePropose);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.ProposeTradeRequest,
 *   !proto.tdex.v1.ProposeTradeReply>}
 */
const methodDescriptor_Trade_ProposeTrade = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/ProposeTrade',
  grpc.web.MethodType.UNARY,
  proto.tdex.v1.ProposeTradeRequest,
  proto.tdex.v1.ProposeTradeReply,
  /**
   * @param {!proto.tdex.v1.ProposeTradeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.ProposeTradeReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.ProposeTradeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.tdex.v1.ProposeTradeReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.ProposeTradeReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.proposeTrade =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/tdex.v1.Trade/ProposeTrade',
      request,
      metadata || {},
      methodDescriptor_Trade_ProposeTrade,
      callback);
};


/**
 * @param {!proto.tdex.v1.ProposeTradeRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.tdex.v1.ProposeTradeReply>}
 *     Promise that resolves to the response
 */
proto.tdex.v1.TradePromiseClient.prototype.proposeTrade =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/tdex.v1.Trade/ProposeTrade',
      request,
      metadata || {},
      methodDescriptor_Trade_ProposeTrade);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.TradeCompleteRequest,
 *   !proto.tdex.v1.TradeCompleteReply>}
 */
const methodDescriptor_Trade_TradeComplete = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/TradeComplete',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.tdex.v1.TradeCompleteRequest,
  proto.tdex.v1.TradeCompleteReply,
  /**
   * @param {!proto.tdex.v1.TradeCompleteRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.TradeCompleteReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.TradeCompleteRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.TradeCompleteReply>}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.tradeComplete =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/tdex.v1.Trade/TradeComplete',
      request,
      metadata || {},
      methodDescriptor_Trade_TradeComplete);
};


/**
 * @param {!proto.tdex.v1.TradeCompleteRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.TradeCompleteReply>}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradePromiseClient.prototype.tradeComplete =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/tdex.v1.Trade/TradeComplete',
      request,
      metadata || {},
      methodDescriptor_Trade_TradeComplete);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.tdex.v1.CompleteTradeRequest,
 *   !proto.tdex.v1.CompleteTradeReply>}
 */
const methodDescriptor_Trade_CompleteTrade = new grpc.web.MethodDescriptor(
  '/tdex.v1.Trade/CompleteTrade',
  grpc.web.MethodType.UNARY,
  proto.tdex.v1.CompleteTradeRequest,
  proto.tdex.v1.CompleteTradeReply,
  /**
   * @param {!proto.tdex.v1.CompleteTradeRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.CompleteTradeReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.CompleteTradeRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.tdex.v1.CompleteTradeReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.CompleteTradeReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TradeClient.prototype.completeTrade =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/tdex.v1.Trade/CompleteTrade',
      request,
      metadata || {},
      methodDescriptor_Trade_CompleteTrade,
      callback);
};


/**
 * @param {!proto.tdex.v1.CompleteTradeRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.tdex.v1.CompleteTradeReply>}
 *     Promise that resolves to the response
 */
proto.tdex.v1.TradePromiseClient.prototype.completeTrade =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/tdex.v1.Trade/CompleteTrade',
      request,
      metadata || {},
      methodDescriptor_Trade_CompleteTrade);
};


module.exports = proto.tdex.v1;

