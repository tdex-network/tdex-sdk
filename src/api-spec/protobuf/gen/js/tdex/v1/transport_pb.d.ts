// package: tdex.v1
// file: tdex/v1/transport.proto

import * as jspb from "google-protobuf";
import * as google_api_annotations_pb from "../../google/api/annotations_pb";

export class SupportedContentTypesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SupportedContentTypesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SupportedContentTypesRequest): SupportedContentTypesRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SupportedContentTypesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SupportedContentTypesRequest;
  static deserializeBinaryFromReader(message: SupportedContentTypesRequest, reader: jspb.BinaryReader): SupportedContentTypesRequest;
}

export namespace SupportedContentTypesRequest {
  export type AsObject = {
  }
}

export class SupportedContentTypesReply extends jspb.Message {
  clearAcceptedTypesList(): void;
  getAcceptedTypesList(): Array<ContentTypeMap[keyof ContentTypeMap]>;
  setAcceptedTypesList(value: Array<ContentTypeMap[keyof ContentTypeMap]>): void;
  addAcceptedTypes(value: ContentTypeMap[keyof ContentTypeMap], index?: number): ContentTypeMap[keyof ContentTypeMap];

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SupportedContentTypesReply.AsObject;
  static toObject(includeInstance: boolean, msg: SupportedContentTypesReply): SupportedContentTypesReply.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SupportedContentTypesReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SupportedContentTypesReply;
  static deserializeBinaryFromReader(message: SupportedContentTypesReply, reader: jspb.BinaryReader): SupportedContentTypesReply;
}

export namespace SupportedContentTypesReply {
  export type AsObject = {
    acceptedTypesList: Array<ContentTypeMap[keyof ContentTypeMap]>,
  }
}

export interface ContentTypeMap {
  JSON: 0;
  GRPC: 1;
  GRPCWEB: 2;
  GRPCWEBTEXT: 3;
}

export const ContentType: ContentTypeMap;

