import * as services from 'tdex-protobuf/generated/js/trade_grpc_pb';
import * as messages from 'tdex-protobuf/generated/js/trade_pb';
import * as types from 'tdex-protobuf/generated/js/types_pb';
import TraderClientInterface from './grpcClientInterface';
export declare class TraderClient implements TraderClientInterface {
    providerUrl: string;
    client: services.TradeClient;
    constructor(providerUrlString: string);
    /**
     * tradePropose
     * @param market
     * @param tradeType
     * @param swapRequestSerialized
     */
    tradePropose({ baseAsset, quoteAsset }: types.Market.AsObject, tradeType: number, swapRequestSerialized: Uint8Array): Promise<Uint8Array>;
    /**
     * tradeComplete
     * @param swapCompleteSerialized
     */
    tradeComplete(swapCompleteSerialized: Uint8Array): Promise<string>;
    markets(): Promise<Array<{
        baseAsset: string;
        quoteAsset: string;
        feeBasisPoint: number;
    }>>;
    marketPrice({ baseAsset, quoteAsset, }: {
        baseAsset: string;
        quoteAsset: string;
    }, tradeType: number, amount: number, asset: string): Promise<Array<types.PriceWithFee.AsObject>>;
    balances({ baseAsset, quoteAsset, }: {
        baseAsset: string;
        quoteAsset: string;
    }): Promise<Array<types.BalanceWithFee.AsObject>>;
}
export declare function throwErrorIfSwapFail(tradeReply: messages.TradeProposeReply | messages.TradeCompleteReply): void;
