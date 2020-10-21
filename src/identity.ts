import { Network, networks } from 'liquidjs-lib';

/**
 * Enumeration of all the Identity types.
 */
export enum IdentityType {
  PrivateKey = 1,
  Mnemonic,
  Inject,
  Ledger,
  Trezor,
}

/**
 * Defines the shape of the object returned by the getAdresses's method.
 */
export interface AddressInterface {
  address: string;
  // in case of unconfidential address: blindPrivKey = undefined.
  blindPrivKey?: string;
}

/**
 * The identity interface.
 * @member network the network type (regtest, liquid...)
 * @member type the Identity type @see IdentityType
 * @method signPset take a base64 pset, sign it, and returns the result base64 encoded.
 * @method getAddresses returns all the generated addresses (and their blindkey if confidential).
 */
export interface IdentityInterface {
  network: Network;
  type: IdentityType;
  signPset(psetBase64: string): string | Promise<string>;
  getAddresses(): AddressInterface[];
}

export interface IdentityOpts {
  chain: string;
  type: number;
  value: any;
}

export default class Identity {
  network: Network;
  type: IdentityType;

  constructor(args: IdentityOpts) {
    if (!args.chain || !networks.hasOwnProperty(args.chain)) {
      throw new Error('Network is missing or not valid');
    }

    if (!args.type || !(args.type in IdentityType)) {
      throw new Error('Type is missing or not valid');
    }

    this.network = (networks as Record<string, Network>)[args.chain];
    this.type = args.type;
  }
}
