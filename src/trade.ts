import {
  TradeClientType,
  TradeCore,
  TradeInterface,
  TradeOpts,
  TraderClientInterfaceFactory,
} from './tradeCore';
import { TraderClient } from './grpcClient';
import { TraderClientHttp } from './httpClient';

export class Trade extends TradeCore implements TradeInterface {
  constructor(args: TradeOpts, torProxyEndpoint?: string) {
    let factory: TraderClientInterfaceFactory = (provider: string) =>
      new TraderClient(provider, torProxyEndpoint);
    if (args.clientType === TradeClientType.HTTP) {
      factory = (provider: string) => new TraderClientHttp(provider);
    }
    super(args, factory);
  }
}
