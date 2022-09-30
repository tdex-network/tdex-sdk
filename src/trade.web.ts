import { TraderClient } from './client.web';
import { TraderClient as TraderClientHttp } from './client.http';
import {
  TradeCore,
  TradeInterface,
  TradeOpts,
  TraderClientInterfaceFactory,
} from './tradeCore';
import { TransportClient } from './clientTransport.http';
import { V1ContentType } from './api-spec/openapi/swagger/transport/data-contracts';

export type ConnectionOpts = {
  torProxyEndpoint?: string;
  clientTypePriority?: V1ContentType[];
};

export class Trade extends TradeCore implements TradeInterface {
  static async create(
    args: TradeOpts,
    connectionArgs?: ConnectionOpts
  ): Promise<Trade> {
    const torProxyEndpoint = (connectionArgs || {}).torProxyEndpoint;
    let clientTypePriority = (connectionArgs || {}).clientTypePriority;

    const client = new TransportClient(args.providerUrl, torProxyEndpoint);
    const supportedTypes = await client.supportedContentTypes();
    if (!clientTypePriority) {
      clientTypePriority = [
        V1ContentType.CONTENT_TYPE_JSON,
        V1ContentType.CONTENT_TYPE_GRPCWEB,
        V1ContentType.CONTENT_TYPE_GRPCWEBTEXT,
      ];
    }
    for (let i = 0; i < clientTypePriority.length; i++) {
      const clientType = clientTypePriority[i];
      if (supportedTypes.includes(clientType)) {
        let factory: TraderClientInterfaceFactory = (provider: string) =>
          new TraderClient(provider, torProxyEndpoint);
        if (clientType === V1ContentType.CONTENT_TYPE_JSON) {
          factory = (provider: string) =>
            new TraderClientHttp(provider, torProxyEndpoint);
        }
        return new Trade(args, factory);
      }
    }
    throw new Error('Failed to create new Trade');
  }

  private constructor(
    args: TradeOpts,
    factoryTraderClient: TraderClientInterfaceFactory
  ) {
    super(args, factoryTraderClient);
  }
}
