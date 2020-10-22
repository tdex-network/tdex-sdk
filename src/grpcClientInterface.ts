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
  ): Promise<any>;
  tradeComplete(swapCompleteSerialized: Uint8Array): Promise<any>;
  markets(): Promise<Array<any>>;
  marketPrice(
    {
      baseAsset,
      quoteAsset,
    }: {
      baseAsset: string;
      quoteAsset: string;
    },
    tradeType: number,
    amount: number
  ): Promise<Array<any>>;
  balances({
    baseAsset,
    quoteAsset,
  }: {
    baseAsset: string;
    quoteAsset: string;
  }): Promise<Array<any>>;
}
