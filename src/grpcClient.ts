import * as grpc from '@grpc/grpc-js';
import * as services from 'tdex-protobuf/generated/js/trade_grpc_pb';
import * as messages from 'tdex-protobuf/generated/js/trade_pb';
import * as types from 'tdex-protobuf/generated/js/types_pb';
import { SwapRequest, SwapComplete } from 'tdex-protobuf/generated/js/swap_pb';

import TraderClientInterface from './grpcClientInterface';

export class TraderClient implements TraderClientInterface {
  providerUrl: string;
  client: services.TradeClient;

  constructor(providerUrlString: string) {
    let creds = grpc.credentials.createInsecure();

    this.providerUrl = providerUrlString;
    const url = new URL(providerUrlString);
    this.client = new services.TradeClient(this.providerUrl, creds);

    if (url.protocol.includes('https')) {
      creds = grpc.credentials.createSsl();
      this.client = new services.TradeClient(url.host, creds);
    }
  }
  /**
   * tradePropose
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */
  tradePropose(
    { baseAsset, quoteAsset }: types.Market.AsObject,
    tradeType: number,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array> {
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
        rejectIfSwapFail(reply, reject);
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
  tradeComplete(swapCompleteSerialized: Uint8Array): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = new messages.TradeCompleteRequest();
      request.setSwapComplete(
        SwapComplete.deserializeBinary(swapCompleteSerialized)
      );
      const call = this.client.tradeComplete(request);
      let data: string;
      call.on('data', (reply: messages.TradeCompleteReply) => {
        rejectIfSwapFail(reply, reject);
        data = reply!.getTxid();
      });
      call.on('end', () => resolve(data));
      call.on('error', (e: any) => reject(e));
    });
  }

  markets(): Promise<
    Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>
  > {
    return new Promise((resolve, reject) => {
      this.client.markets(new messages.MarketsRequest(), (err, response) => {
        if (err) return reject(err);
        const list = response!
          .getMarketsList()
          .map((mktWithFee: types.MarketWithFee) => ({
            baseAsset: mktWithFee!.getMarket()!.getBaseAsset(),
            quoteAsset: mktWithFee!.getMarket()!.getQuoteAsset(),
            feeBasisPoint: mktWithFee!.getFee()!.getBasisPoint(),
          }));
        resolve(list);
      });
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
  ): Promise<Array<types.PriceWithFee.AsObject>> {
    const market = new types.Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    const request = new messages.MarketPriceRequest();
    request.setMarket(market);
    request.setType(tradeType);
    request.setAmount(amount);
    request.setAsset(asset);

    return new Promise((resolve, reject) => {
      this.client.marketPrice(request, (err, response) => {
        if (err) return reject(err);

        const list = response
          .getPricesList()
          .map((priceWithFee: types.PriceWithFee) => priceWithFee.toObject());

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
  }): Promise<Array<types.BalanceWithFee.AsObject>> {
    const market = new types.Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    const request = new messages.BalancesRequest();
    request.setMarket(market);

    return new Promise((resolve, reject) => {
      this.client.balances(request, (err, response) => {
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

export function rejectIfSwapFail(
  tradeReply: messages.TradeProposeReply | messages.TradeCompleteReply,
  reject: (reason?: any) => void
) {
  const swapFail = tradeReply.getSwapFail();
  if (swapFail) {
    const errorMessage = `SwapFail for message id=${swapFail.getId()}. Failure code ${swapFail.getFailureCode()} | reason: ${swapFail.getFailureMessage()}`;
    reject(errorMessage);
  }
}
