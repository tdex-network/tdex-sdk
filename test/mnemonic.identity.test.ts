import { IdentityOpts, IdentityType } from './../src/identity';
import Mnemonic from './../src/identities/mnemonic';
import { fromSeed as slip77fromSeed } from 'slip77';
import { fromSeed as bip32fromSeed } from 'bip32';
import * as assert from 'assert';
import {
  // confidential,
  // ECPair,
  networks,
  // payments,
  // Psbt,
  // Transaction,
} from 'liquidjs-lib';
// import { faucet, fetchTxHex, fetchUtxos } from './_regtest';
import { mnemonicToSeedSync } from 'bip39';

const network = networks.regtest;

const validOpts: IdentityOpts = {
  chain: 'regtest',
  type: IdentityType.Mnemonic,
  value: {
    mnemonic:
      'pause quantum three welcome become episode tackle achieve predict mimic share task onion vapor announce exist inner fortune stamp crucial angle neither manage denial',
  },
};

const seedFromValidMnemonic = mnemonicToSeedSync(validOpts.value.mnemonic);
const masterPrivateKeyFromValidMnemonic = bip32fromSeed(
  seedFromValidMnemonic,
  network
);
const masterBlindingKeyFromValidMnemonic = slip77fromSeed(
  seedFromValidMnemonic
);

const validOptsFrench: IdentityOpts = {
  ...validOpts,
  value: {
    mnemonic:
      'mutuel ourson soupape vertu atelier dynastie silicium absolu océan légume pyramide skier météore tulipe alchimie élargir gourmand étaler saboter cocotier aisance mairie jeton créditer',
    language: 'french',
  },
};

const unvalidLanguageOpts: IdentityOpts = {
  ...validOpts,
  value: {
    ...validOpts.value,
    language: 'corsican',
  },
};

const unvalidTypeOpts: IdentityOpts = {
  ...validOpts,
  type: IdentityType.PrivateKey,
};

const unvalidValueOpts: IdentityOpts = {
  ...validOpts,
  value: { vulpem: 'company', language: 'italian' },
};

const unvalidMnemonicOpts: IdentityOpts = {
  ...validOpts,
  value: {
    mnemonic: 'tbh nigiri is awesome for Liquid / bitcoin unit testing',
  },
};

// const keypair = ECPair.fromWIF(validOpts.value.signingKeyWIF, network);
// const keypair2 = ECPair.fromWIF(validOpts.value.blindingKeyWIF, network);
// const p2wpkh = payments.p2wpkh({
//   pubkey: keypair.publicKey!,
//   blindkey: keypair2.publicKey!,
//   network: network,
// });

describe('Identity: Private key', () => {
  describe('Constructor', () => {
    const validMnemonic = new Mnemonic(validOpts);

    it('should build a valid Mnemonic class if the constructor arguments are valid', () => {
      assert.deepStrictEqual(validMnemonic instanceof Mnemonic, true);
    });

    it('should generate a slip77 master blinding key and a bip32 master private key from the mnemonic', () => {
      assert.deepStrictEqual(
        validMnemonic.masterBlindingKey,
        masterBlindingKeyFromValidMnemonic
      );
      assert.deepStrictEqual(
        validMnemonic.masterPrivateKey,
        masterPrivateKeyFromValidMnemonic
      );
    });

    it('should work if a language is specified', () => {
      const frenchMnemonic = new Mnemonic(validOptsFrench);
      assert.deepStrictEqual(frenchMnemonic instanceof Mnemonic, true);
    });

    it('should throw an error if type is not IdentityType.Mnemonic', () => {
      assert.throws(() => new Mnemonic(unvalidTypeOpts));
    });

    it('should throw an error if value of IdentityOpts is not of type {mnemonic: string; language?: string, passphrase?: string;}', () => {
      assert.throws(() => new Mnemonic(unvalidValueOpts));
    });

    it('should throw an error if the language is unvalid (i.e has no wordlist available)', () => {
      assert.throws(() => new Mnemonic(unvalidLanguageOpts));
    });

    it('should throw an error if the mnemonic is unvalid', () => {
      assert.throws(() => new Mnemonic(unvalidMnemonicOpts));
    });
  });

  // describe('Mnemonic.signPset', () => {
  //   it("should sign all the inputs with scriptPubKey = PrivateKey instance p2wpkh's scriptPubKey", async () => {
  //     await faucet(p2wpkh.confidentialAddress!);
  //     const utxo = (await fetchUtxos(p2wpkh.confidentialAddress!))[0];
  //     const prevoutHex = await fetchTxHex(utxo.txid);
  //     const prevout = Transaction.fromHex(prevoutHex).outs[utxo.vout];

  //     const unblindedUtxo = confidential.unblindOutput(
  //       Buffer.from(utxo.noncecommitment, 'hex'),
  //       keypair2.privateKey!,
  //       prevout.rangeProof!,
  //       Buffer.from(utxo.valuecommitment, 'hex'),
  //       Buffer.from(utxo.assetcommitment, 'hex'),
  //       p2wpkh.output!
  //     );

  //     const pset: Psbt = new Psbt({ network })
  //       .addInput({
  //         hash: utxo.txid,
  //         index: utxo.vout,
  //         witnessUtxo: {
  //           nonce: Buffer.from('00', 'hex'),
  //           value: confidential.satoshiToConfidentialValue(
  //             parseInt(unblindedUtxo.value, 10)
  //           ),
  //           asset: unblindedUtxo.asset,
  //           script: p2wpkh.output!,
  //         },
  //       })
  //       .addOutputs([
  //         {
  //           nonce: Buffer.from('00', 'hex'),
  //           value: confidential.satoshiToConfidentialValue(49999500),
  //           script: p2wpkh.output!,
  //           asset: network.assetHash,
  //         },
  //         {
  //           nonce: Buffer.from('00', 'hex'),
  //           value: confidential.satoshiToConfidentialValue(60000000),
  //           script: Buffer.alloc(0),
  //           asset: network.assetHash,
  //         },
  //       ]);
  //   });
  // });

  describe('Mnemonic.getAddresses', () => {
    it("should return the PrivateKey instance p2wpkh's address and blindPrivKey", () => {});
  });
});