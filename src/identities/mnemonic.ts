import { confidential, ECPair, payments, Psbt, TxOutput } from 'liquidjs-lib';
import * as bip39 from 'bip39';
import { fromSeed as slip77fromSeed, Slip77Interface } from 'slip77';
import { fromSeed as bip32fromSeed, BIP32Interface } from 'bip32';
import Identity, {
  AddressInterface,
  IdentityInterface,
  IdentityOpts,
  IdentityType,
} from '../identity';

export interface MnemonicOptsValue {
  mnemonic: string;
  language?: string;
}

function instanceOfMnemonicOptsValue(value: any): value is MnemonicOptsValue {
  return 'mnemonic' in value;
}

interface AddressInterfaceExtended {
  address: AddressInterface;
  signingPrivateKey: string;
  derivationPath: string;
}

type AddressCacheMap = Record<string, AddressInterfaceExtended>;

export default class Mnemonic extends Identity implements IdentityInterface {
  static INITIAL_BASE_PATH: string = "m/84'/0'/0'";
  static INITIAL_INDEX: number = 0;

  private derivationPath: string = Mnemonic.INITIAL_BASE_PATH;
  private index: number = Mnemonic.INITIAL_INDEX;
  private scriptToAddressCache: AddressCacheMap = {};

  readonly masterPrivateKeyNode: BIP32Interface;
  readonly masterBlindingKeyNode: Slip77Interface;

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
    } else {
      bip39.setDefaultWordlist('english');
    }

    // validate the mnemonic
    if (!bip39.validateMnemonic(args.value.mnemonic)) {
      throw new Error('Mnemonic is not valid.');
    }

    // retreive the wallet's seed from mnemonic
    const walletSeed = bip39.mnemonicToSeedSync(args.value.mnemonic);
    // generate the master private key from the wallet seed
    this.masterPrivateKeyNode = bip32fromSeed(walletSeed, this.network);
    // generate the master blinding key from the seed
    this.masterBlindingKeyNode = slip77fromSeed(walletSeed);
  }

  private getNextKeypair(): { publicKey: Buffer; privateKey: Buffer } {
    const baseNode = this.masterPrivateKeyNode.derivePath(this.derivationPath);
    const wif: string = baseNode.deriveHardened(this.index).toWIF();
    const { publicKey, privateKey } = ECPair.fromWIF(wif, this.network);
    this.index += 1;
    return { publicKey: publicKey!, privateKey: privateKey! };
  }

  private getBlindingKeyPair(
    scriptPubKey: Buffer
  ): { publicKey: Buffer; privateKey: Buffer } {
    const { publicKey, privateKey } = this.masterBlindingKeyNode.derive(
      scriptPubKey
    );
    return { publicKey: publicKey!, privateKey: privateKey! };
  }

  getNextConfidentialAddress(): AddressInterface {
    const currentIndex = this.index;
    // get the next key pair
    const keyPair = this.getNextKeypair();
    // use the public key to compute the scriptPubKey
    const script: Buffer = payments.p2wpkh({
      pubkey: keyPair.publicKey!,
      network: this.network,
    }).output!;
    // generate the blindKeyPair from the scriptPubKey
    const blindingKeyPair = this.getBlindingKeyPair(script);
    // with blindingPublicKey & signingPublicKey, generate the confidential address
    const { confidentialAddress } = payments.p2wpkh({
      pubkey: keyPair.publicKey!,
      blindkey: blindingKeyPair.publicKey!,
      network: this.network,
    });
    // create the address generation object
    const newAddressGeneration: AddressInterfaceExtended = {
      address: {
        confidentialAddress: confidentialAddress!,
        blindingPrivateKey: blindingKeyPair.privateKey!.toString('hex'),
      },
      derivationPath: `${this.derivationPath}/${currentIndex}`,
      signingPrivateKey: keyPair.privateKey!.toString('hex'),
    };
    // store the generation inside local cache
    this.scriptToAddressCache[script.toString('hex')] = newAddressGeneration;
    // return the generation data
    return newAddressGeneration.address;
  }

  async signPset(psetBase64: string): Promise<string> {
    const pset = Psbt.fromBase64(psetBase64);
    const signInputPromises: Array<Promise<void>> = [];

    for (let index = 0; index < pset.data.inputs.length; index++) {
      const input = pset.data.inputs[index];
      if (input.witnessUtxo) {
        const addressGeneration = this.scriptToAddressCache[
          input.witnessUtxo.script.toString()
        ];

        if (addressGeneration) {
          // if there is an address generated for the input script: build the signing key pair.
          const privateKeyBuffer = Buffer.from(
            addressGeneration.signingPrivateKey,
            'hex'
          );
          const signingKeyPair = ECPair.fromPrivateKey(privateKeyBuffer);
          // add the promise to array
          signInputPromises.push(pset.signInputAsync(index, signingKeyPair));
        }
      }
    }
    // wait that all signing promise resolved
    await Promise.all(signInputPromises);
    // return the signed pset, base64 encoded.
    return pset.toBase64();
  }

  // returns all the addresses generated
  getAddresses(): AddressInterface[] {
    return Object.values(this.scriptToAddressCache).map(
      addrExtended => addrExtended.address
    );
  }
}
