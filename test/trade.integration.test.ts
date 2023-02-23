/*
import * as ecc from 'tiny-secp256k1';
import { TDEXMnemonic, Trade, Transport } from '../src';

import tradeFixture from './fixtures/trade.integration.json';
import { faucet, sleep } from './_regtest';
import secp256k1 from '@vulpemventures/secp256k1-zkp';

const market = tradeFixture[0].market;

const identityOpts: () => Promise<IdentityOpts<MnemonicOpts>> = async () => {
  const zkp = await secp256k1();
  return {
    chain: 'regtest',
    type: IdentityType.Mnemonic,
    opts: {
      mnemonic:
        'outer prosper fish exclude pitch jaguar hole water head cream glimpse drive',
    },
    ecclib: ecc,
    zkplib: zkp,
  };
};

const explorerUrl = 'http://localhost:3001';

describe('Integration tests with a local daemon', () => {
  describe('With TDEXMnemonic', () => {
    let addresses: AddressInterface[];

    beforeAll(async () => {
      const identity = new TDEXMnemonic(await identityOpts());
      const proposerAddress = (await identity.getNextAddress())
        .confidentialAddress;
      await faucet(proposerAddress);
      await sleep(3000);

      addresses = await identity.getAddresses();
    }, 36000);

    test('Should sell some LBTCs with a daemon (TDEXMnemonic)', async () => {
      const identity = new TDEXMnemonic(await identityOpts());
      const zkp = await secp256k1();
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
    let addresses: AddressInterface[];

    beforeAll(async () => {
      const identity = new Mnemonic(await identityOpts());
      const proposerAddress = (await identity.getNextAddress())
        .confidentialAddress;
      await faucet(proposerAddress);
      await sleep(3000);
      addresses = await identity.getAddresses();
    }, 36000);

    test('Should sell some LBTCs with a daemon (LDK Mnemonic)', async () => {
      const identity = new Mnemonic(await identityOpts());
      const zkp = await secp256k1();
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
*/
