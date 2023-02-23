import { TraderClient } from './client.web';
import { TradeCore, TradeInterface, TradeOpts } from './tradeCore';
import { Tdexv1ContentType } from './api-spec/openapi/swagger/transport/data-contracts';
import TraderClientInterface from './clientInterface';

export type ConnectionOpts = {
  torProxyEndpoint?: string;
  clientTypePriority?: Tdexv1ContentType[];
};

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
