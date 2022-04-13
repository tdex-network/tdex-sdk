import { TradeCore, TradeInterface, TradeOpts } from 'tradeCore';
import { TraderClient } from 'grpcClient';

export class Trade extends TradeCore implements TradeInterface {
  constructor(args: TradeOpts, torProxyEndpoint?: string) {
    super(
      args,
      (provider: string) => new TraderClient(provider, torProxyEndpoint)
    );
  }
}
