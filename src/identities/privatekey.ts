import { ECPair, ECPairInterface, payments, Psbt } from 'liquidjs-lib';
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

    // validate all the signature
    // const notValidSignatures: number[] = indexOfInputs
    //   .map((inputIndex: number) =>
    //     pset.validateSignaturesOfInput(
    //       inputIndex,
    //       this.signingKeyPair.publicKey
    //     )
    //       ? -1
    //       : inputIndex
    //   )
    //   .filter((i: number) => i !== -1);

    // throw an error if the signature is invalid for at least one of the input to sign.
    // if (notValidSignatures.length > 0) {
    //   throw new Error(
    //     `At least 1 input signature is unvalid. Invalid signature input index: ${notValidSignatures}`
    //   );
    // }
    // return the base64 encoded pset.
    return pset.toBase64();
  }

  /**
   * for private key: only returns one confidential address & the associated blindingPrivKey.
   */
  getAddresses(): AddressInterface[] {
    return [{ address: this.address, blindPrivKey: this.blindPrivKey }];
  }
}
