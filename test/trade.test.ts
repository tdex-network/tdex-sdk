import * as TDEX from '../src/index';
import { Trade } from '../src/index';

describe('TDEX SDK', () => {
  it('Should throw if arguments not given', () => {
    expect(() => new TDEX.Trade({})).toThrow();
  });

  it('Should not throw', () => {
    const trade = new Trade({
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

  /* it('Should sell some LBTCs', async () => {
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
          '546c197a0aec70de78f1c46002a2eafbd56e2dcf22e88d01c8da5ec1bd86ce9a',
      },
      amount: 19967536512,
      //address: 'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
      privateKey: 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
    };

    const preview = await trade.preview( 
      params.market, 
      TDEX.TradeType.SELL, 
      params.amount 
    );

    console.log(preview)

    const txid = await trade.sell(params);
    console.log(txid);
    expect(txid).toBeDefined();

    const preview2 = await trade.preview( 
      params.market, 
      TDEX.TradeType.BUY, 
      5000000
    );

    console.log(preview2)


  }, 25000); */
});
