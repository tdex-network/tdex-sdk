import { UtxoInterface, Wallet, walletFromAddresses } from './../src/wallet';
import { networks, TxOutput, Transaction, Psbt } from 'liquidjs-lib';
import { faucet, fetchUtxos, fetchTxHex, mint } from './_regtest';
import * as assert from 'assert';
import { Swap } from '../src/swap';
import PrivateKey from '../src/identities/privatekey';
import { IdentityType } from '../src/identity';

const network = networks.regtest;

const proposer = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    signingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
});

const proposerAddress = proposer.getNextAddress().confidentialAddress;

const responder = new PrivateKey({
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    blindingKeyWIF: 'cSv4PQtTpvYKHjfp9qih2RMeieBQAVADqc8JGXPvA7mkJ8yD5QC1',
    signingKeyWIF: 'cVcDj9Td96x8jcG1eudxKL6hdwziCTgvPhqBoazkDeFGSAR8pCG8',
  },
});

const responderAddress = responder.getNextAddress().confidentialAddress;

jest.setTimeout(15000);

describe('Wallet - Transaction builder', () => {
  let messageSwapRequest: Uint8Array;
  let txSwapRequest: Psbt;
  let shitcoin: string;
  let inputsKeys: Record<string, Buffer>;
  let outputsKeys: Record<string, Buffer>;

  describe('SwapRequest transaction', () => {
    let proposerUtxos: UtxoInterface[];

    it('should let the Proposer to create a valid transaction to be used in a SwapRequest message', async () => {
      // found the proposer account with LBTC
      await faucet(proposerAddress);
      proposerUtxos = await fetchUtxos(proposerAddress);
      // mint for the responder
      shitcoin = await mint(responderAddress, 100);

      const txHexs: string[] = await Promise.all(
        proposerUtxos.map(utxo => fetchTxHex(utxo.txid))
      );

      const outputs: TxOutput[] = txHexs.map(
        (hex, index) => Transaction.fromHex(hex).outs[proposerUtxos[index].vout]
      );

      proposerUtxos.forEach((utxo: any, index: number) => {
        utxo.prevout = outputs[index];
      });

      // create the request tx using wallet
      const proposerWallet: Wallet = walletFromAddresses(
        proposer.getAddresses(),
        'regtest'
      );

      const emptyPsbt = proposerWallet.createTx();

      const {
        psetBase64,
        inputBlindingKeys,
        outputBlindingKeys,
      } = proposerWallet.updateTx(
        emptyPsbt,
        proposerUtxos,
        1_0000_0000,
        100_0000_0000,
        network.assetHash,
        shitcoin,
        proposer.getNextAddress(),
        proposer.getNextAddress()
      );

      inputsKeys = { ...inputBlindingKeys };
      outputsKeys = { ...outputBlindingKeys };

      assert.doesNotThrow(() => (txSwapRequest = Psbt.fromBase64(psetBase64)));

      const swap = new Swap();
      assert.doesNotThrow(() => {
        messageSwapRequest = swap.request({
          amountToBeSent: 1_0000_0000,
          assetToBeSent: network.assetHash,
          amountToReceive: 100_0000_0000,
          assetToReceive: shitcoin,
          psbtBase64: psetBase64,
          inputBlindingKeys,
          outputBlindingKeys,
        });
      });
    });
  });

  describe('SwapAccept message', () => {
    it('should let the proposer to create a valid transaction to be used for a Swap Accept', async () => {
      const responderUtxos = await fetchUtxos(responderAddress);

      const txHexs: string[] = await Promise.all(
        responderUtxos.map((utxo: any) => fetchTxHex(utxo.txid))
      );

      const outputs: TxOutput[] = txHexs.map(
        (hex, index) =>
          Transaction.fromHex(hex).outs[responderUtxos[index].vout]
      );

      responderUtxos.forEach((utxo: any, index: number) => {
        utxo.prevout = outputs[index];
      });

      // create the request tx using wallet
      const responderWallet: Wallet = walletFromAddresses(
        responder.getAddresses(),
        'regtest'
      );

      const {
        psetBase64,
        inputBlindingKeys,
        outputBlindingKeys,
      } = responderWallet.updateTx(
        txSwapRequest.toBase64(),
        responderUtxos,
        100_0000_0000,
        1_0000_0000,
        shitcoin,
        network.assetHash,
        responder.getNextAddress(),
        responder.getNextChangeAddress()
      );

      assert.doesNotThrow(() => Psbt.fromBase64(psetBase64));

      inputsKeys = { ...inputsKeys, ...inputBlindingKeys };
      outputsKeys = { ...outputsKeys, ...outputBlindingKeys };

      const swap = new Swap();
      assert.doesNotThrow(() => {
        swap.accept({
          message: messageSwapRequest,
          psbtBase64: psetBase64,
          inputBlindingKeys: inputsKeys,
          outputBlindingKeys: outputsKeys,
        });
      });
    });
  });
});
