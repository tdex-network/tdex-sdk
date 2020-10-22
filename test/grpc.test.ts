import { TraderClient } from '../src/grpcClient';

describe('grpc client', () => {
  test.skip('Should get all the markets', async () => {
    const client = new TraderClient('localhost:9945');
    expect(await client.markets()).toStrictEqual([]);
    try {
      await client.balances({ baseAsset: 'foo', quoteAsset: 'bar' });
      await client.marketPrice(
        {
          baseAsset: 'foo',
          quoteAsset: 'bar',
        },
        0,
        100000
      );
    } catch (e) {
      expect(e).toBeTruthy();
    }
  });
});
