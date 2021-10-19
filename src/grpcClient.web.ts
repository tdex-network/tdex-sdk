import * as services from 'tdex-protobuf/generated/js/TradeServiceClientPb';
import * as messages from 'tdex-protobuf/generated/js/trade_pb';
import * as types from 'tdex-protobuf/generated/js/types_pb';
import { SwapRequest, SwapComplete } from 'tdex-protobuf/generated/js/swap_pb';
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
    { baseAsset, quoteAsset }: any,
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

      this.client.tradePropose(request, null, (err, response) => {
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
   * tradeComplete
   * @param swapCompleteSerialized
   */
  tradeComplete(swapCompleteSerialized: Uint8Array): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = new messages.TradeCompleteRequest();
      request.setSwapComplete(
        SwapComplete.deserializeBinary(swapCompleteSerialized)
      );
      this.client.tradeComplete(request, null, (err, response) => {
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
  }): Promise<types.BalanceWithFee.AsObject[]> {
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
