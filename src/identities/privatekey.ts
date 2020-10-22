import { ECPair, ECPairInterface, payments, Psbt } from 'liquidjs-lib';
import Identity, {
  AddressInterface,
  IdentityInterface,
  IdentityOpts,
  IdentityType,
} from '../identity';

/**
 * This interface describes the shape of the value arguments used in contructor.
 * @member signingKeyWIF a valid private key WIF encoded.
 * @member blindingKeyWIF a valid private key WIF encoded.
 */
export interface PrivateKeyOptsValue {
  signingKeyWIF: string;
  blindingKeyWIF: string;
}

/**
 * A type guard function for PrivateKeyOptsValue
 * @see PrivateKeyOptsValue
 */
function instanceOfPrivateKeyOptsValue(
  value: any
): value is PrivateKeyOptsValue {
  return 'signingKeyWIF' in value && 'blindingKeyWIF' in value;
}

/**
 * The PrivateKey Identity take WIF and modelize a user using his private key.
 * @member signingKeyPair private, the key pair used to sign inputs.
 * @member blindingKeyPair private, the key pair used to blind outputs.
 * @member confidentialAddress private, the confidential address generated from keypairs.
 * @member blindingPrivateKey private, the blinding private key associated with the confidential address.
 * @member scriptPubKey private, the scriptPubKey associated to the confidential address.
 * @method signPset sign all the inputs when it's possible (scriptPubKey = input's script).
 * @method getAddresses return an array of one element containing the blindingPrivateKey & the confidentialAddress.
 */
export default class PrivateKey extends Identity implements IdentityInterface {
  private signingKeyPair: ECPairInterface;
  private blindingKeyPair: ECPairInterface;

  private confidentialAddress: string;
  private blindingPrivateKey: string;
  private scriptPubKey: Buffer;

  constructor(args: IdentityOpts) {
    super(args);

    // checks the args type.
    if (args.type !== IdentityType.PrivateKey) {
      throw new Error('The identity arguments have not the PrivateKey type.');
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
    this.confidentialAddress = p2wpkh.confidentialAddress!;
    this.blindingPrivateKey = this.blindingKeyPair.privateKey!.toString('hex');
    this.scriptPubKey = p2wpkh.output!;
  }

  /**
   * iterate through inputs and sign when it's possible, then returns the signed pset (base64 encoded).
   * @param psetBase64 the base64 encoded pset.
   */
  async signPset(psetBase64: string): Promise<string> {
    const pset = Psbt.fromBase64(psetBase64);
    const indexOfInputs: number[] = [];

    for (let index = 0; index < pset.data.inputs.length; index++) {
      const input = pset.data.inputs[index];
      if (input.witnessUtxo) {
        if (input.witnessUtxo.script.equals(this.scriptPubKey)) {
          indexOfInputs.push(index);
        }
      } else {
        indexOfInputs.push(index);
      }
    }

    // sign all the inputs asynchronously
    await Promise.all(
      pset.data.inputs.map((_, index: number) =>
        pset.signInputAsync(index, this.signingKeyPair)
      )
    );

    return pset.toBase64();
  }

  /**
   * for private key: only returns one confidential address & the associated blindingPrivKey.
   */
  getAddresses(): AddressInterface[] {
    return [
      {
        confidentialAddress: this.confidentialAddress,
        blindingPrivateKey: this.blindingPrivateKey,
      },
    ];
  }
}
