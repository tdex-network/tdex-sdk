import { Swap } from '../src/swap';

describe('Swap', () => {
  it('Request', () => {
    const swap = new Swap();
    const bytes = swap.request({
      assetToBeSent: 'foo',
      amountToBeSent: 1,
      assetToReceive: 'bar',
      amountToReceive: 100,
    });

    expect(bytes).toBeDefined();
  });
});
