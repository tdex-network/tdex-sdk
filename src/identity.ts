import { Network, networks } from 'liquidjs-lib';

export enum IdentityType {
  PrivateKey = 1,
  Mnemonic,
  Inject,
  Ledger,
  Trezor,
}

export interface IdentityInterface {
  network: Network;
  type: IdentityType;
  blindPset(psetBase64: string): string;
  signPset(psetBase64: string): string;
  getAddresses(): Array<{ address: string; blindPrivKey?: string }>;
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
