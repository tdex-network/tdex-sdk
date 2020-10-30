import { networks, Psbt, address, confidential } from 'liquidjs-lib';
import { Swap } from '../src/swap';
import * as assert from 'assert';
import * as fixtures from './fixtures/swap.json';
import { faucet, fetchUtxos, mint, fetchTxHex } from './_regtest';
import {
  proposer,
  proposerAddress,
  responder,
  responderAddress,
} from './fixtures/swap.keys';
import { UtxoInterface } from '../src/wallet';

const toOutputScript = (addr: string) =>
  address.toOutputScript(addr, networks.regtest);
const satoshiToConfidentialValue = confidential.satoshiToConfidentialValue;

jest.setTimeout(30000);

describe('Swap', () => {
  const swap = new Swap();
  const initialPsbtOfAlice =
    'cHNldP8BALgCAAAAAAHtRVE1BkOnL3GYKskZnbmT/4wjiX+golY/TSLwpcWruQEAAAAA/////wIBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAABMS0AAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkB0xEU/OcDlMH501R1AbS5029CAjbsZBmRVFZkNIhazy0BAAANnXmIRAAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkAAAAAAAEBQgHTERT85wOUwfnTVHUBtLnTb0ICNuxkGZFUVmQ0iFrPLQEAAA2kdavwAAAWABTFKMruAFIAZXwEtcX2ows9PlHleQAAAA==';
  const initialPsbtOfBob =
    'cHNldP8BAP1lAQIAAAAAAu1FUTUGQ6cvcZgqyRmduZP/jCOJf6CiVj9NIvClxau5AQAAAAD/////5gvIxOksvm3xwVCvGRe1AQLH8z0utX4L0e30r+VPt5cAAAAAAP////8EASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAATEtAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAADZ15iEQAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAAAAb8I6wAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAFqZXAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHAAAAAAABAUIB0xEU/OcDlMH501R1AbS5029CAjbsZBmRVFZkNIhazy0BAAANpHWr8AAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkAAQFCASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAF9eEAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHIgICgEVehMv0LB8AvJfc4SLP1VX1F0p6ebHBYKtzq3xbs8lHMEQCIHpIzr6p7OIGhW2PzOi6m/HKG5Gotnmt5TpylMuOSrE4AiAhxdQqlCGk4s7QaJnA2dVQc4lfWBOV3FBHaw25sM8xEQEAAAAAAA==';
  const finalPsbtOfAlice =
    'cHNldP8BAP1lAQIAAAAAAu1FUTUGQ6cvcZgqyRmduZP/jCOJf6CiVj9NIvClxau5AQAAAAD/////5gvIxOksvm3xwVCvGRe1AQLH8z0utX4L0e30r+VPt5cAAAAAAP////8EASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAATEtAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAADZ15iEQAABYAFMUoyu4AUgBlfAS1xfajCz0+UeV5AdMRFPznA5TB+dNUdQG0udNvQgI27GQZkVRWZDSIWs8tAQAAAAb8I6wAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHASWyUQcOKcoZBDzzPM1zJOLdqwPsxK4LXnfE/A5c9slaAQAAAAAFqZXAABYAFJJ8X9Wg477+b6SuqlazoT+3x+BHAAAAAAABAUIB0xEU/OcDlMH501R1AbS5029CAjbsZBmRVFZkNIhazy0BAAANpHWr8AAAFgAUxSjK7gBSAGV8BLXF9qMLPT5R5XkiAgJp6A6eYQgEnPKMfCH5c49w+9u63C62sGGTzHIJL4ZaxEcwRAIgdN5MddCGTC9hRWvUbIOREbVwhEcARauaHT4pqavp9yACIBpEdlr8hBM6e6+S6cNqDkqkqVV0JTYqKuMt5FW/abJyAQABAUIBJbJRBw4pyhkEPPM8zXMk4t2rA+zErgted8T8Dlz2yVoBAAAAAAX14QAAFgAUknxf1aDjvv5vpK6qVrOhP7fH4EciAgKARV6Ey/QsHwC8l9zhIs/VVfUXSnp5scFgq3OrfFuzyUcwRAIgekjOvqns4gaFbY/M6Lqb8cobkai2ea3lOnKUy45KsTgCICHF1CqUIaTiztBomcDZ1VBziV9YE5XcUEdrDbmwzzERAQAAAAAA';

  describe('Swap Request message', () => {
    test('should create a valid SwapRequest message if transaction is unconfidential.', () => {
      const psetBase64 = initialPsbtOfAlice;
      const bytes = swap.request({
        assetToBeSent: fixtures.assets.USDT,
        amountToBeSent: 30000000000,
        assetToReceive: fixtures.assets.LBTC,
        amountToReceive: 5000000,
        psetBase64,
      });

      expect(bytes).toBeDefined();
    });
  });

  test('Bob can import a SwapRequest and create a SwapAccept message', () => {
    const swapRequestMessage = swap.request({
      assetToBeSent: fixtures.assets.USDT,
      amountToBeSent: 30000000000,
      assetToReceive: fixtures.assets.LBTC,
      amountToReceive: 5000000,
      psetBase64: initialPsbtOfAlice,
    });

    const psetBase64 = initialPsbtOfBob;
    const bytes = swap.accept({ message: swapRequestMessage, psetBase64 });

    expect(bytes).toBeDefined();
  });

  test('Alice can import a SwapAccept message and create a SwapComplete message', () => {
    const swapRequestMessage = swap.request({
      assetToBeSent: fixtures.assets.USDT,
      amountToBeSent: 30000000000,
      assetToReceive: fixtures.assets.LBTC,
      amountToReceive: 5000000,
      psetBase64: initialPsbtOfAlice,
    });

    const swapAcceptMessage = swap.accept({
      message: swapRequestMessage,
      psetBase64: initialPsbtOfBob,
    });

    const bytes = swap.complete({
      message: swapAcceptMessage,
      psetBase64: finalPsbtOfAlice,
    });

    expect(bytes).toBeDefined();
  });

  describe('Swap with legacy input', () => {
    const swap = new Swap();
    let requestTx: string;
    let altcoin: string;

    const inputBlindingKeys: Record<string, Buffer> = {};

    beforeAll(async () => {
      await faucet(proposerAddress);
      const mintResult = await mint(responderAddress, 100);

      altcoin = mintResult.asset;

      const utxoProposer: UtxoInterface = (
        await fetchUtxos(proposerAddress)
      )[0];

      const proposerNonWitnessUtxo: Buffer = Buffer.from(
        await fetchTxHex(utxoProposer.txid),
        'hex'
      );

      inputBlindingKeys[
        toOutputScript(responderAddress).toString('hex')
      ] = Buffer.from(responder.getNextAddress().blindingPrivateKey, 'hex');
      inputBlindingKeys[
        toOutputScript(proposerAddress).toString('hex')
      ] = Buffer.from(proposer.getNextAddress().blindingPrivateKey, 'hex');

      requestTx = new Psbt({ network: networks.regtest })
        .addInput({
          hash: utxoProposer.txid,
          index: utxoProposer.vout,
          nonWitnessUtxo: proposerNonWitnessUtxo,
        })
        .addOutput({
          value: satoshiToConfidentialValue(100_0000_0000),
          asset: altcoin,
          nonce: Buffer.alloc(0),
          script: toOutputScript(proposerAddress),
        })
        .addOutput({
          value: satoshiToConfidentialValue(0),
          asset: networks.regtest.assetHash,
          nonce: Buffer.alloc(0),
          script: Buffer.alloc(0),
        })
        .toBase64();
    });

    function swapRequest() {
      return swap.request({
        amountToBeSent: 1_0000_0000,
        assetToBeSent: networks.regtest.assetHash,
        amountToReceive: 100_0000_0000,
        assetToReceive: altcoin,
        psetBase64: requestTx,
        inputBlindingKeys,
        outputBlindingKeys: {},
      });
    }

    test('should create a valid swap request message', () => {
      assert.doesNotThrow(() => swapRequest());
    });
  });

  describe('Confidential Swap', () => {
    let requestMessage: Uint8Array;
    let acceptMessage: Uint8Array;

    test('should create a valid SwapRequest message if the transaction is confidential.', () => {
      const fixture = fixtures.confidentialSwaps[0];
      const decodedRequestPsbt = Psbt.fromBase64(fixture.request.psbt);
      // init blind keys maps
      const inKeys: Record<string, Buffer> = {};
      // no blinded outputs at the request step
      const outKeys: Record<string, Buffer> = {};

      fixture.request.inputBlindingKeys.forEach(
        (key: string, index: number) => {
          const script: string = decodedRequestPsbt.data.inputs[
            index
          ].witnessUtxo!.script.toString('hex');
          inKeys[script] = Buffer.from(key, 'hex');
        }
      );

      assert.doesNotThrow(() => {
        requestMessage = swap.request({
          assetToBeSent: fixture.toBeSent.asset,
          amountToBeSent: fixture.toBeSent.amount,
          assetToReceive: fixture.toReceive.asset,
          amountToReceive: fixture.toReceive.amount,
          psetBase64: fixture.request.psbt,
          inputBlindingKeys: inKeys,
          outputBlindingKeys: outKeys,
        });
      });
    });

    test('should create a valid SwapAccept message if the transaction is confidential.', () => {
      const fixture = fixtures.confidentialSwaps[0];
      const decodedAcceptPsbt = Psbt.fromBase64(fixture.accept.psbt);
      // init blind keys maps
      const inKeys: Record<string, Buffer> = {};
      const outKeys: Record<string, Buffer> = {};

      fixture.accept.inputBlindingKeys.forEach((key: string, index: number) => {
        const script: string = decodedAcceptPsbt.data.inputs[
          index
        ].witnessUtxo!.script.toString('hex');
        inKeys[script] = Buffer.from(key, 'hex');
      });

      fixture.accept.outputBlindingKeys.forEach(
        (key: string, index: number) => {
          const script: string = fixture.accept.outputScripts[index];
          outKeys[script] = Buffer.from(key, 'hex');
        }
      );

      // assertions
      assert.doesNotThrow(() => {
        acceptMessage = swap.accept({
          psetBase64: fixture.accept.psbt,
          message: requestMessage,
          inputBlindingKeys: inKeys,
          outputBlindingKeys: outKeys,
        });
      });
    });

    test('should create a valid SwapComplete message if the transaction is confidential.', () => {
      assert.doesNotThrow(() => {
        swap.complete({
          message: acceptMessage,
          psetBase64: fixtures.confidentialSwaps[0].complete.psbt,
        });
      });
    });
  });
});
