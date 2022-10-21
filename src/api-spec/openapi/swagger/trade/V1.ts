/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import {
  RpcStatus,
  V1CompleteTradeRequest,
  V1CompleteTradeResponse,
  V1GetMarketBalanceRequest,
  V1GetMarketBalanceResponse,
  V1ListMarketsResponse,
  V1PreviewTradeRequest,
  V1PreviewTradeResponse,
  V1ProposeTradeRequest,
  V1ProposeTradeResponse,
} from './data-contracts';
import { ContentType, HttpClient, RequestParams } from './http-client';

export class V1<
  SecurityDataType = unknown
> extends HttpClient<SecurityDataType> {
  /**
 * No description
 * 
 * @tags TradeService
 * @name TradeServiceGetMarketBalance
 * @summary GetMarketBalance retutns the balance of the two current reserves of the
given market.
 * @request POST:/v1/market/balance
 */
  tradeServiceGetMarketBalance = (
    body: V1GetMarketBalanceRequest,
    params: RequestParams = {}
  ) =>
    this.request<V1GetMarketBalanceResponse, RpcStatus>({
      path: `/v1/market/balance`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
  /**
   * No description
   *
   * @tags TradeService
   * @name TradeServiceListMarkets
   * @summary ListMarkets lists all the markets open for trading.
   * @request POST:/v1/markets
   */
  tradeServiceListMarkets = (params: RequestParams = {}) =>
    this.request<V1ListMarketsResponse, RpcStatus>({
      path: `/v1/markets`,
      method: 'POST',
      format: 'json',
      ...params,
    }); /**
 * No description
 * 
 * @tags TradeService
 * @name TradeServiceCompleteTrade
 * @summary CompleteTrade can be used by the trader to let the daemon finalizing,
extracting, and broadcasting the swap transaction, once he's signed his
inputs.
This is not mandatory, the trader can do the steps above on his own
alternatively.
 * @request POST:/v1/trade/complete
 */
  tradeServiceCompleteTrade = (
    body: V1CompleteTradeRequest,
    params: RequestParams = {}
  ) =>
    this.request<V1CompleteTradeResponse, RpcStatus>({
      path: `/v1/trade/complete`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    }); /**
 * @description The trade type can assume values BUY or SELL and it always refer to the fixed base asset. For example: * if trade type is BUY, it means the trader wants to buy base asset funds. * if trade type is SELL, it means the trader wants to sell base asset funds.
 * 
 * @tags TradeService
 * @name TradeServicePreviewTrade
 * @summary PreviewTrade returns a counter amount and asset in response to the
provided ones and a trade type for a market.
 * @request POST:/v1/trade/preview
 */
  tradeServicePreviewTrade = (
    body: V1PreviewTradeRequest,
    params: RequestParams = {}
  ) =>
    this.request<V1PreviewTradeResponse, RpcStatus>({
      path: `/v1/trade/preview`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    }); /**
 * No description
 * 
 * @tags TradeService
 * @name TradeServiceProposeTrade
 * @summary ProposeTrade allows a trader to present a SwapRequest. The service answers
with a SwapAccept, filling the request's partial transaction, + an
expiration time to complete the swap when accepting the swap, or,
otherwise, with a SwapFail containg the reason for the rejection of the
proposal.
 * @request POST:/v1/trade/propose
 */
  tradeServiceProposeTrade = (
    body: V1ProposeTradeRequest,
    params: RequestParams = {}
  ) =>
    this.request<V1ProposeTradeResponse, RpcStatus>({
      path: `/v1/trade/propose`,
      method: 'POST',
      body: body,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
