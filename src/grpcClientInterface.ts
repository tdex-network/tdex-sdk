export default interface TraderClientInterface {
  providerUrl: string;
  client: any;
  tradePropose(
    {
      baseAsset,
      quoteAsset,
    }: {
      baseAsset: string;
      quoteAsset: string;
    },
    tradeType: number,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array>;
  tradeComplete(swapCompleteSerialized: Uint8Array): Promise<string>;
  markets(): Promise<
    Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>
  >;
  marketPrice(
    {
      baseAsset,
      quoteAsset,
    }: {
      baseAsset: string;
      quoteAsset: string;
    },
    tradeType: number,
    amount: number,
    asset: string
  ): Promise<
    Array<{
      price?: { basePrice: number; quotePrice: number };
      fee?: { basisPoint: number };
      amount: number;
      asset: string;
    }>
  >;
  balances({
    baseAsset,
    quoteAsset,
  }: {
    baseAsset: string;
    quoteAsset: string;
  }): Promise<
    Array<{
      balance?: { baseAmount: number; quoteAmount: number };
      fee?: { basisPoint: number };
    }>
  >;
}
