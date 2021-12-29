import { SwapTransaction } from '../src';
import {
  greedyCoinSelector,
  address,
  UnblindedOutput,
  networks,
  payments,
} from 'ldk';
import {
  proposerP2PKH,
  proposerP2SH,
  proposerP2WPKH,
} from './fixtures/identities';
import { proposerPubKey, proposerBlindPubKey } from './fixtures/swap.keys';

jest.setTimeout(30000);

describe('SwapTransaction', () => {
  test('should create a swap tx with p2pkh inputs', async () => {
    const addr: any = await proposerP2PKH.getNextAddress();
    const script: Buffer = address.toOutputScript(addr.confidentialAddress);
    const utxos = mockUtxos(script);
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
    const script: Buffer = address.toOutputScript(addr.confidentialAddress);
    const utxos = mockUtxos(script);

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
    const script: Buffer = address.toOutputScript(addr.confidentialAddress);
    const utxos = mockUtxos(script);

    const swaptx = new SwapTransaction(proposerP2SH);

    await swaptx.create(
      utxos.map(u => ({ ...u, redeemScript })),
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

function mockUtxos(script: Buffer): UnblindedOutput[] {
  return [
    {
      txid: '0dad7ad63886e2c490aab6464b4768a90aa2af1176c4393acb31b3912c346794',
      vout: 1,
      unblindData: {
        value: '100000000',
        asset: Buffer.from(
          '25b251070e29ca19043cf33ccd7324e2ddab03ecc4ae0b5e77c4fc0e5cf6c95a',
          'hex'
        ),
        valueBlindingFactor: Buffer.from(
          '5eaa2b6185ec771a4aa3b71cf683e311f82b29276619242ef218912ad2bd37fd',
          'hex'
        ),
        assetBlindingFactor: Buffer.from(
          'e00da980289b9b1ad818ca117313f2468727a03db256d421d96ed923567f8613',
          'hex'
        ),
      },
      prevout: {
        asset: Buffer.from(
          '0a176e6cdd4ad8f8e2c34c2382ef9a55cb5cf8759aca9cf15603460e5747e3beb3',
          'hex'
        ),
        value: Buffer.from(
          '09b580a96b723c3b2a7f13ce431c90e7b578e1480f229b887c0aa14a550d5d4604',
          'hex'
        ),
        nonce: Buffer.from(
          '034a0a39f7143dc221e870667f7da7f1cf298781d82498a570c0bfbe2bbcc3af48',
          'hex'
        ),
        script: script,
        rangeProof: Buffer.from('00', 'hex'),
        surjectionProof: Buffer.from('00', 'hex'),
      },
    },
  ];
}
