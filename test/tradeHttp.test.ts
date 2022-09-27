import { Psbt } from 'liquidjs-lib';
import { TradeServiceHttp } from '../src/api-spec/openapi/swagger/trade2';
import { Swap } from '../src';
import { TradeType } from '../src/api-spec/protobuf/gen/js/tdex/v1/types_pb';
import * as fixtures from './fixtures/swap.json';
import tradeFixture from './fixtures/trade.integration.json';

describe('TradeServiceHttp', () => {
  it('propose trade', async () => {
    const fixture = fixtures.confidentialSwaps[0];
    const decodedAcceptPsbt = Psbt.fromBase64(fixture.accept.psbt);
    const trade = new TradeServiceHttp('http://localhost:9945');
    const swap = new Swap();
    // init blind keys maps
    const inKeys: Record<string, Buffer> = {};
    const outKeys: Record<string, Buffer> = {};

    fixture.accept.inputBlindingKeys.forEach((key: string, index: number) => {
      const script: string = decodedAcceptPsbt.data.inputs[
        index
      ].witnessUtxo!.script.toString('hex');
      inKeys[script] = Buffer.from(key, 'hex');
    });

    fixture.accept.outputBlindingKeys.forEach((key: string, index: number) => {
      const script: string = fixture.accept.outputScripts[index];
      outKeys[script] = Buffer.from(key, 'hex');
    });
    const swapRequestSerialized = await swap.request({
      assetToBeSent: fixture.toBeSent.asset,
      amountToBeSent: fixture.toBeSent.amount,
      assetToReceive: fixture.toReceive.asset,
      amountToReceive: fixture.toReceive.amount,
      psetBase64: fixture.request.psbt,
      inputBlindingKeys: inKeys,
      outputBlindingKeys: outKeys,
    });
    const t = await trade.proposeTrade(
      tradeFixture[0].market,
      TradeType.SELL,
      swapRequestSerialized
    );
    console.log('///trade', t);
  });

  it('markets', async () => {
    const trade = new TradeServiceHttp('http://localhost:9945');
    const markets = await trade.markets();
    console.log('///markets', markets);
  });

  it('market price / preview', async () => {
    const trade = new TradeServiceHttp('http://localhost:9945');
    const preview = await trade.marketPrice(
      tradeFixture[0].market,
      TradeType.SELL,
      10,
      '421d0a78577d9a97ba852597a52ef92675c5a1932562aa1c802923492448ad33'
    );
    console.log('///preview', preview);
  });
});
