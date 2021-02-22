import * as TDEX from '../src/index';

describe('TDEX SDK', () => {
  it('Init', () => {
    const swap = new TDEX.Swap();
    expect(swap).toMatchObject({ chain: 'regtest', verbose: false });
  });
});
