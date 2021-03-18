import { TraderClient } from './grpcClient.web';
import { TradeCore, TradeInterface, TradeOpts } from './trade-core';

export class Trade extends TradeCore implements TradeInterface {
  constructor(args: TradeOpts) {
    super(args, (provider: string) => new TraderClient(provider));
  }
}
