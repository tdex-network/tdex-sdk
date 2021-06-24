import {
  IdentityOpts,
  fetchAndUnblindUtxos,
  MnemonicOpts,
  AddressInterface,
  Mnemonic,
  // Mnemonic,
} from 'ldk';
import { Trade, IdentityType, greedyCoinSelector } from '../src/index';
import { TDEXMnemonic } from '../src/tdexMnemonic';

import tradeFixture from './fixtures/trade.integration.json';
import { faucet } from './_regtest';

import { sleep } from './_regtest';

const market = tradeFixture.market;

const identityOpts: IdentityOpts<MnemonicOpts> = {
  chain: 'regtest',
  type: IdentityType.Mnemonic,
  opts: {
    mnemonic:
      'outer prosper fish exclude pitch jaguar hole water head cream glimpse drive',
  },
};

const explorerUrl = 'http://localhost:3001';

describe('Integration tests with a local daemon', () => {
  describe('With TDEXMnemonic', () => {
    const identity = new TDEXMnemonic(identityOpts);
    let addresses: AddressInterface[];

    beforeAll(async () => {
      const proposerAddress = (await identity.getNextAddress())
        .confidentialAddress;
      await faucet(proposerAddress);
      await sleep(3000);

      addresses = await identity.getAddresses();
    }, 36000);

    test('Should sell some LBTCs with a daemon (TDEXMnemonic)', async () => {
      let utxos = await fetchAndUnblindUtxos(addresses, explorerUrl);

      const tradeSell = new Trade({
        providerUrl: 'localhost:9945',
        explorerUrl,
        utxos,
        coinSelector: greedyCoinSelector(),
      });

      const txidSell = await tradeSell.sell({
        market,
        amount: 5000,
        asset: market.baseAsset,
        identity,
      });

      expect(txidSell).toBeDefined();
      addresses = await identity.getAddresses();

      await sleep(1500);

      utxos = await fetchAndUnblindUtxos(addresses, explorerUrl);
      const tradeBuy = new Trade({
        providerUrl: 'localhost:9945',
        explorerUrl,
        utxos,
        coinSelector: greedyCoinSelector(),
      });

      const txidBuy = await tradeBuy.buy({
        market,
        amount: 1000,
        asset: market.baseAsset,
        identity,
      });

      expect(txidBuy).toBeDefined();
    }, 360000);
  });

  describe('With Mnemonic', () => {
    const identity = new Mnemonic(identityOpts);
    let addresses: AddressInterface[];

    beforeAll(async () => {
      const proposerAddress = (await identity.getNextAddress())
        .confidentialAddress;
      await faucet(proposerAddress);
      await sleep(3000);

      addresses = await identity.getAddresses();
    }, 36000);
    test('Should sell some LBTCs with a daemon (LDK Mnemonic)', async () => {
      let utxos = await fetchAndUnblindUtxos(addresses, explorerUrl);

      const tradeSell = new Trade({
        providerUrl: 'localhost:9945',
        explorerUrl,
        utxos,
        coinSelector: greedyCoinSelector(),
      });

      const txidSell = await tradeSell.sell({
        market,
        amount: 5000,
        asset: market.baseAsset,
        identity,
      });

      expect(txidSell).toBeDefined();
      addresses = await identity.getAddresses();

      await sleep(1500);

      utxos = await fetchAndUnblindUtxos(addresses, explorerUrl);
      const tradeBuy = new Trade({
        providerUrl: 'localhost:9945',
        explorerUrl,
        utxos,
        coinSelector: greedyCoinSelector(),
      });

      const txidBuy = await tradeBuy.buy({
        market,
        amount: 1000,
        asset: market.baseAsset,
        identity,
      });

      expect(txidBuy).toBeDefined();
    }, 360000);
  });
});
