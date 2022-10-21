import { V1ContentType } from './api-spec/openapi/swagger/transport/data-contracts';
import { ContentType } from './api-spec/openapi/swagger/transport/http-client';
import { V1 } from './api-spec/openapi/swagger/transport/V1';
import TraderClientInterface from './clientInterface';
import { TraderClient } from './client';
import { TraderClient as TraderClientHttp } from './client.http';
import { DEFAULT_TOR_PROXY, getClearTextTorProxyUrl } from './utils';

const defaultClientTypePriority: V1ContentType[] = [
  V1ContentType.CONTENT_TYPE_GRPC,
  V1ContentType.CONTENT_TYPE_JSON,
];

export class Transport {
  _client: V1<unknown>;
  providerUrl: string;
  typePriority: V1ContentType[];
  torProxyEndpoint?: string;
  tradeClient?: TraderClientInterface;

  constructor(
    providerUrl: string,
    torProxyEndpoint: string = DEFAULT_TOR_PROXY,
    clientTypePriority?: V1ContentType[]
  ) {
    this.providerUrl = providerUrl;
    const url = new URL(providerUrl);
    this.typePriority = clientTypePriority || defaultClientTypePriority;

    // we assume we are in Liquid mainnet
    // TODO check if socks5 proxy is running (ie. Tor Browser)
    if (url.hostname.includes('onion') && !url.protocol.includes('https')) {
      // We use the HTTP1 cleartext endpoint here provided by the public tor reverse proxy
      // https://pkg.go.dev/github.com/tdex-network/tor-proxy@v0.0.3/pkg/torproxy#NewTorProxy
      //host:port/<just_onion_host_without_dot_onion>/[<grpc_package>.<grpc_service>/<grpc_method>]
      this.providerUrl = getClearTextTorProxyUrl(torProxyEndpoint, url);
      this.torProxyEndpoint = torProxyEndpoint;
    }

    this._client = new V1({ baseURL: this.providerUrl });
  }

  async connect(): Promise<void> {
    const supportedTypes = await this.supportedContentTypes();

    for (let i = 0; i < this.typePriority.length; i++) {
      const clientType = this.typePriority[i];
      if (supportedTypes.includes(clientType)) {
        let client: TraderClientInterface = new TraderClient(this.providerUrl);
        if (clientType === V1ContentType.CONTENT_TYPE_JSON) {
          client = new TraderClientHttp(
            this.providerUrl,
            this.torProxyEndpoint
          );
        }
        this.tradeClient = client;
        return;
      }
    }

    throw new Error(`Failed to connect to provider ${this.providerUrl}`);
  }

  private async supportedContentTypes(): Promise<V1ContentType[]> {
    try {
      const {
        data: { acceptedTypes },
      } = await this._client.transportServiceSupportedContentTypes({
        headers: { 'Content-Type': ContentType.Json },
      });
      if (!acceptedTypes) {
        return [];
      }
      return acceptedTypes!;
    } catch (e) {
      // @ts-ignore
      const err = e as Error | AxiosError;
      if (err.response) {
        throw new Error(err.response.data.message);
      }
      throw e;
    }
  }

  get client(): TraderClientInterface {
    if (!this.tradeClient) {
      throw new Error('client is undefined, did you miss to call connect()?');
    }
    return this.tradeClient!;
  }
}
