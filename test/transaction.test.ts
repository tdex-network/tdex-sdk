import { SwapTransaction } from '../src';
import { proposerBlindPubKey, proposerPubKey } from './fixtures/swap.keys';
import {
  greedyCoinSelector,
  networks,
  payments,
  fetchAndUnblindUtxos,
  AddressInterface,
} from 'ldk';
import { APIURL, faucet } from './_regtest';
import {
  proposerP2PKH,
  proposerP2SH,
  proposerP2WPKH,
} from './fixtures/identities';

jest.setTimeout(30000);

describe('SwapTransaction', () => {
  test('should create a swap tx with p2pkh inputs', async () => {
    const addr = await proposerP2PKH.getNextAddress();
    await faucet(addr.confidentialAddress);

    const addresses: AddressInterface[] = [addr];
    const utxos = await fetchAndUnblindUtxos(addresses, APIURL);

    const swaptx = new SwapTransaction(proposerP2PKH);

    await swaptx.create(
      utxos,
      100000,
      20_00000000,
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
      '6d0910822769196b2a3bd3eaad9ca10d43b8adf0b851607460729ec2b0b8fed0',
      addr.confidentialAddress,
      addr.confidentialAddress,
      greedyCoinSelector()
    );

    expect(swaptx.pset).toBeDefined();
  });

  test('should create a swap tx with p2wpkh inputs', async () => {
    const addr = await proposerP2WPKH.getNextAddress();
    await faucet(addr.confidentialAddress);

    const addresses: AddressInterface[] = [addr];
    const utxos = await fetchAndUnblindUtxos(addresses, APIURL);

    const swaptx = new SwapTransaction(proposerP2WPKH);

    await swaptx.create(
      utxos,
      100000,
      20_00000000,
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
      '6d0910822769196b2a3bd3eaad9ca10d43b8adf0b851607460729ec2b0b8fed0',
      addr.confidentialAddress,
      addr.confidentialAddress,
      greedyCoinSelector()
    );

    expect(swaptx.pset).toBeDefined();
  });

  test('should create a swap tx with p2sh(p2wpkh) inputs', async () => {
    // In this case we want to commpute the p2wpkh wrapped into the p2sh,
    // aka the redeemScript we MUST add to every utxo we'll fetch before
    // creating the transaction.
    const p2wpkh = payments.p2wpkh({
      pubkey: proposerPubKey,
      network: networks.regtest,
      blindkey: proposerBlindPubKey,
    });
    const redeemScript = p2wpkh.output!;

    const addr = await proposerP2SH.getNextAddress();
    await faucet(addr.confidentialAddress);

    const addresses: AddressInterface[] = [addr];
    const utxos = await fetchAndUnblindUtxos(addresses, APIURL);

    utxos.forEach((u: any) => {
      u.redeemScript = redeemScript;
    });

    const swaptx = new SwapTransaction(proposerP2SH);

    await swaptx.create(
      utxos,
      100000,
      20_00000000,
      '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225',
      '6d0910822769196b2a3bd3eaad9ca10d43b8adf0b851607460729ec2b0b8fed0',
      addr.confidentialAddress,
      addr.confidentialAddress,
      greedyCoinSelector()
    );

    expect(swaptx.pset).toBeDefined();
  });
});
