import {
  IdentityOpts,
  fetchAndUnblindUtxos,
  MnemonicOpts,
  AddressInterface,
  Mnemonic,
} from 'ldk';
import * as ecc from 'tiny-secp256k1';
import {
  Trade,
  Transport,
  IdentityType,
  greedyCoinSelector,
  V1ContentType,
} from '../src';
import { TDEXMnemonic } from '../src';

import tradeFixture from './fixtures/trade.integration.json';
import { faucet } from './_regtest';

import { sleep } from './_regtest';
import secp256k1 from '@vulpemventures/secp256k1-zkp';

const market = tradeFixture[0].market;
const zkp = await secp256k1();

const identityOpts: IdentityOpts<MnemonicOpts> = {
  chain: 'regtest',
  type: IdentityType.Mnemonic,
  opts: {
    mnemonic:
      'outer prosper fish exclude pitch jaguar hole water head cream glimpse drive',
  },
  ecclib: ecc,
  zkplib: zkp,
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
      let utxos = await fetchAndUnblindUtxos(ecc, zkp, addresses, explorerUrl);

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

      utxos = await fetchAndUnblindUtxos(ecc, zkp, addresses, explorerUrl);
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

  describe('With Mnemonic and HTTP client', () => {
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
      let utxos = await fetchAndUnblindUtxos(ecc, zkp, addresses, explorerUrl);
      const transport = new Transport('http://localhost:9945', undefined, [
        V1ContentType.CONTENT_TYPE_JSON,
      ]);
      await transport.connect();

      const tradeSell = new Trade(
        {
          providerUrl: 'http://localhost:9945',
          explorerUrl,
          utxos,
          coinSelector: greedyCoinSelector(),
        },
        undefined,
        transport.client
      );

      const txidSell = await tradeSell.sell({
        market,
        amount: 5000,
        asset: market.baseAsset,
        identity,
      });

      expect(txidSell).toBeDefined();
      addresses = await identity.getAddresses();

      await sleep(1500);

      utxos = await fetchAndUnblindUtxos(ecc, zkp, addresses, explorerUrl);
      const tradeBuy = new Trade(
        {
          providerUrl: 'http://localhost:9945',
          explorerUrl,
          utxos,
          coinSelector: greedyCoinSelector(),
        },
        undefined,
        transport.client
      );

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
