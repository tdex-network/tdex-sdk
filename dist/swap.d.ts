import Core from './core';
export declare class Swap extends Core {
    static parse: typeof parse;
    request({ assetToBeSent, amountToBeSent, assetToReceive, amountToReceive, psbtBase64, }: {
        assetToBeSent: string;
        amountToBeSent: number;
        assetToReceive: string;
        amountToReceive: number;
        psbtBase64: string;
    }): Uint8Array;
    accept({ message, psbtBase64, }: {
        message: Uint8Array;
        psbtBase64: string;
    }): Uint8Array;
    complete({ message, psbtBase64, }: {
        message: Uint8Array;
        psbtBase64: string;
    }): Uint8Array;
}
declare function parse({ message, type, }: {
    message: Uint8Array;
    type: string;
}): string;
export {};
