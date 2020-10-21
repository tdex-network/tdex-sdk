import { Network, networks } from 'liquidjs-lib';

export enum IdentityType {
  PrivateKey = 1,
  Mnemonic,
  Inject,
  Ledger,
  Trezor,
}

export interface AddressInterface {
  address: string;
  // in case of unconfidential address: blindPrivKey = undefined.
  blindPrivKey?: string;
}

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
