import * as TDEX from '../src/index';

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
});
