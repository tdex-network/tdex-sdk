import {
  IdentityOpts,
  MnemonicOpts,
  fetchAndUnblindUtxos,
  Mnemonic,
} from 'ldk';
import { Trade, IdentityType, greedyCoinSelector } from '../src/index';
import { sleep } from './_regtest';

const market = {
  baseAsset: '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
  quoteAsset:
    '289ac498a544d00fa2a321faa8e4f7d16ae4a62158e3f6584d5fb32b89dfd3e1',
};

const identityOpts: IdentityOpts<MnemonicOpts> = {
  chain: 'regtest',
  type: IdentityType.Mnemonic,
  opts: {
    mnemonic:
      'pitch sun weapon improve strong mail faith skull quote kitten smooth sail',
  },
};

const explorerUrl = 'http://localhost:3001';

const identity = new Mnemonic(identityOpts);

describe('Integration tests with a local daemon', () => {
  test('Should sell some LBTCs with a daemon', async () => {
    const address = await identity.getNextAddress();
    console.log(address);
    // address
    //el1qq2ut5fy27yyc9zgftd4kagkqp2d9wne8p5l8ljad65n6a0ggschlsya0yhrxg0qwsnuysj74s8dcztdrhacw2sys9z5l8wpg4
    const utxos = await fetchAndUnblindUtxos([address], explorerUrl);
    // blidning
    // 48566cd9b86dfd4107d615bc4b929fc63347d72238a16844e657c60fe4593ffc
    const trade = new Trade({
      providerUrl: 'localhost:9945',
      explorerUrl,
      utxos,
      coinSelector: greedyCoinSelector(),
    });

    try {
      const txid = await trade.sell({
        market,
        amount: 5000,
        asset: market.baseAsset,
        identity,
      });
      console.log(txid);
      expect(txid).toBeDefined();
    } catch (e) {
      console.error(e);
    }

    await sleep(1500);

    const txid3 = await trade.buy({
      market,
      amount: 10000,
      asset: market.baseAsset,
      identity,
    });
    console.log(txid3);
    expect(txid3).toBeDefined();
  }, 60000);
});
