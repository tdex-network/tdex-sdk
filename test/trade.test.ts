import * as TDEX from '../src/index';
import { Trade } from '../src/index';

describe('TDEX SDK', () => {
  it('Should throw if arguments not given', () => {
    expect(() => new TDEX.Trade({})).toThrow();
  });

  it('Should not throw', () => {
    const trade = new Trade({
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network',
    });
    expect(trade).toMatchObject({
      chain: 'regtest',
      verbose: false,
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network',
    });
  });

  /*   it('Should sell some LBTCs', async () => {
    const trade = new Trade({
      chain: 'regtest',
      providerUrl: 'localhost:9945',
      explorerUrl: 'https://nigiri.network/liquid/api',
    });

    const market = {
      baseAsset:
        '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
      quoteAsset:
        'a2f9206f890bf93ca8030fa22819fd72bf8eb6788adda29cdc996b4c399a8980',
    };

    const params = {
      market,
      amount: 500000,
      //address: 'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
      privateKey: 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
    };
    const txid = await trade.sell(params);
    expect(txid).toBeDefined();
    
    //await sleep(1500);
    
    const params3 = {
      market,
      amount: 400000,
      //address: 'ert1ql5eframnl3slllu8xtwh472zzz8ws4hpm49ta9',
      privateKey: 'cQ1KJtXR2WB9Mpn6AEmeUK4yWeXAzwVX7UNJgQCF9anj3SrxjryV',
    };
    const txid3 = await trade.buy(params3);
    expect(txid3).toBeDefined();


  }, 27000); */
});
