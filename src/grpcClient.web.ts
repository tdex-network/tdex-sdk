import * as services from './api-spec/protobuf/gen/js/tdex/v1/TradeServiceClientPb';
import * as messages from './api-spec/protobuf/gen/js/tdex/v1/trade_pb';
import * as types from './api-spec/protobuf/gen/js/tdex/v1/types_pb';
import { SwapRequest, SwapComplete } from './api-spec/protobuf/gen/js/tdex/v1/swap_pb';
import TraderClientInterface from './grpcClientInterface';
import { getClearTextTorProxyUrl, rejectIfSwapFail } from './utils';

const DEFAULT_TOR_PROXY = 'https://proxy.tdex.network';

export class TraderClient implements TraderClientInterface {
  providerUrl: string;
  client: services.TradeClient;

  constructor(
    providerUrl: string,
    torProxyEndpoint: string = DEFAULT_TOR_PROXY
  ) {
    this.providerUrl = providerUrl;
    const url = new URL(providerUrl);

    // we assume we are in Liquid mainnet
    // TODO check if socks5 proxy is running (ie. Tor Browser)
    if (url.hostname.includes('onion') && !url.protocol.includes('https')) {
      // We use the HTTP1 cleartext endpoint here provided by the public tor reverse proxy
      // https://pkg.go.dev/github.com/tdex-network/tor-proxy@v0.0.3/pkg/torproxy#NewTorProxy
      //host:port/<just_onion_host_without_dot_onion>/[<grpc_package>.<grpc_service>/<grpc_method>]
      this.providerUrl = getClearTextTorProxyUrl(torProxyEndpoint, url);
    }

    this.client = new services.TradeClient(this.providerUrl);
  }

  /**
   * tradePropose
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */
  tradePropose(
    { baseAsset, quoteAsset }: types.Market.AsObject,
    tradeType: messages.TradeType,
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
        if (rejectIfSwapFail(reply, reject)) {
          return;
        }
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
        if (rejectIfSwapFail(reply, reject)) {
          return;
        }
        data = reply!.getTxid();
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
    { baseAsset, quoteAsset }: types.Market.AsObject,
    tradeType: messages.TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const market = new types.Market();
      market.setBaseAsset(baseAsset);
      market.setQuoteAsset(quoteAsset);

      const request = new messages.ProposeTradeRequest();
      request.setMarket(market);
      request.setType(tradeType);
      request.setSwapRequest(
        SwapRequest.deserializeBinary(swapRequestSerialized)
      );

      this.client.proposeTrade(request, null, (err, response) => {
        if (err) return reject(err);
        if (rejectIfSwapFail(response!, reject)) {
          return;
        }
        const swapAcceptMsg = response!.getSwapAccept();
        const data = swapAcceptMsg!.serializeBinary();
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
      const request = new messages.CompleteTradeRequest();
      request.setSwapComplete(
        SwapComplete.deserializeBinary(swapCompleteSerialized)
      );
      this.client.completeTrade(request, null, (err, response) => {
        if (err) return reject(err);
        if (rejectIfSwapFail(response!, reject)) {
          return;
        }
        return resolve(response!.getTxid());
      });
    });
  }

  markets(): Promise<
    Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>
  > {
    return new Promise((resolve, reject) => {
      this.client.markets(
        new messages.MarketsRequest(),
        null,
        (err, response) => {
          if (err) return reject(err);
          const list = response!
            .getMarketsList()
            .map((mktWithFee: types.MarketWithFee) => ({
              baseAsset: mktWithFee!.getMarket()!.getBaseAsset(),
              quoteAsset: mktWithFee!.getMarket()!.getQuoteAsset(),
              feeBasisPoint: mktWithFee!.getFee()!.getBasisPoint(),
            }));
          resolve(list);
        }
      );
    });
  }

  marketPrice(
    { baseAsset, quoteAsset }: types.Market.AsObject,
    tradeType: messages.TradeType,
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
  }: types.Market.AsObject): Promise<types.BalanceWithFee.AsObject[]> {
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
