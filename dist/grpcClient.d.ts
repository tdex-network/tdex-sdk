import * as services from 'tdex-protobuf/js/trade_grpc_pb';
export declare class TraderClient {
    providerUrl: string;
    client: services.TradeClient;
    constructor(providerUrl: string);
    /**
     * tradePropose
     * @param market
     * @param tradeType
     * @param swapRequestSerialized
     */
    tradePropose({ baseAsset, quoteAsset }: any, tradeType: number, swapRequestSerialized: Uint8Array): Promise<any>;
    /**
     * tradeComplete
     * @param swapCompleteSerialized
     */
    tradeComplete(swapCompleteSerialized: Uint8Array): Promise<any>;
    markets(): Promise<Array<any>>;
    balances({ baseAsset, quoteAsset, }: {
        baseAsset: string;
        quoteAsset: string;
    }): Promise<any>;
}
