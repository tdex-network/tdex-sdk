// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var tdex_v1_transport_pb = require('../../tdex/v1/transport_pb.js');
var google_api_annotations_pb = require('../../google/api/annotations_pb.js');

function serialize_tdex_v1_SupportedContentTypesReply(arg) {
  if (!(arg instanceof tdex_v1_transport_pb.SupportedContentTypesReply)) {
    throw new Error('Expected argument of type tdex.v1.SupportedContentTypesReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_SupportedContentTypesReply(buffer_arg) {
  return tdex_v1_transport_pb.SupportedContentTypesReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_tdex_v1_SupportedContentTypesRequest(arg) {
  if (!(arg instanceof tdex_v1_transport_pb.SupportedContentTypesRequest)) {
    throw new Error('Expected argument of type tdex.v1.SupportedContentTypesRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_tdex_v1_SupportedContentTypesRequest(buffer_arg) {
  return tdex_v1_transport_pb.SupportedContentTypesRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


//
// Service used by Liquidity providers to announce the accepted content type for incoming HTTP request messages
var TransportService = exports.TransportService = {
  supportedContentTypes: {
    path: '/tdex.v1.Transport/SupportedContentTypes',
    requestStream: false,
    responseStream: false,
    requestType: tdex_v1_transport_pb.SupportedContentTypesRequest,
    responseType: tdex_v1_transport_pb.SupportedContentTypesReply,
    requestSerialize: serialize_tdex_v1_SupportedContentTypesRequest,
    requestDeserialize: deserialize_tdex_v1_SupportedContentTypesRequest,
    responseSerialize: serialize_tdex_v1_SupportedContentTypesReply,
    responseDeserialize: deserialize_tdex_v1_SupportedContentTypesReply,
  },
};

exports.TransportClient = grpc.makeGenericClientConstructor(TransportService);
