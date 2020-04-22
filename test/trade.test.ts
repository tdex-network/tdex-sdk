import * as TDEX from '../src/index';
import { Trade } from '../src/index';

describe('TDEX SDK', () => {
  it('Should throw if arguments not given', () => {
    expect(() => new TDEX.Trade({})).toThrow();
  });

  it('Should not throw', () => {
    const trade = new TDEX.Trade({
      providerUrl: 'http://vulpem.com',
      explorerUrl: 'http://nigiri.network',
    });
    expect(trade).toMatchObject({
      chain: 'regtest',
      verbose: false,
      providerUrl: 'http://vulpem.com',
      explorerUrl: 'http://nigiri.network',
    });
  });

  it('Should buy some assets ', async () => {
    const trade = new Trade({
      chain: 'regtest',
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network/liquid/api',
    });

    const market = {
      baseAsset:
        '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
      quoteAsset:
        'e260df04e214d87d68f21006a3f260157701fe1e4d38fa28a258ebc475359b36',
    };

    const txid = await trade.sell({
      market,
      amount: 0.0001,
      address: 'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
      privateKey: 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
    });

    expect(txid).toBeDefined();
  });
});
