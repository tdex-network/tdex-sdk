import { TradeCore, TradeInterface, TradeOpts } from './trade-core';
import { TraderClient } from './grpcClient';

export class Trade extends TradeCore implements TradeInterface {
  constructor(args: TradeOpts) {
    super(args, (provider: string) => new TraderClient(provider));
  }
}
