import { Mnemonic, IdentityOpts, MnemonicOpts, IdentityInterface } from 'ldk';
import { ECPair, Psbt } from 'liquidjs-lib';

/**
 * @class Mnemonic
 * Get a mnemonic as parameter to set up an HD Wallet.
 * @member masterPrivateKeyNode a BIP32 node computed from the seed, used to generate signing key pairs.
 * @member masterBlindingKeyNode a SLIP77 node computed from the seed, used to generate the blinding key pairs.
 * @member derivationPath the base derivation path.
 * @member index the next index used to derive the base node (for signing key pairs).
 * @member scriptToAddressCache a map scriptPubKey --> address generation.
 */
export class TDEXMnemonic extends Mnemonic implements IdentityInterface {
  constructor(args: IdentityOpts<MnemonicOpts>) {
    super({ ...args });
  }

  /**
   * return the next keypair derivated from the baseNode.
   * increment the private member index +1.
   */
  private _derivePath(
    derivationPath: string
  ): { publicKey: Buffer; privateKey: Buffer } {
    const wif: string = this.masterPrivateKeyNode
      .derivePath(derivationPath)
      .toWIF();
    const { publicKey, privateKey } = ECPair.fromWIF(wif, this.network);
    return { publicKey: publicKey!, privateKey: privateKey! };
  }

  async signPset(psetBase64: string): Promise<string> {
    const pset = Psbt.fromBase64(psetBase64);
    const signInputPromises: Array<Promise<void>> = [];

    for (let index = 0; index < pset.data.inputs.length; index++) {
      const input = pset.data.inputs[index];
      if (input.witnessUtxo) {
        const addressGeneration = this.scriptToAddressCache[
          input.witnessUtxo.script.toString('hex')
        ];

        if (addressGeneration) {
          // if there is an address generated for the input script: build the signing key pair.
          const privateKeyBuffer = this._derivePath(
            addressGeneration.address.derivationPath!
          ).privateKey;
          const signingKeyPair = ECPair.fromPrivateKey(privateKeyBuffer);
          // add the promise to array
          signInputPromises.push(pset.signInputAsync(index, signingKeyPair));
        }
      }
    }
    // wait that all signing promise resolved
    await Promise.all(signInputPromises);
    pset.validateSignaturesOfAllInputs();
    pset.finalizeAllInputs();

    // return the signed raw tx, hex encoded.
    return pset.extractTransaction().toHex();
  }
}
