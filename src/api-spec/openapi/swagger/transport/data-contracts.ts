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
}

export interface RpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}

export enum Tdexv1ContentType {
  CONTENT_TYPE_JSON = 'CONTENT_TYPE_JSON',
  CONTENT_TYPE_GRPC = 'CONTENT_TYPE_GRPC',
  CONTENT_TYPE_GRPCWEB = 'CONTENT_TYPE_GRPCWEB',
  CONTENT_TYPE_GRPCWEBTEXT = 'CONTENT_TYPE_GRPCWEBTEXT',
}

export interface Tdexv1SupportedContentTypesResponse {
  acceptedTypes?: Tdexv1ContentType[];
}
