/// <reference types="node" />
import { UtxoInterface, networks, IdentityInterface, CoinSelector } from 'ldk';
import { Psbt } from 'liquidjs-lib';
interface SwapTransactionInterface {
    network: networks.Network;
    pset: Psbt;
    inputBlindingKeys: Record<string, Buffer>;
    outputBlindingKeys: Record<string, Buffer>;
}
export declare class SwapTransaction implements SwapTransactionInterface {
    network: networks.Network;
    pset: Psbt;
    inputBlindingKeys: Record<string, Buffer>;
    outputBlindingKeys: Record<string, Buffer>;
    private identity;
    constructor(identity: IdentityInterface);
    create(unspents: Array<UtxoInterface>, amountToBeSent: number, amountToReceive: number, assetToBeSent: string, assetToReceive: string, addressForSwapOutput: string, addressForChangeOutput: string, coinSelector?: CoinSelector): void;
}
export {};
