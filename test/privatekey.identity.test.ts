import { AddressInterface, IdentityOpts, IdentityType } from '../src/identity';
import PrivateKey from './../src/identities/privatekey';
import * as assert from 'assert';
import { payments, ECPair, networks } from 'liquidjs-lib';

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

  describe('PrivateKey.blindPset', () => {
    it('should returns the blinded pset', () => {});
    it('should throw an error if the base54 pset cannot be blinded', () => {});
    it('should throw an error if the base64 pset encoding is not valid', () => {});
  });

  describe('PrivateKey.signPset', () => {
    it("should sign all the inputs with scriptPubKey = PrivateKey instance p2wpkh's scriptPubKey", () => {});
  });

  describe('PrivateKey.getAddresses', () => {
    it("should return the PrivateKey instance p2wpkh's address and blindPrivKey", () => {
      const privateKey = new PrivateKey(validOpts);
      const keypair = ECPair.fromWIF(
        validOpts.value.signingKeyWIF,
        networks.regtest
      );
      const keypair2 = ECPair.fromWIF(
        validOpts.value.blindingKeyWIF,
        networks.regtest
      );
      const p2wpkh = payments.p2wpkh({
        pubkey: keypair.publicKey!,
        blindkey: keypair2.publicKey!,
        network: networks.regtest,
      });

      const addr: AddressInterface = privateKey.getAddresses()[0];

      assert.deepStrictEqual(p2wpkh.confidentialAddress, addr.address);
      assert.deepStrictEqual(
        keypair2.privateKey!,
        Buffer.from(addr.blindPrivKey!, 'hex')
      );
    });
  });
});
