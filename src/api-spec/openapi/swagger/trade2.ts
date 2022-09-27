import TraderClientInterface from "grpcClientInterface";
import {BalanceWithFee, Market, Preview, TradeType} from "../../protobuf/gen/js/tdex/v1/types_pb";
import {SwapRequest} from "../../protobuf/gen/js/tdex/v1/swap_pb";
import axios from "axios";

export class TradeServiceHttp implements TraderClientInterface {
  client: any;
  providerUrl: string;

  constructor(providerUrlString: string) {
    this.providerUrl = providerUrlString;
  }

  async completeTrade(swapCompleteSerialized: Uint8Array): Promise<string> {
    const path = `/v1/trade/complete`;
    const response = await axios.post(this.providerUrl + path, {
     swapCompleteSerialized,
    })
    const str = await response.data
    console.log('completeTrade', str);
    return str
  }

  async proposeTrade(market: Market, tradeType: TradeType, swapRequestSerialized: Uint8Array): Promise<Uint8Array> {
    const path = `/v1/trade/propose`;
    const response = await axios.post(this.providerUrl + path, {
        market: market,
        type: tradeType.toString(),
        swapRequest: SwapRequest.toJsonString(SwapRequest.fromBinary(swapRequestSerialized)),
      })
    const str = await response.data
    console.log('proposeTrade', str);
    return str
  }

  async balance(market: Market): Promise<BalanceWithFee> {
    const path = `/v1/trade/balance`;
    const response = await axios.post(this.providerUrl + path, {market})
    const balanceWithFee = await response.data
    console.log('balance', balanceWithFee);
    return balanceWithFee
  }

  async marketPrice(market: Market, tradeType: TradeType, amount: number, asset: string): Promise<Preview[]> {
    const path = `/v1/trade/preview`;
    const response = await axios.post(this.providerUrl + path, {
        market,
        type: tradeType.toString(),
        amount,
        asset
    })
    const previewArray = await response.data
    console.log('marketPrice', previewArray);
    return previewArray
  }

  async markets(): Promise<Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>> {
    const path = `/v1/markets`;
    const response = await axios.post(this.providerUrl + path)
    const markets = await response.data
    console.log('markets', markets);
    return markets
  }
}