import Core, { CoreInterface } from './core';
import { UtxoInterface, IdentityInterface, CoinSelector } from 'ldk';
import TraderClientInterface from './grpcClientInterface';
export interface MarketInterface {
    baseAsset: string;
    quoteAsset: string;
}
export interface TradeInterface extends CoreInterface {
    utxos: Array<UtxoInterface>;
    coinSelector: CoinSelector;
}
export declare enum TradeType {
    BUY = 0,
    SELL = 1
}
export interface TradeOpts {
    providerUrl: string;
    explorerUrl: string;
    utxos: Array<UtxoInterface>;
    coinSelector: CoinSelector;
}
export interface BuySellOpts {
    market: MarketInterface;
    amount: number;
    asset: string;
    identity: IdentityInterface;
}
declare type TraderClientInterfaceFactory = (providerUrl: string) => TraderClientInterface;
export declare class TradeCore extends Core implements TradeInterface {
    grpcClient: TraderClientInterface;
    utxos: Array<UtxoInterface>;
    coinSelector: CoinSelector;
    constructor(args: TradeOpts, factoryTraderClient: TraderClientInterfaceFactory);
    validate(args: TradeOpts): void;
    /**
     * Trade.buy let the trader buy the baseAsset,
     * sending his own quoteAsset using the current market price
     */
    buy({ market, amount, asset, identity }: BuySellOpts): Promise<string>;
    /**
     * Trade.sell let the trader sell the baseAsset,
     * receiving the quoteAsset using the current market price
     */
    sell({ market, amount, asset, identity, }: BuySellOpts): Promise<string>;
    preview({ market, tradeType, amount, asset, }: {
        market: MarketInterface;
        tradeType: TradeType;
        amount: number;
        asset: string;
    }): Promise<{
        assetToBeSent: string;
        amountToBeSent: number;
        assetToReceive: string;
        amountToReceive: number;
    }>;
    private marketOrderRequest;
    private marketOrderComplete;
}
export {};
