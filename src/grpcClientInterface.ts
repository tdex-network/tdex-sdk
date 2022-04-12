import {
  BalanceWithFee,
  Market,
  Preview,
  TradeType,
} from 'api-spec/protobuf/gen/js/tdex/v1/types_pb';

export default interface TraderClientInterface {
  providerUrl: string;
  client: any;
  tradePropose(
    { baseAsset, quoteAsset }: Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array>;
  tradeComplete(swapCompleteSerialized: Uint8Array): Promise<string>;
  proposeTrade(
    { baseAsset, quoteAsset }: Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array>;
  completeTrade(swapCompleteSerialized: Uint8Array): Promise<string>;
  markets(): Promise<
    Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>
  >;
  marketPrice(
    { baseAsset, quoteAsset }: Market,
    tradeType: TradeType,
    amount: number,
    asset: string
  ): Promise<Preview[]>;
  balances({ baseAsset, quoteAsset }: Market): Promise<BalanceWithFee[]>;
}
