// GENERATED CODE -- DO NOT EDIT!

// package: tdex.v1
// file: tdex/v1/transport.proto

import * as tdex_v1_transport_pb from "../../tdex/v1/transport_pb";
import * as grpc from "grpc";

interface ITransportService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  supportedContentTypes: grpc.MethodDefinition<tdex_v1_transport_pb.SupportedContentTypesRequest, tdex_v1_transport_pb.SupportedContentTypesReply>;
}

export const TransportService: ITransportService;

export class TransportClient extends grpc.Client {
  constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
  supportedContentTypes(argument: tdex_v1_transport_pb.SupportedContentTypesRequest, callback: grpc.requestCallback<tdex_v1_transport_pb.SupportedContentTypesReply>): grpc.ClientUnaryCall;
  supportedContentTypes(argument: tdex_v1_transport_pb.SupportedContentTypesRequest, metadataOrOptions: grpc.Metadata | grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_transport_pb.SupportedContentTypesReply>): grpc.ClientUnaryCall;
  supportedContentTypes(argument: tdex_v1_transport_pb.SupportedContentTypesRequest, metadata: grpc.Metadata | null, options: grpc.CallOptions | null, callback: grpc.requestCallback<tdex_v1_transport_pb.SupportedContentTypesReply>): grpc.ClientUnaryCall;
}
