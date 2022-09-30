import { ContentType } from './api-spec/openapi/swagger/transport/http-client';
import { V1ContentType } from './api-spec/openapi/swagger/transport/data-contracts';
import { V1 } from './api-spec/openapi/swagger/transport/V1';
import { DEFAULT_TOR_PROXY, getClearTextTorProxyUrl } from './utils';

export class TransportClient {
  client: V1<unknown>;
  providerUrl: string;

  constructor(
    providerUrl: string,
    torProxyEndpoint: string = DEFAULT_TOR_PROXY
  ) {
    this.providerUrl = providerUrl;
    const url = new URL(providerUrl);

    // we assume we are in Liquid mainnet
    // TODO check if socks5 proxy is running (ie. Tor Browser)
    if (url.hostname.includes('onion') && !url.protocol.includes('https')) {
      // We use the HTTP1 cleartext endpoint here provided by the public tor reverse proxy
      // https://pkg.go.dev/github.com/tdex-network/tor-proxy@v0.0.3/pkg/torproxy#NewTorProxy
      //host:port/<just_onion_host_without_dot_onion>/[<grpc_package>.<grpc_service>/<grpc_method>]
      this.providerUrl = getClearTextTorProxyUrl(torProxyEndpoint, url);
    }

    this.client = new V1({ baseURL: this.providerUrl });
  }

  async supportedContentTypes(): Promise<V1ContentType[]> {
    try {
      const {
        data: { acceptedTypes },
      } = await this.client.transportServiceSupportedContentTypes({
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
}
