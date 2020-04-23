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

  it('Should sell some LBTCs', async () => {
    const trade = new Trade({
      chain: 'regtest',
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network/liquid/api',
    });

    const params = {
      market: {
        baseAsset:
          '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
        quoteAsset:
          'b9cc08ae352104c20f4b044153670b243537392acefd454cb8bca6dfdf962a40',
      },
      amount: 50000,
      //address: 'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
      privateKey: 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
    };

    const txid = await trade.sell(params);
    console.log(txid);
    expect(txid).toBeDefined();
  }, 25000);
});
