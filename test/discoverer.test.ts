import MockTraderClientInterface from './fixtures/mockTraderClientInterface';
import { Discoverer } from '../src/discoverer';
import { bestBalanceDiscovery, bestPriceDiscovery } from '../src/discovery';
import { TradeOrder, TradeType } from '../src/tradeCore';
import assert from 'assert';
import TraderClientInterface from '../src/grpcClientInterface';

const makeOrder = (type: TradeType) => (
  trader: TraderClientInterface
): TradeOrder => ({
  traderClient: trader,
  market: {
    quoteAsset: '',
    baseAsset: '',
    provider: { name: '', endpoint: '' },
  },
  type,
});

describe('discoverer', () => {
  let trader1: TraderClientInterface,
    trader2: TraderClientInterface,
    trader3: TraderClientInterface;

  beforeAll(() => {
    trader1 = new MockTraderClientInterface({
      providerUrl: 'trader1',
      balance: { balance: { baseAmount: 1, quoteAmount: 1000 } },
      price: { amount: 10, asset: '' },
    });

    trader2 = new MockTraderClientInterface({
      providerUrl: 'trader2',
      balance: { balance: { baseAmount: 10, quoteAmount: 10 } },
      price: { amount: 100, asset: '' },
    });

    trader3 = new MockTraderClientInterface({
      providerUrl: 'trader3',
      balance: { balance: { baseAmount: 100, quoteAmount: 100 } },
      price: { amount: 1000, asset: '' },
    });
  });

  describe('best balance', () => {
    test('should select the balance with the greater amount (TradeType BUY)', async () => {
      const bestBalanceDiscoverer = new Discoverer(
        [trader1, trader2, trader3].map(makeOrder(TradeType.BUY)),
        bestBalanceDiscovery
      );

      const best = await bestBalanceDiscoverer.discover({
        amount: 12,
        asset: '',
      });
      assert.strictEqual(best.length, 1);
      assert.strictEqual(best[0].traderClient, trader3);
    });

    test('should select the balance with the greater amount (TradeType SELL)', async () => {
      const bestBalanceDiscoverer = new Discoverer(
        [trader1, trader2, trader3].map(makeOrder(TradeType.SELL)),
        bestBalanceDiscovery
      );

      const best = await bestBalanceDiscoverer.discover({
        amount: 12,
        asset: '',
      });
      assert.strictEqual(best.length, 1);
      assert.strictEqual(best[0].traderClient, trader1);
    });
  });

  describe('best price', () => {
    test('should select the price with the greater amount (= the lowest price)', async () => {
      const bestPriceDiscoverer = new Discoverer(
        [trader1, trader2, trader3].map(makeOrder(TradeType.BUY)),
        bestPriceDiscovery
      );

      const best = await bestPriceDiscoverer.discover({
        amount: 12,
        asset: '',
      });
      assert.strictEqual(best.length, 1);
      assert.strictEqual(best[0].traderClient, trader3);
    });
  });
});
