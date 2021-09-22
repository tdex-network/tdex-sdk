import { MarketInterface, TradeType } from './tradeCore';
import TraderClientInterface from './grpcClientInterface';
import { BalanceWithFee } from 'tdex-protobuf/generated/js/types_pb';

export interface DiscoveryOpts {
  market: MarketInterface;
  amount: number;
  asset: string;
  type: TradeType;
}

export type Discovery = (
  clients: TraderClientInterface[],
  discoveryOpts: DiscoveryOpts,
  errorHandler?: (err: any) => Promise<void>
) => Promise<TraderClientInterface[]>;

// combine several discoveries function
// each function will be applied in the order specified in discoveries
export function combineDiscovery(...discoveries: Discovery[]): Discovery {
  return async (
    clients: TraderClientInterface[],
    opts: DiscoveryOpts,
    errorHandler?: (err: any) => Promise<void>
  ) => {
    let results = clients;
    for (const discovery of discoveries) {
      if (results.length <= 1) return results;
      results = await discovery(results, opts, errorHandler);
    }

    return results;
  };
}

// bestBalanceDiscovery returns the clients with the greater balance.
// according to trade's type: BUY = max base balance, SELL = max quote balance.
export const bestBalanceDiscovery: Discovery = async (
  clients: TraderClientInterface[],
  opts: DiscoveryOpts,
  errorHandler?: (err: any) => Promise<void>
) => {
  const balancesPromises = clients.map(client =>
    client.balances(opts.market).then((balances: BalanceWithFee.AsObject[]) => {
      const balance = balances[0].balance;
      if (!balance) throw new Error('unknow error');
      const amount =
        opts.type === TradeType.BUY ? balance.baseAmount : balance.quoteAmount;
      return {
        amount,
        client,
      };
    })
  );

  const balancesPromisesResults = await Promise.allSettled(balancesPromises);

  if (errorHandler) {
    const rejectedResults = balancesPromisesResults.filter(
      result => result.status === 'rejected'
    );
    for (const result of rejectedResults) {
      await errorHandler(
        (result as PromiseRejectedResult).reason ||
          'an unknwon error occurs when trying to fetch balance'
      );
    }
  }

  const balancesWithClients = balancesPromisesResults
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(
      p =>
        (p as PromiseFulfilledResult<{
          amount: number;
          client: TraderClientInterface;
        }>).value
    );

  const sorted = balancesWithClients.sort((p0, p1) => p1.amount - p0.amount);

  const bestAmount = sorted[0].amount;
  return sorted
    .filter(({ amount }) => amount === bestAmount)
    .map(({ client }) => client);
};

// bestPriceDiscovery returns the clients with the lower price.
export const bestPriceDiscovery: Discovery = async (
  clients: TraderClientInterface[],
  opts: DiscoveryOpts,
  errorHandler?: (err: any) => Promise<void>
) => {
  const pricesPromises = clients.map(client =>
    client
      .marketPrice(opts.market, opts.type, opts.amount, opts.asset)
      .then(response => ({ client, amount: response[0].amount }))
  );
  const pricesResults = await Promise.allSettled(pricesPromises);

  if (errorHandler) {
    const rejectedResults = pricesResults.filter(
      result => result.status === 'rejected'
    );
    for (const result of rejectedResults) {
      await errorHandler(
        (result as PromiseRejectedResult).reason ||
          'an unknwon error occurs when trying to fetch price'
      );
    }
  }

  const pricesWithClients = pricesResults
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(
      p =>
        (p as PromiseFulfilledResult<{
          amount: number;
          client: TraderClientInterface;
        }>).value
    );

  const sorted = pricesWithClients.sort((p0, p1) => p1.amount - p0.amount);

  const bestAmount = sorted[0].amount;
  return sorted
    .filter(({ amount }) => amount === bestAmount)
    .map(({ client }) => client);
};
