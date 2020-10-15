import {
  ECPair,
  Psbt,
  Transaction,
  networks,
  confidential,
} from 'liquidjs-lib';
import { Output } from 'liquidjs-lib/types/transaction';
import { Swap } from '../src/swap';
import * as assert from 'assert';
// import { decodePsbt } from '../src/utils';

import * as fixtures from './fixtures/swap.json';

// create the keypairs from WIF.
// const alice = ECPair.fromWIF(fixtures.wif.alice, networks.regtest);
// const bob = ECPair.fromWIF(fixtures.wif.bob, networks.regtest);

interface fixtureUtxo {
  witnessUtxo: string;
  hash: string;
  vout: number;
  blindingKey: string;
  value: number;
  asset: string;
}

const ONE = 100000000;

function toOutputWitness(fixture: fixtureUtxo): Output {
  const tx = Transaction.fromHex(fixture.witnessUtxo);
  return tx.outs[fixture.vout];
}

function updateTx(
  base64RequestTx: string,
  utxo: fixtureUtxo,
  asset: string,
  script: string,
  addFee?: boolean
): { base64tx: string; blindingKeys: Record<string, Buffer> } {
  const witnessOut: Output = toOutputWitness(utxo);
  const tx = Psbt.fromBase64(base64RequestTx)
    .addInput({
      hash: utxo.hash,
      index: utxo.vout,
      witnessUtxo: witnessOut,
    })
    .addOutput({
      asset: asset,
      nonce: Buffer.from('00', 'hex'),
      value: confidential.satoshiToConfidentialValue(utxo.value),
      // fake script: doesn't matter to test SWAP
      script: Buffer.from(
        // 'aaaaaaaaa97080b51ef22c59bd7469afacffbeec0da12e18ab',
        script,
        'hex'
      ),
    });

  if (addFee) {
    tx.addOutput({
      asset: utxo.asset,
      nonce: Buffer.from('00', 'hex'),
      value: confidential.satoshiToConfidentialValue(0),
      script: Buffer.from('00', 'hex'),
    });
  }
  const keys: Record<string, Buffer> = {};
  keys[witnessOut.script.toString('hex')] = Buffer.from(
    utxo.blindingKey,
    'hex'
  );

  return {
    base64tx: tx.toBase64(),
    blindingKeys: keys,
  };
}

function blindOutputs(
  base64: string,
  inputBlindingKeys: Buffer[],
  numberOfOutput: number
): { base64tx: string; blindingKeys: Buffer[] } {
  const keypairs: { priv: Buffer; pub: Buffer }[] = [];
  for (let j = 0; j < numberOfOutput; j++) {
    const b = ECPair.makeRandom({ network: networks.regtest });
    keypairs.push({ priv: b.privateKey!, pub: b.publicKey! });
  }

  const tx = Psbt.fromBase64(base64);

  const base64tx = tx
    .blindOutputs(
      inputBlindingKeys,
      keypairs.map(keypair => keypair.pub)
    )
    .toBase64();

  return { base64tx, blindingKeys: keypairs.map(k => k.priv) };
}

function createConfidentialRequestTx(
  utxoP: fixtureUtxo,
  assetP: string,
  utxoR: fixtureUtxo,
  assetR: string
): {
  base64: string;
  outBlindKeys: Record<string, Buffer>;
  inBlindKeys: Record<string, Buffer>;
} {
  const first = updateTx(
    new Psbt({ network: networks.regtest }).toBase64(),
    utxoP,
    assetR,
    'aaaaaaaa97080b51ef22c59bd7469afacffbeec0da12e18ab',
    true
  );

  const second = updateTx(
    first.base64tx,
    utxoR,
    assetP,
    'bbbbbbbb97080b51ef22c59bd7469afacffbeec0da12e18ab'
  );

  const inBlindKeys: Record<string, Buffer> = {
    ...first.blindingKeys,
    ...second.blindingKeys,
  };

  const blind = blindOutputs(second.base64tx, Object.values(inBlindKeys), 2);

  const outBlindKeys: Record<string, Buffer> = {
    aaaaaaaa97080b51ef22c59bd7469afacffbeec0da12e18ab: blind.blindingKeys[0],
    bbbbbbbb97080b51ef22c59bd7469afacffbeec0da12e18ab: blind.blindingKeys[1],
  };

  return { base64: blind.base64tx, inBlindKeys, outBlindKeys };
}

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
      const psbtBase64 = initialPsbtOfAlice;
      const bytes = swap.request({
        assetToBeSent: fixtures.assets.USDT,
        amountToBeSent: 30000000000,
        assetToReceive: fixtures.assets.LBTC,
        amountToReceive: 5000000,
        psbtBase64,
      });

      expect(bytes).toBeDefined();
    });

    test('should create a valid SwapRequest message if the transaction is confidential.', () => {
      const utxoA: fixtureUtxo = fixtures.utxos.alice[0];
      const utxoB: fixtureUtxo = fixtures.utxos.bob[0];

      const { base64, inBlindKeys, outBlindKeys } = createConfidentialRequestTx(
        utxoA,
        utxoB.asset,
        utxoB,
        utxoA.asset
      );

      assert.doesNotThrow(() => {
        swap.request({
          assetToBeSent: utxoA.asset,
          amountToBeSent: ONE,
          assetToReceive: utxoB.asset,
          amountToReceive: ONE,
          psbtBase64: base64,
          inputBlindingKeys: inBlindKeys,
          outputBlindingKeys: outBlindKeys,
        });
      });
      // expect(msg).toBeDefined();
    });

    test('should create a valid SwapAccept message if the transaction is confidential.', () => {});
  });

  test('Bob can import a SwapRequest and create a SwapAccept message', () => {
    const swapRequestMessage = swap.request({
      assetToBeSent: fixtures.assets.USDT,
      amountToBeSent: 30000000000,
      assetToReceive: fixtures.assets.LBTC,
      amountToReceive: 5000000,
      psbtBase64: initialPsbtOfAlice,
    });

    const psbtBase64 = initialPsbtOfBob;
    const bytes = swap.accept({ message: swapRequestMessage, psbtBase64 });

    expect(bytes).toBeDefined();
  });

  test('Alice can import a SwapAccept message and create a SwapComplete message', () => {
    const swapRequestMessage = swap.request({
      assetToBeSent: fixtures.assets.USDT,
      amountToBeSent: 30000000000,
      assetToReceive: fixtures.assets.LBTC,
      amountToReceive: 5000000,
      psbtBase64: initialPsbtOfAlice,
    });

    const swapAcceptMessage = swap.accept({
      message: swapRequestMessage,
      psbtBase64: initialPsbtOfBob,
    });

    const bytes = swap.complete({
      message: swapAcceptMessage,
      psbtBase64: finalPsbtOfAlice,
    });

    expect(bytes).toBeDefined();
  });
});
