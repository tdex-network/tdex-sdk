import { Psbt, Transaction } from 'liquidjs-lib';
/**
 * Generates a random id of a fixed length.
 * @param length size of the string id.
 */
export declare function makeid(length: number): string;
export declare function decodePsbt(psetBase64: string): {
    psbt: Psbt;
    transaction: Transaction;
};
export declare function getClearTextTorProxyUrl(torProxyEndpoint: string, url: URL): string;
