import { IdentityOpts, IdentityType } from '../src/identity';
import PrivateKey from './../src/identities/privatekey';
import * as assert from 'assert';

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
});
