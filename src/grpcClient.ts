import * as grpc from '@grpc/grpc-js';
import * as services from 'api-spec/protobuf/gen/js/tdex/v1/trade_pb.grpc-client';
import * as messages from 'api-spec/protobuf/gen/js/tdex/v1/trade_pb';
import * as types from 'api-spec/protobuf/gen/js/tdex/v1/types_pb';
import {
  SwapRequest,
  SwapComplete,
  SwapAccept,
} from 'api-spec/protobuf/gen/js/tdex/v1/swap_pb';
import TraderClientInterface from './grpcClientInterface';
import { rejectIfSwapFail } from 'utils';
import { TradeType } from 'api-spec/protobuf/gen/js/tdex/v1/types_pb';

export class TraderClient implements TraderClientInterface {
  providerUrl: string;

  client: services.ITradeServiceClient;

  constructor(
    providerUrlString: string,
    // @ts-ignore
    torProxyEndpoint?: string
  ) {
    let creds = grpc.credentials.createInsecure();
    this.providerUrl = providerUrlString;
    const url = new URL(providerUrlString);
    this.client = new services.TradeServiceClient(this.providerUrl, creds);
    if (url.protocol.includes('https')) {
      creds = grpc.credentials.createSsl();
      this.client = new services.TradeServiceClient(url.host, creds);
    }
  }

  /**
   * tradePropose
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */
  tradePropose(
    { baseAsset, quoteAsset }: types.Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const market = types.Market.create({ baseAsset, quoteAsset });
      const request = messages.ProposeTradeRequest.create({
        market: market,
        type: tradeType,
        swapRequest: SwapRequest.fromBinary(swapRequestSerialized),
      });
      const call = this.client.proposeTrade(request, err => console.error(err));
      let data: Uint8Array;
      call.on('data', (reply: messages.ProposeTradeResponse) => {
        if (rejectIfSwapFail(reply, reject)) {
          return;
        }
        const swapAcceptMsg = reply!.swapAccept;
        data = SwapAccept.toBinary(swapAcceptMsg!);
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
      const request = messages.CompleteTradeRequest.create({
        swapComplete: SwapComplete.fromBinary(swapCompleteSerialized),
      });
      const call = this.client.completeTrade(request, err =>
        console.error(err)
      );
      let data: string;
      call.on('data', (reply: messages.CompleteTradeResponse) => {
        if (rejectIfSwapFail(reply, reject)) {
          return;
        }
        data = reply!.txid;
      });
      call.on('end', () => resolve(data));
      call.on('error', (e: any) => reject(e));
    });
  }

  /**
   * proposeTrade
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */
  proposeTrade(
    { baseAsset, quoteAsset }: types.Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const market = types.Market.create({ baseAsset, quoteAsset });
      const request = messages.ProposeTradeRequest.create({
        market: market,
        type: tradeType,
        swapRequest: SwapRequest.fromBinary(swapRequestSerialized),
      });
      this.client.proposeTrade(request, (err, response) => {
        if (err) return reject(err);
        if (rejectIfSwapFail(response!, reject)) {
          return;
        }
        const swapAcceptMsg = response!.swapAccept;
        const data = SwapAccept.toBinary(swapAcceptMsg!);
        return resolve(data);
      });
    });
  }

  /**
   * completeTrade
   * @param swapCompleteSerialized
   */
  completeTrade(swapCompleteSerialized: Uint8Array): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = messages.CompleteTradeRequest.create({
        swapComplete: SwapComplete.fromBinary(swapCompleteSerialized),
      });
      this.client.completeTrade(request, (err, response) => {
        if (err) return reject(err);
        if (rejectIfSwapFail(response!, reject)) {
          return;
        }
        return resolve(response!.txid);
      });
    });
  }

  markets(): Promise<
    Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>
  > {
    return new Promise((resolve, reject) => {
      this.client.listMarkets(
        messages.ListMarketsRequest.create(),
        (err, response) => {
          if (err) return reject(err);
          const list = response!.markets.map(
            (mktWithFee: types.MarketWithFee) => ({
              baseAsset: mktWithFee!.market!.baseAsset,
              quoteAsset: mktWithFee!.market!.quoteAsset,
              feeBasisPoint: Number(mktWithFee!.fee!.basisPoint),
            })
          );
          resolve(list);
        }
      );
    });
  }

  marketPrice(
    { baseAsset, quoteAsset }: types.Market,
    tradeType: TradeType,
    amount: number,
    asset: string
  ): Promise<Array<types.Preview>> {
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.PreviewTradeRequest.create({
      market: market,
      type: tradeType,
      amount: BigInt(amount),
      asset: asset,
    });
    return new Promise((resolve, reject) => {
      this.client.previewTrade(request, (err, response) => {
        if (err) return reject(err);
        const list = response!.previews.map(
          (preview: types.Preview) => preview
        );
        resolve(list);
      });
    });
  }

  balance({
    baseAsset,
    quoteAsset,
  }: types.Market): Promise<types.BalanceWithFee> {
    const market = types.Market.create({ baseAsset, quoteAsset });
    const request = messages.GetMarketBalanceRequest.create({ market });
    return new Promise((resolve, reject) => {
      this.client.getMarketBalance(request, (err, response) => {
        if (err) return reject(err);
        resolve(response!.balance!);
      });
    });
  }
}
