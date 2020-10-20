import { ECPair, ECPairInterface } from 'liquidjs-lib';
import Identity, { IdentityInterface, IdentityOpts } from '../identity';

export default class PrivateKey extends Identity implements IdentityInterface {
  private keyPair: ECPairInterface;

  constructor(args: IdentityOpts) {
    super(args);

    if (!args.value) {
      throw new Error('Private key is missing or not valid');
    }

    this.keyPair = ECPair.fromWIF(args.value, this.network);
    console.log(this.keyPair)

  }

  blindPset(psetBase64: string): string {
    console.log(psetBase64)

    return '';
  }

  signPset(psetBase64: string): string {
    console.log(psetBase64)

    return '';
  }
}
