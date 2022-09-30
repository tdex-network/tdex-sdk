import { V1TradeType } from './api-spec/openapi/swagger/trade/data-contracts';
import { ContentType } from './api-spec/openapi/swagger/trade/http-client';
import { V1 } from './api-spec/openapi/swagger/trade/V1';
import {
  SwapAccept,
  SwapComplete,
  SwapRequest,
} from './api-spec/protobuf/gen/js/tdex/v1/swap_pb';
import {
  BalanceWithFee,
  Market,
  Preview,
} from './api-spec/protobuf/gen/js/tdex/v1/types_pb';
import TraderClientInterface from './clientInterface';
import { TradeType } from './tradeCore';
import { DEFAULT_TOR_PROXY, getClearTextTorProxyUrl } from './utils';

export class TraderClient implements TraderClientInterface {
  client: V1<unknown>;
  providerUrl: string;

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

    this.client = new V1({ baseURL: this.providerUrl });
  }

  async completeTrade(swapCompleteSerialized: Uint8Array): Promise<string> {
    const swapComplete = SwapComplete.fromBinary(swapCompleteSerialized);

    try {
      const {
        data: { txid, swapFail },
      } = await this.client.tradeServiceCompleteTrade(
        { swapComplete },
        { headers: { 'Content-Type': ContentType.Json } }
      );
      if (swapFail) {
        const errorMessage = `SwapFail for message id=${
          swapFail!.id
        }. Failure code ${swapFail!.failureCode} | reason: ${
          swapFail!.failureMessage
        }`;
        throw new Error(errorMessage);
      }
      return txid!;
    } catch (e) {
      // @ts-ignore
      const err = e as Error | AxiosError;
      if (err.response) {
        throw new Error(err.response.data.message);
      }
      throw e;
    }
  }

  async proposeTrade(
    market: Market,
    tradeType: TradeType,
    swapRequestSerialized: Uint8Array
  ): Promise<Uint8Array> {
    const swap = SwapRequest.fromBinary(swapRequestSerialized);
    let inputBlindingKey: { [key: string]: string } = {};
    Object.entries(swap.inputBlindingKey).forEach(([k, v]) => {
      inputBlindingKey[k] = Buffer.from(v).toString('base64');
    });
    let outputBlindingKey: { [key: string]: string } = {};
    Object.entries(swap.outputBlindingKey).forEach(([k, v]) => {
      outputBlindingKey[k] = Buffer.from(v).toString('base64');
    });
    const swapRequest = {
      ...swap,
      inputBlindingKey,
      outputBlindingKey,
    };
    const type =
      tradeType === TradeType.BUY
        ? V1TradeType.TRADE_TYPE_BUY
        : V1TradeType.TRADE_TYPE_SELL;

    try {
      const {
        data: { swapAccept, swapFail },
      } = await this.client.tradeServiceProposeTrade(
        { market, type, swapRequest },
        { headers: { 'Content-Type': ContentType.Json } }
      );
      if (swapFail) {
        const errorMessage = `SwapFail for message id=${swapFail.id}. Failure code ${swapFail.failureCode} | reason: ${swapFail.failureMessage}`;
        throw new Error(errorMessage);
      }
      return SwapAccept.toBinary(
        SwapAccept.fromJson(swapAccept! as { [key: string]: any })
      );
    } catch (e) {
      // @ts-ignore
      const err = e as Error | AxiosError;
      if (err.response) {
        throw new Error(err.response.data.message);
      }
      throw e;
    }
  }

  async balance(market: Market): Promise<BalanceWithFee> {
    try {
      const {
        data: { balance },
      } = await this.client.tradeServiceGetMarketBalance(
        { market },
        { headers: { 'Content-Type': ContentType.Json } }
      );
      if (!balance) return {};

      let fee: any = {
        basisPoint: balance.fee!.basisPoint!,
      };

      if (balance.fee && balance.fee.fixed) {
        fee = {
          ...fee,
          fixed: {
            baseFee: balance.fee!.fixed!.baseFee!,
            quoteFee: balance.fee!.fixed!.quoteFee!,
          },
        };
      }

      return {
        fee,
        balance: {
          baseAmount: balance.balance!.baseAmount!,
          quoteAmount: balance.balance!.quoteAmount!,
        },
      };
    } catch (e) {
      // @ts-ignore
      const err = e as Error | AxiosError;
      if (err.response) {
        throw new Error(err.response.data.message);
      }
      throw e;
    }
  }

  async marketPrice(
    market: Market,
    tradeType: TradeType,
    amount: number,
    asset: string
  ): Promise<Preview[]> {
    const type =
      tradeType === TradeType.BUY
        ? V1TradeType.TRADE_TYPE_BUY
        : V1TradeType.TRADE_TYPE_SELL;
    try {
      const {
        data: { previews },
      } = await this.client.tradeServicePreviewTrade(
        { market, asset, type, amount: amount.toString(10) },
        { headers: { 'Content-Type': ContentType.Json } }
      );
      if (!previews) {
        return [];
      }

      return previews.map(p => {
        const price = {
          basePrice: p.price!.basePrice!,
          quotePrice: p.price!.quotePrice!,
        };
        const balance = {
          baseAmount: p.balance!.baseAmount!,
          quoteAmount: p.balance!.quoteAmount!,
        };
        let fee: any = {
          basisPoint: p.fee!.basisPoint!,
        };
        if (p.fee && p.fee.fixed) {
          fee = {
            ...fee,
            fixed: {
              baseFee: p.fee!.fixed!.baseFee!,
              quoteFee: p.fee!.fixed!.quoteFee!,
            },
          };
        }
        return {
          fee,
          price,
          balance,
          asset: p.asset!,
          amount: p.amount!,
        };
      });
    } catch (e) {
      // @ts-ignore
      const err = e as Error | AxiosError;
      if (err.response) {
        throw new Error(err.response.data.message);
      }
      throw e;
    }
  }

  async markets(): Promise<
    Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>
  > {
    try {
      const {
        data: { markets },
      } = await this.client.tradeServiceListMarkets({
        headers: { 'Content-Type': ContentType.Json },
      });
      if (!markets) {
        return [];
      }

      return markets.map(m => ({
        baseAsset: m.market!.baseAsset!,
        quoteAsset: m.market!.quoteAsset!,
        feeBasisPoint: parseInt(m.fee!.basisPoint!),
      }));
    } catch (e) {
      // @ts-ignore
      const err = e as Error | AxiosError;
      if (err.response) {
        throw new Error(err.response.data.message);
      }
      throw e;
    }
  }
}
