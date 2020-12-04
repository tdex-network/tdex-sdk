import * as services from 'tdex-protobuf/generated/js/TradeServiceClientPb';
import * as messages from 'tdex-protobuf/generated/js/trade_pb';
import * as types from 'tdex-protobuf/generated/js/types_pb';
import { SwapRequest, SwapComplete } from 'tdex-protobuf/generated/js/swap_pb';

import TraderClientInterface from './grpcClientInterface';

export class TraderClient implements TraderClientInterface {
  providerUrl: string;
  client: services.TradeClient;

  constructor(providerUrl: string) {
    this.providerUrl = providerUrl;
    this.client = new services.TradeClient(providerUrl);
  }

  /**
   * tradePropose
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */
  tradePropose(
    { baseAsset, quoteAsset }: any,
    tradeType: number,
    swapRequestSerialized: Uint8Array
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const market = new types.Market();
      market.setBaseAsset(baseAsset);
      market.setQuoteAsset(quoteAsset);

      const request = new messages.TradeProposeRequest();
      request.setMarket(market);
      request.setType(tradeType);
      request.setSwapRequest(
        SwapRequest.deserializeBinary(swapRequestSerialized)
      );

      const call = this.client.tradePropose(request);

      let data: Uint8Array;
      call.on('data', (reply: messages.TradeProposeReply) => {
        throwErrorIfSwapFail(reply);
        const swapAcceptMsg = reply!.getSwapAccept();
        data = swapAcceptMsg!.serializeBinary();
      });

      call.on('end', () => resolve(data));
      call.on('error', (e: any) => reject(e));
    });
  }

  /**
   * tradeComplete
   * @param swapCompleteSerialized
   */
  tradeComplete(swapCompleteSerialized: Uint8Array): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new messages.TradeCompleteRequest();
      request.setSwapComplete(
        SwapComplete.deserializeBinary(swapCompleteSerialized)
      );
      const call = this.client.tradeComplete(request);
      let data: string;
      call.on('data', (reply: messages.TradeCompleteReply) => {
        throwErrorIfSwapFail(reply);
        data = reply!.getTxid();
      });
      call.on('end', () => resolve(data));
      call.on('error', (e: any) => reject(e));
    });
  }

  markets(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.client.markets(
        new messages.MarketsRequest(),
        null,
        (err, response) => {
          if (err) return reject(err);
          const list = response!
            .getMarketsList()
            .map((item: any) => item!.getMarket())
            .map((market: any) => ({
              baseAsset: market!.getBaseAsset(),
              quoteAsset: market!.getQuoteAsset(),
            }));
          resolve(list);
        }
      );
    });
  }

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
  ): Promise<Array<any>> {
    const market = new types.Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    const request = new messages.MarketPriceRequest();
    request.setMarket(market);
    request.setType(tradeType);
    request.setAmount(amount);
    request.setAsset(asset);

    return new Promise((resolve, reject) => {
      this.client.marketPrice(request, null, (err, response) => {
        if (err) return reject(err);

        const list = response
          .getPricesList()
          .map((mktWithFee: types.PriceWithFee) => mktWithFee.toObject());

        resolve(list);
      });
    });
  }

  balances({
    baseAsset,
    quoteAsset,
  }: {
    baseAsset: string;
    quoteAsset: string;
  }): Promise<any> {
    const market = new types.Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    const request = new messages.BalancesRequest();
    request.setMarket(market);

    return new Promise((resolve, reject) => {
      this.client.balances(request, null, (err, response) => {
        if (err) return reject(err);

        const reply = response
          .getBalancesList()
          .map((balanceWithFee: types.BalanceWithFee) =>
            balanceWithFee.toObject()
          );

        resolve(reply);
      });
    });
  }
}

export function throwErrorIfSwapFail(
  tradeReply: messages.TradeProposeReply | messages.TradeCompleteReply
) {
  const swapFail = tradeReply.getSwapFail();
  if (swapFail) {
    const errorMessage = `SwapFail for message id=${swapFail.getId()}. Failure code ${swapFail.getFailureCode()} | reason: ${swapFail.getFailureMessage()}`;
    throw new Error(errorMessage);
  }
}
