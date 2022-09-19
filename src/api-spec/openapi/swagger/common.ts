import { Configuration } from 'api-spec/openapi/swagger/configuration';
import isomorphicFetch from 'isomorphic-fetch';

export const BASE_PATH = '/'.replace(/\/+$/, '');

/**
 *
 * @export
 */
export const COLLECTION_FORMATS = {
  csv: ',',
  ssv: ' ',
  tsv: '\t',
  pipes: '|',
};

/**
 *
 * @export
 * @interface FetchAPI
 */
export interface FetchAPI {
  (url: string, init?: any): Promise<Response>;
}

/**
 *
 * @export
 * @interface FetchArgs
 */
export interface FetchArgs {
  url: string;
  options: any;
}

/**
 *
 * @export
 * @class BaseAPI
 */
export class BaseAPI {
  protected configuration: Configuration | undefined;

  constructor(
    configuration?: Configuration,
    protected basePath: string = BASE_PATH,
    protected fetch: FetchAPI = isomorphicFetch
  ) {
    if (configuration) {
      this.configuration = configuration;
      this.basePath = configuration.basePath || this.basePath;
    }
  }
}

/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
export class RequiredError extends Error {
  // @ts-ignore
  name: 'RequiredError';
  constructor(public field: string, msg?: string) {
    super(msg);
  }
}

/**
 *
 * @export
 * @interface ProtobufAny
 */
export interface ProtobufAny {
  [key: string]: any;
}
/**
 *
 * @export
 * @interface RpcStatus
 */
export interface RpcStatus {
  /**
   *
   * @type {number}
   * @memberof RpcStatus
   */
  code?: number;
  /**
   *
   * @type {string}
   * @memberof RpcStatus
   */
  message?: string;
  /**
   *
   * @type {Array<ProtobufAny>}
   * @memberof RpcStatus
   */
  details?: Array<ProtobufAny>;
}
