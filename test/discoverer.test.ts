import MockTraderClientInterface from './fixtures/mockTraderClientInterface';
import { Discoverer, DiscovererInterface } from '../src/discoverer';
import { bestBalanceDiscovery, bestPriceDiscovery } from '../src/discovery';
import { TradeType } from '../src/tradeCore';
import assert from 'assert';
import TraderClientInterface from '../src/grpcClientInterface';

describe('discoverer', () => {
  let trader1: TraderClientInterface,
    trader2: TraderClientInterface,
    trader3: TraderClientInterface;
  let bestBalanceDiscoverer: DiscovererInterface;
  let bestPriceDiscoverer: DiscovererInterface;

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

    bestBalanceDiscoverer = new Discoverer(
      [trader1, trader2, trader3],
      bestBalanceDiscovery
    );
    bestPriceDiscoverer = new Discoverer(
      [trader1, trader2, trader3],
      bestPriceDiscovery
    );
  });

  describe('best balance', () => {
    test('should select the balance with the greater amount (TradeType BUY)', async () => {
      const best = await bestBalanceDiscoverer.discover({
        type: TradeType.BUY,
        market: { quoteAsset: '', baseAsset: '' },
        amount: 12,
        asset: '',
      });
      assert.strictEqual(best.length, 1);
      assert.strictEqual(best[0], trader3);
    });

    test('should select the balance with the greater amount (TradeType SELL)', async () => {
      const best = await bestBalanceDiscoverer.discover({
        type: TradeType.SELL,
        market: { quoteAsset: '', baseAsset: '' },
        amount: 12,
        asset: '',
      });
      assert.strictEqual(best.length, 1);
      assert.strictEqual(best[0], trader1);
    });
  });

  describe('best price', () => {
    test('should select the price with the greater amount (= the lowest price)', async () => {
      const best = await bestPriceDiscoverer.discover({
        type: TradeType.BUY,
        market: { quoteAsset: '', baseAsset: '' },
        amount: 12,
        asset: '',
      });
      assert.strictEqual(best.length, 1);
      assert.strictEqual(best[0], trader3);
    });
  });
});
