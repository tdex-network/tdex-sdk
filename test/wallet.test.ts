import { AddressInterface } from './../src/types';
import { UtxoInterface, Wallet, walletFromAddresses } from './../src/wallet';
import {
  ECPair,
  networks,
  payments,
  TxOutput,
  Transaction,
} from 'liquidjs-lib';
import { faucet, fetchUtxos, fetchTxHex, mint } from './_regtest';
import * as assert from 'assert';
import { Swap } from '../src/swap';
import { toAssetHash, unblindOutput } from '../src/utils';

const network = networks.regtest;

const proposerKeypair = ECPair.fromWIF(
  'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
  network
);

const proposerBlindKeypair = ECPair.fromWIF(
  'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  network
);

const responderKeypair = ECPair.fromWIF(
  'cSv4PQtTpvYKHjfp9qih2RMeieBQAVADqc8JGXPvA7mkJ8yD5QC1',
  network
);

const responderBlindKeypair = ECPair.fromWIF(
  'cVcDj9Td96x8jcG1eudxKL6hdwziCTgvPhqBoazkDeFGSAR8pCG8',
  network
);

const proposer = payments.p2wpkh({
  pubkey: proposerKeypair.publicKey,
  blindkey: proposerBlindKeypair.publicKey,
  network,
});

const responder = payments.p2wpkh({
  pubkey: responderKeypair.publicKey,
  blindkey: responderBlindKeypair.publicKey,
  network,
});

const proposerAddressInterface: AddressInterface = {
  confidentialAddress: proposer.confidentialAddress!,
  blindingPrivateKey: proposerBlindKeypair.privateKey!.toString('hex'),
};

jest.setTimeout(15000);

describe('Wallet - Transaction builder', () => {
  describe('SwapRequest transaction', () => {
    let proposerUtxos: UtxoInterface[];
    let shitcoin: string;

    it('should let the Proposer to create a valid transaction to be used in a SwapRequest message', async () => {
      // found the proposer account with LBTC
      await faucet(proposer.confidentialAddress!);
      proposerUtxos = await fetchUtxos(proposer.confidentialAddress!);
      // mint for the responder
      shitcoin = await mint(responder.confidentialAddress!, 100);

      const txHexs: string[] = await Promise.all(
        proposerUtxos.map(utxo => fetchTxHex(utxo.txid))
      );

      const outputs: TxOutput[] = txHexs.map(
        (hex, index) => Transaction.fromHex(hex).outs[proposerUtxos[index].vout]
      );

      const unblindedUtxos: UtxoInterface[] = proposerUtxos.map(
        (utxo: UtxoInterface, index: number) => {
          const prevout = outputs[index];
          const { asset, value } = unblindOutput(
            prevout,
            proposerBlindKeypair.privateKey!
          );
          return {
            ...utxo,
            asset: toAssetHash(asset),
            value,
            prevout,
          };
        }
      );

      // create the request tx using wallet
      const proposerWallet: Wallet = walletFromAddresses(
        [proposerAddressInterface],
        'regtest'
      );

      const emptyPsbt = proposerWallet.createTx();

      const {
        psetBase64,
        inputBlindingKeys,
        outputBlindingKeys,
      } = proposerWallet.updateTx(
        emptyPsbt,
        unblindedUtxos,
        1_0000_0000,
        100_0000_0000,
        network.assetHash,
        shitcoin,
        proposerAddressInterface,
        proposerAddressInterface
      );

      const swap = new Swap();
      assert.doesNotThrow(() =>
        swap.request({
          amountToBeSent: 1_0000_0000,
          assetToBeSent: network.assetHash,
          amountToReceive: 100_0000_0000,
          assetToReceive: shitcoin,
          psbtBase64: psetBase64,
          inputBlindingKeys,
          outputBlindingKeys,
        })
      );
    });
  });
});
