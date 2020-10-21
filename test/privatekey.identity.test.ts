import { AddressInterface, IdentityOpts, IdentityType } from '../src/identity';
import PrivateKey from './../src/identities/privatekey';
import * as assert from 'assert';
import {
  payments,
  ECPair,
  networks,
  Psbt,
  Transaction,
  confidential,
} from 'liquidjs-lib';
import { faucet, fetchTxHex, fetchUtxos } from './_regtest';

// increase default timeout of jest
jest.setTimeout(15000);

const validOpts: IdentityOpts = {
  chain: 'regtest',
  type: IdentityType.PrivateKey,
  value: {
    signingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    blindingKeyWIF: 'cRdrvnPMLV7CsEak2pGrgG4MY7S3XN1vjtcgfemCrF7KJRPeGgW6',
  },
};

const unvalidTypeOpts: IdentityOpts = {
  ...validOpts,
  type: IdentityType.Mnemonic,
};

const unvalidValueOpts: IdentityOpts = {
  ...validOpts,
  value: { notSigningKey: 'xxx', vulpem: 'company' },
};

const unvalidWIF: IdentityOpts = {
  ...validOpts,
  value: {
    signingKeyWIF: 'cPNMJD4VyFnQjGbGs3kcydRzAbDCXrLAbvH6wTCqs88qg1SkZT3J',
    blindingKey: 'invalidWIF',
  },
};

const keypair = ECPair.fromWIF(validOpts.value.signingKeyWIF, networks.regtest);
const keypair2 = ECPair.fromWIF(
  validOpts.value.blindingKeyWIF,
  networks.regtest
);
const p2wpkh = payments.p2wpkh({
  pubkey: keypair.publicKey!,
  blindkey: keypair2.publicKey!,
  network: networks.regtest,
});

describe('Identity: Private key', () => {
  describe('Constructor', () => {
    it('should build a valid PrivateKey class if the constructor arguments are valid', () => {
      const privateKey = new PrivateKey(validOpts);
      assert.deepStrictEqual(privateKey instanceof PrivateKey, true);
    });

    it('should throw an error if type is not IdentityType.PrivateKey', () => {
      assert.throws(() => new PrivateKey(unvalidTypeOpts));
    });

    it('should throw an error if value of IdentityOpts is not of type {signingKeyWIF: string; blindingKeyWIF: string;}', () => {
      assert.throws(() => new PrivateKey(unvalidValueOpts));
    });

    it('should throw an error if signingKey AND/OR blindingKey are not WIF encoded string', () => {
      assert.throws(() => new PrivateKey(unvalidWIF));
    });
  });

  describe('PrivateKey.signPset', () => {
    it("should sign all the inputs with scriptPubKey = PrivateKey instance p2wpkh's scriptPubKey", async () => {
      await faucet(p2wpkh.confidentialAddress!);
      const utxo = (await fetchUtxos(p2wpkh.confidentialAddress!))[0];
      const prevoutHex = await fetchTxHex(utxo.txid);
      const witnessUtxo = Transaction.fromHex(prevoutHex).outs[utxo.vout];

      const pset: Psbt = new Psbt({ network: networks.regtest })
        .addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo,
        })
        .addOutputs([
          {
            nonce: Buffer.from('00', 'hex'),
            value: confidential.satoshiToConfidentialValue(49999500),
            script: p2wpkh.output!,
            asset: networks.regtest.assetHash,
          },
          {
            nonce: Buffer.from('00', 'hex'),
            value: confidential.satoshiToConfidentialValue(60000000),
            script: Buffer.alloc(0),
            asset: networks.regtest.assetHash,
          },
        ]);

      const privateKey = new PrivateKey(validOpts);
      const signedBase64 = await privateKey.signPset(pset.toBase64());
      const signedPsbt = Psbt.fromBase64(signedBase64);
      let isValid: boolean = false;
      assert.doesNotThrow(
        () => (isValid = signedPsbt.validateSignaturesOfAllInputs())
      );
      assert.deepStrictEqual(isValid, true);
    });
  });

  describe('PrivateKey.getAddresses', () => {
    it("should return the PrivateKey instance p2wpkh's address and blindPrivKey", () => {
      const privateKey = new PrivateKey(validOpts);
      const addr: AddressInterface = privateKey.getAddresses()[0];
      assert.deepStrictEqual(p2wpkh.confidentialAddress, addr.address);
      assert.deepStrictEqual(
        keypair2.privateKey!,
        Buffer.from(addr.blindPrivKey!, 'hex')
      );
    });
  });
});
