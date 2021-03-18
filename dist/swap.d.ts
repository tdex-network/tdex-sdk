/// <reference types="node" />
import Core from './core';
import * as jspb from 'google-protobuf';
declare type BlindKeysMap = Record<string, Buffer>;
interface requestOpts {
    assetToBeSent: string;
    amountToBeSent: number;
    assetToReceive: string;
    amountToReceive: number;
    psetBase64: string;
    inputBlindingKeys?: BlindKeysMap;
    outputBlindingKeys?: BlindKeysMap;
}
interface acceptOpts {
    message: Uint8Array;
    psetBase64: string;
    inputBlindingKeys?: BlindKeysMap;
    outputBlindingKeys?: BlindKeysMap;
}
/**
 * The Swap class implements the Swap TDEX protocol i.e swap.request, swap.accept and swap.complete.
 * @see https://github.com/TDex-network/tdex-specs/blob/master/03-swap-protocol.md
 */
export declare class Swap extends Core {
    static parse: typeof parse;
    /**
     * Create and serialize a SwapRequest Message.
     * @param args the args of swap.request see requestOpts.
     */
    request({ amountToBeSent, assetToBeSent, amountToReceive, assetToReceive, psetBase64, inputBlindingKeys, outputBlindingKeys, }: requestOpts): Promise<Uint8Array>;
    /**
     * Create and serialize an accept message.
     * @param args the Swap.accept args, see AcceptOpts.
     */
    accept({ message, psetBase64, inputBlindingKeys, outputBlindingKeys, }: acceptOpts): Promise<Uint8Array>;
    /**
     * create and serialize a SwapComplete message.
     * @param args contains the SwapAccept message + the base64 encoded transaction.
     */
    complete({ message, psetBase64, }: {
        message: Uint8Array;
        psetBase64: string;
    }): Uint8Array;
}
declare function parse({ message, type, }: {
    message: Uint8Array;
    type: string;
}): string;
/**
 * Convert jspb's Map type to BlindKeysMap.
 * @param jspbMap the map to convert.
 */
export declare function blindKeysMap(jspbMap: jspb.Map<string, string | Uint8Array>): BlindKeysMap | undefined;
export {};
