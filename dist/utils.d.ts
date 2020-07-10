/// <reference types="node" />
import { Psbt, Transaction } from 'liquidjs-lib';
export declare function toAssetHash(x: Buffer): string;
export declare function toNumber(x: Buffer): number;
export declare function calculateExpectedAmount(proposeBalance: number, receiveBalance: number, proposedAmount: number, feeWithDecimals: number): number;
export declare function calculateProposeAmount(proposeBalance: number, receiveBalance: number, expectedAmount: number, feeWithDecimals: number): number;
export declare function makeid(length: number): string;
export declare function decodePsbt(psbtBase64: string): {
    psbt: Psbt;
    transaction: Transaction;
};
export interface UtxoInterface {
    txid: string;
    vout: number;
    asset: string;
    value: number;
    script?: string;
}
export declare function coinselect(utxos: Array<UtxoInterface>, amount: number): {
    unspents: {
        txid: string;
        vout: number;
        value: number;
        asset: string;
    }[];
    change: number;
};
export declare function isValidAmount(amount: number): boolean;
