import { Trade as TradeNode } from './trade';
import { TraderClient } from './grpcClient.web';

export enum TradeType {
  BUY = 0,
  SELL = 1,
}

export class Trade extends TradeNode {
  constructor(args: any) {
    super(args);

    this.validate(args);
    this.setIdentity(args.identity);

    this.grpcClient = new TraderClient(this.providerUrl!);
  }
}
