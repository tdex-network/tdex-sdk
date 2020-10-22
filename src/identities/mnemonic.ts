import { IdentityType } from './../identity';
import * as bip39 from 'bip39';
import { fromSeed as slip77fromSeed, Slip77Interface } from 'slip77';
import { fromSeed as bip32fromSeed, BIP32Interface } from 'bip32';
import Identity, {
  AddressInterface,
  IdentityInterface,
  IdentityOpts,
} from '../identity';

export interface MnemonicOptsValue {
  mnemonic: string;
  language?: string;
  passphrase?: string;
}

function instanceOfMnemonicOptsValue(value: any): value is MnemonicOptsValue {
  return 'mnemonic' in value;
}

export default class Mnemonic extends Identity implements IdentityInterface {
  private walletSeed: Buffer;
  readonly masterPrivateKey: BIP32Interface;
  readonly masterBlindingKey: Slip77Interface;

  constructor(args: IdentityOpts) {
    super(args);

    // check the identity type
    if (args.type !== IdentityType.Mnemonic) {
      throw new Error('The identity arguments have not the Mnemonic type.');
    }
    // check the arguments
    if (!instanceOfMnemonicOptsValue(args.value)) {
      throw new Error(
        'The value of IdentityOpts is not valid for Mnemonic Identity.'
      );
    }
    // check set the language if it is different of the default language.
    // the "language exists check" is delegated to `bip39.setDefaultWordlist` function.
    if (args.value.language) {
      bip39.setDefaultWordlist(args.value.language);
    }

    // validate the mnemonic
    if (!bip39.validateMnemonic(args.value.mnemonic)) {
      throw new Error('Mnemonic is not valid.');
    }

    // set up the wallet's seed.
    this.walletSeed = bip39.mnemonicToSeedSync(
      args.value.mnemonic,
      args.value.passphrase
    );
    // generate the master private key from the wallet seed
    this.masterPrivateKey = bip32fromSeed(this.walletSeed, this.network);
    // generate the master blinding key from the seed
    this.masterBlindingKey = slip77fromSeed(this.walletSeed);
  }

  signPset(psetBase64: string): string {
    console.log(psetBase64);
    return '';
  }

  getAddresses(): AddressInterface[] {
    return [{ confidentialAddress: '', blindingPrivateKey: '' }];
  }
}
