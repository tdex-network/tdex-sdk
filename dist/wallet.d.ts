import { ECPairInterface } from 'liquidjs-lib/types/ecpair';
import { Network } from 'liquidjs-lib/types/networks';
export interface WatchOnlyWalletInterface {
    address: string;
    script: string;
    network: Network;
    updateTx(psbtBase64: string, inputs: Array<any>, inputAmount: number, outputAmount: number, inputAsset: string, outputAsset: string): string;
}
export declare class WatchOnlyWallet implements WatchOnlyWalletInterface {
    network: Network;
    address: string;
    script: string;
    constructor({ address, network }: {
        address: string;
        network: Network;
    });
    static fromAddress: typeof fromAddress;
    static createTx: typeof createTx;
    static toHex: typeof toHex;
    updateTx(psbtBase64: string, inputs: Array<any>, inputAmount: number, outputAmount: number, inputAsset: string, outputAsset: string): string;
}
export interface WalletInterface extends WatchOnlyWalletInterface {
    keyPair: ECPairInterface;
    privateKey: string;
    publicKey: string;
    sign(psbtBase64: string): string;
}
export declare class Wallet extends WatchOnlyWallet implements WalletInterface {
    keyPair: ECPairInterface;
    privateKey: string;
    publicKey: string;
    static fromWIF: typeof fromWIF;
    static fromRandom: typeof fromRandom;
    constructor({ network, address, keyPair, }: {
        network: Network;
        address: string;
        keyPair: ECPairInterface | undefined;
    });
    updateTx: (psbtBase64: string, inputs: any[], inputAmount: number, outputAmount: number, inputAsset: string, outputAsset: string) => string;
    sign(psbtBase64: string): string;
}
declare function fromAddress(address: string, network?: string): WatchOnlyWalletInterface;
declare function fromRandom(network?: string): WalletInterface;
declare function fromWIF(wif: string, network?: string): WalletInterface;
declare function createTx(network?: string): string;
declare function toHex(psbtBase64: string): string;
export declare function fetchUtxos(address: string, url: string): Promise<any>;
export declare function fetchBalances(address: string, url: string): Promise<any>;
export {};
