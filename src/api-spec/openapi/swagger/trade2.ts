import TraderClientInterface from "grpcClientInterface";
import {BalanceWithFee, Market, Preview, TradeType} from "api-spec/protobuf/gen/js/tdex/v1/types_pb";
import {SwapRequest} from "api-spec/protobuf/gen/js/tdex/v1/swap_pb";

export class TradeServiceHttp implements TraderClientInterface {
  client: any;
  providerUrl: string;

  constructor(providerUrlString: string) {
    this.providerUrl = providerUrlString;
  }

  async completeTrade(swapCompleteSerialized: Uint8Array): Promise<string> {
    const path = `/v1/trade/complete`;
    const response = await fetch(this.providerUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swapCompleteSerialized),
    })
    const str = await response.text()
    console.log('completeTrade', str);
    return str
  }

  async proposeTrade(market: Market, tradeType: TradeType, swapRequestSerialized: Uint8Array): Promise<Uint8Array> {
    const path = `/v1/trade/propose`;
    const response = await fetch(this.providerUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market: market,
        type: tradeType.toString(),
        swapRequest: SwapRequest.fromBinary(swapRequestSerialized),
      }),
    })
    const str = await response.json()
    console.log('proposeTrade', str);
    return str
  }



  async balance(market: Market): Promise<BalanceWithFee> {
    const path = `/v1/trade/balance`;
    const response = await fetch(this.providerUrl + path, {
      method: 'POST', body: JSON.stringify(market),
    })
    const balanceWithFee = await response.json()
    console.log('balance', balanceWithFee);
    return balanceWithFee
  }

  async marketPrice(market: Market, tradeType: TradeType, amount: number, asset: string): Promise<Preview[]> {
    const path = `/v1/trade/preview`;
    const response = await fetch(this.providerUrl + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market,
        type: tradeType.toString(),
        amount,
        asset
      }),
    })
    const previewArray = await response.json()
    console.log('marketPrice', previewArray);
    return previewArray
  }

  async markets(): Promise<Array<{ baseAsset: string; quoteAsset: string; feeBasisPoint: number }>> {
    const path = `/v1/markets`;
    const response = await fetch(this.providerUrl + path)
    const markets = await response.json()
    console.log('markets', markets);
    return markets
  }
}