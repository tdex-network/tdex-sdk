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


var google_api_annotations_pb = require('../../google/api/annotations_pb.js')
const proto = {};
proto.tdex = {};
proto.tdex.v1 = require('./transport_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.tdex.v1.TransportClient =
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
proto.tdex.v1.TransportPromiseClient =
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
 *   !proto.tdex.v1.SupportedContentTypesRequest,
 *   !proto.tdex.v1.SupportedContentTypesReply>}
 */
const methodDescriptor_Transport_SupportedContentTypes = new grpc.web.MethodDescriptor(
  '/tdex.v1.Transport/SupportedContentTypes',
  grpc.web.MethodType.UNARY,
  proto.tdex.v1.SupportedContentTypesRequest,
  proto.tdex.v1.SupportedContentTypesReply,
  /**
   * @param {!proto.tdex.v1.SupportedContentTypesRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.tdex.v1.SupportedContentTypesReply.deserializeBinary
);


/**
 * @param {!proto.tdex.v1.SupportedContentTypesRequest} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.RpcError, ?proto.tdex.v1.SupportedContentTypesReply)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.tdex.v1.SupportedContentTypesReply>|undefined}
 *     The XHR Node Readable Stream
 */
proto.tdex.v1.TransportClient.prototype.supportedContentTypes =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/tdex.v1.Transport/SupportedContentTypes',
      request,
      metadata || {},
      methodDescriptor_Transport_SupportedContentTypes,
      callback);
};


/**
 * @param {!proto.tdex.v1.SupportedContentTypesRequest} request The
 *     request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.tdex.v1.SupportedContentTypesReply>}
 *     Promise that resolves to the response
 */
proto.tdex.v1.TransportPromiseClient.prototype.supportedContentTypes =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/tdex.v1.Transport/SupportedContentTypes',
      request,
      metadata || {},
      methodDescriptor_Transport_SupportedContentTypes);
};


module.exports = proto.tdex.v1;

