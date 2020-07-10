import Core, { CoreInterface } from './core';
export interface MarketInterface {
    baseAsset: string;
    quoteAsset: string;
}
export declare enum TradeType {
    BUY = 0,
    SELL = 1
}
export declare class Trade extends Core implements CoreInterface {
    private grpcClient;
    constructor(args: CoreInterface);
    /**
     * Trade.buy let the trder buy the baseAsset,
     * sending his own quoteAsset using the current market price
     */
    buy({ market, amount, address, privateKey, }: {
        market: MarketInterface;
        amount: number;
        address?: string;
        privateKey?: string;
    }): Promise<Uint8Array | string>;
    /**
     * Trade.sell let the trder sell the baseAsset,
     * receiving the quoteAsset using the current market price
     */
    sell({ market, amount, address, privateKey, }: {
        market: MarketInterface;
        amount: number;
        address?: string;
        privateKey?: string;
    }): Promise<Uint8Array | string>;
    preview(market: MarketInterface, tradeType: TradeType, amountInSatoshis: number): Promise<any>;
    private marketOrderRequest;
    private marketOrderComplete;
}
