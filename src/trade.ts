import { TraderClient } from './client';
import TraderClientInterface from './clientInterface';
import { TradeCore, TradeInterface, TradeOpts } from './tradeCore';

export class Trade extends TradeCore implements TradeInterface {
  constructor(
    args: TradeOpts,
    torProxyEndpoint?: string,
    client?: TraderClientInterface
  ) {
    super(
      args,
      (provider: string) =>
        client || new TraderClient(provider, torProxyEndpoint)
    );
  }
}
