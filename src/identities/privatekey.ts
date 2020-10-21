import { ECPair, ECPairInterface, payments } from 'liquidjs-lib';
import Identity, {
  AddressInterface,
  IdentityInterface,
  IdentityOpts,
  IdentityType,
} from '../identity';

export interface PrivateKeyOptsValue {
  signingKeyWIF: string;
  blindingKeyWIF: string;
}

function instanceOfPrivateKeyOptsValue(
  value: any
): value is PrivateKeyOptsValue {
  return 'signingKeyWIF' in value && 'blindingKeyWIF' in value;
}

export default class PrivateKey extends Identity implements IdentityInterface {
  private signingKeyPair: ECPairInterface;
  private blindingKeyPair: ECPairInterface;

  private address: string;
  private blindPrivKey: string;
  private scriptPubKey: Buffer;

  constructor(args: IdentityOpts) {
    super(args);

    // checks the args type.
    if (args.type !== IdentityType.PrivateKey) {
      throw new Error('The identity arguments has not the PrivateKey type.');
    }

    // checks if args.value is an instance of PrivateKeyOptsValue interface.
    if (!instanceOfPrivateKeyOptsValue(args.value)) {
      throw new Error(
        'The value of IdentityOpts is not valid for PrivateKey Identity.'
      );
    }

    // decode signing key pair from WIF
    this.signingKeyPair = ECPair.fromWIF(
      args.value.signingKeyWIF,
      this.network
    );

    // decode blinding key pair from WIF
    this.blindingKeyPair = ECPair.fromWIF(
      args.value.blindingKeyWIF,
      this.network
    );

    // create payment
    const p2wpkh = payments.p2wpkh({
      pubkey: this.signingKeyPair.publicKey,
      blindkey: this.blindingKeyPair.publicKey,
      network: this.network,
    });

    // store data inside private fields.
    this.address = p2wpkh.confidentialAddress!;
    this.blindPrivKey = this.blindingKeyPair.privateKey!.toString('hex');
    this.scriptPubKey = p2wpkh.output!;
  }

  blindPset(psetBase64: string): string {
    console.log(psetBase64);
    return '';
  }

  signPset(psetBase64: string): string {
    console.log(psetBase64);
    console.log(this.scriptPubKey);

    return '';
  }

  // for private key: only returns one confidential address & the associated blindingPrivKey.
  getAddresses(): AddressInterface[] {
    return [{ address: this.address, blindPrivKey: this.blindPrivKey }];
  }
}
