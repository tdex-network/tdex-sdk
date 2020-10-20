import * as bip39 from 'bip39';
import Identity, { IdentityInterface, IdentityOpts } from '../identity';

export default class Mnemonic extends Identity implements IdentityInterface {
  private words: Array<string>;

  constructor(args: IdentityOpts) {
    super(args);

    if (!args.value || !bip39.validateMnemonic(args.value)) {
      throw new Error('Mnemonic is missing or not valid');
    }

    this.words = (args.value as string).split(' ');
    console.log(this.words);
  }

  blindPset(psetBase64: string): string {
    console.log(psetBase64);
    return '';
  }

  signPset(psetBase64: string): string {
    console.log(psetBase64);
    return '';
  }
}
