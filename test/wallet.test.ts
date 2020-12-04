import {
  fetchAndUnblindTxs,
  UtxoInterface,
  Wallet,
  walletFromAddresses,
  isBlindedOutputInterface,
  UnblindedOutputInterface,
  fetchAndUnblindUtxos,
} from '../src/wallet';
import { networks, TxOutput, Transaction, Psbt } from 'liquidjs-lib';
import {
  faucet,
  fetchUtxos,
  fetchTxHex,
  mint,
  APIURL,
  sleep,
  broadcastTx,
} from './_regtest';
import * as assert from 'assert';
import { Swap } from '../src/swap';
import {
  proposer,
  proposerAddress,
  responder,
  responderAddress,
} from './fixtures/swap.keys';
import {
  senderAddress,
  senderWallet,
  recipientAddress,
  sender,
} from './fixtures/wallet.keys';
import axios from 'axios';

const network = networks.regtest;

jest.setTimeout(500000);

describe('Wallet - Transaction builder', () => {
  let messageSwapRequest: Uint8Array;
  let txSwapRequest: Psbt;
  let shitcoin: string;
  let inputsKeys: Record<string, Buffer>;
  let outputsKeys: Record<string, Buffer>;

  describe('buildTx', () => {
    let senderUtxos: any[] = [];
    let USDT: string = '';

    beforeAll(async () => {
      // fund the proposer account with LBTC
      await faucet(senderAddress);
      // mint and fund with USDT
      const minted = await mint(senderAddress, 100);
      USDT = minted.asset;
      senderUtxos = await fetchUtxos(senderAddress);

      const txHexs: string[] = await Promise.all(
        senderUtxos.map((utxo: any) => fetchTxHex(utxo.txid))
      );

      const outputs: TxOutput[] = txHexs.map(
        (hex, index) => Transaction.fromHex(hex).outs[senderUtxos[index].vout]
      );

      senderUtxos.forEach((utxo: any, index: number) => {
        utxo.prevout = outputs[index];
      });
    });

    it('Can build a confidential transaction spending LBTC', async () => {
      // create a tx using wallet
      const tx = senderWallet.createTx();

      const unsignedTx = senderWallet.buildTx(
        tx,
        senderUtxos,
        recipientAddress!,
        50000,
        network.assetHash,
        sender.getNextChangeAddress().confidentialAddress
      );

      assert.doesNotThrow(() => (txSwapRequest = Psbt.fromBase64(unsignedTx)));
    });

    it('Can build a confidential transaction spending USDT', async () => {
      // create a tx using wallet
      const tx = senderWallet.createTx();

      const unsignedTx = senderWallet.buildTx(
        tx,
        senderUtxos,
        recipientAddress!,
        150000,
        USDT,
        sender.getNextChangeAddress().confidentialAddress
      );

      assert.doesNotThrow(() => (txSwapRequest = Psbt.fromBase64(unsignedTx)));
    });
  });

  describe('SwapRequest transaction', () => {
    let proposerUtxos: UtxoInterface[];
    let psbtBase64: string;

    beforeAll(async () => {
      // found the proposer account with LBTC
      await faucet(proposerAddress);
      proposerUtxos = await fetchUtxos(proposerAddress);
      // mint for the responder
      shitcoin = (await mint(responderAddress, 100)).asset;

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

      psbtBase64 = psetBase64;
      inputsKeys = { ...inputBlindingKeys };
      outputsKeys = { ...outputBlindingKeys };
    });

    it('should create a deserializable psbt', () => {
      assert.doesNotThrow(() => Psbt.fromBase64(psbtBase64));
    });

    it('should add the input to the transaction', () => {
      const inputsCount = Psbt.fromBase64(
        psbtBase64
      ).data.globalMap.unsignedTx.getInputOutputCounts().inputCount;
      expect(inputsCount).toBeGreaterThan(0);
    });

    it('should add the output to the transaction', () => {
      const outputsCount = Psbt.fromBase64(
        psbtBase64
      ).data.globalMap.unsignedTx.getInputOutputCounts().outputCount;
      expect(outputsCount).toBeGreaterThanOrEqual(1);
    });

    it('should let the Proposer to create a valid transaction to be used in a SwapRequest message', () => {
      assert.doesNotThrow(() => (txSwapRequest = Psbt.fromBase64(psbtBase64)));

      const swap = new Swap();
      assert.doesNotThrow(() => {
        messageSwapRequest = swap.request({
          amountToBeSent: 1_0000_0000,
          assetToBeSent: network.assetHash,
          amountToReceive: 100_0000_0000,
          assetToReceive: shitcoin,
          psetBase64: psbtBase64,
          inputBlindingKeys: inputsKeys,
          outputBlindingKeys: outputsKeys,
        });
      });
    });
  });

  describe('SwapAccept message', () => {
    let psbtBase64: string;

    beforeAll(async () => {
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

      psbtBase64 = psetBase64;
      inputsKeys = { ...inputsKeys, ...inputBlindingKeys };
      outputsKeys = { ...outputsKeys, ...outputBlindingKeys };
    });

    it('should create a deserializable psbt', () => {
      assert.doesNotThrow(() => Psbt.fromBase64(psbtBase64));
    });

    it('should add the output responder to the transaction', () => {
      const diffOutputs =
        Psbt.fromBase64(
          psbtBase64
        ).data.globalMap.unsignedTx.getInputOutputCounts().outputCount -
        txSwapRequest.data.globalMap.unsignedTx.getInputOutputCounts()
          .outputCount;
      expect(diffOutputs).toBeGreaterThanOrEqual(1);
    });

    it('should add the input of the responder to the transaction', () => {
      const diffInputs =
        Psbt.fromBase64(
          psbtBase64
        ).data.globalMap.unsignedTx.getInputOutputCounts().inputCount -
        txSwapRequest.data.globalMap.unsignedTx.getInputOutputCounts()
          .inputCount;
      expect(diffInputs).toBeGreaterThanOrEqual(1);
    });

    it('should let the responder to create a valid transaction to be used for a Swap Accept', () => {
      const swap = new Swap();
      assert.doesNotThrow(() => {
        swap.accept({
          message: messageSwapRequest,
          psetBase64: psbtBase64,
          inputBlindingKeys: inputsKeys,
          outputBlindingKeys: outputsKeys,
        });
      });
    });
  });

  describe('FetchAndUnblindTx function', () => {
    it('should fetch all the transactions of an address & unblind the outputs', async () => {
      const { txId } = (
        await axios.post(`${APIURL}/faucet`, { address: senderAddress })
      ).data;

      // sleep 5s for nigiri
      await sleep(5000);

      const txs = await fetchAndUnblindTxs(
        senderAddress,
        [sender.getNextAddress().blindingPrivateKey],
        APIURL
      );

      const faucetTx = txs.find(tx => tx.txid === txId);
      expect(faucetTx).not.toBeUndefined();

      const LBTC = networks.regtest.assetHash;
      const hasOutputWithValue1LBTC = faucetTx!.vout.some(out => {
        if (!isBlindedOutputInterface(out)) {
          const unblindOutput = out as UnblindedOutputInterface;
          return (
            unblindOutput.value === 1_0000_0000 && unblindOutput.asset === LBTC
          );
        }
        return false;
      });

      expect(hasOutputWithValue1LBTC).toEqual(true);
    });

    it('should fetch all the transactions of an address & unblind the prevouts', async () => {
      const { txId } = (
        await axios.post(`${APIURL}/faucet`, { address: senderAddress })
      ).data;
      await sleep(5000);

      const utxos = await fetchAndUnblindUtxos(
        senderAddress,
        sender.getNextAddress().blindingPrivateKey,
        APIURL
      );

      const tx = senderWallet.createTx();
      const unsignedTx = senderWallet.buildTx(
        tx,
        utxos.filter(utxo => utxo.txid === txId),
        recipientAddress!,
        100,
        networks.regtest.assetHash,
        sender.getNextChangeAddress().confidentialAddress
      );

      const signedPset = await sender.signPset(unsignedTx);
      const hex = Psbt.fromBase64(signedPset)
        .finalizeAllInputs()
        .extractTransaction()
        .toHex();
      const txIdBroadcasted = await broadcastTx(hex);

      const txs = await fetchAndUnblindTxs(
        senderAddress,
        [sender.getNextAddress().blindingPrivateKey],
        APIURL
      );
      const faucetTx = txs.find(tx => tx.txid === txIdBroadcasted);
      expect(faucetTx).not.toBeUndefined();

      const hasUnblindedPrevout = faucetTx!.vin
        .map(input => input.prevout)
        .some(prevout => {
          if (!isBlindedOutputInterface(prevout)) {
            const unblindOutput = prevout as UnblindedOutputInterface;
            return (
              unblindOutput.value === 1_0000_0000 &&
              unblindOutput.asset === networks.regtest.assetHash
            );
          }
          return false;
        });
      expect(hasUnblindedPrevout).toEqual(true);
    });
  });
});
