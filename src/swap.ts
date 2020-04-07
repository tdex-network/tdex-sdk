import Core from './core';
import * as proto from '../proto/swap_pb';

export class Swap extends Core {
  request({
    assetToBeSent,
    amountToBeSent,
    assetToReceive,
    amountToReceive,
    psbtBase64,
  }: {
    assetToBeSent: string;
    amountToBeSent: number;
    assetToReceive: string;
    amountToReceive: number;
    psbtBase64?: string;
  }): Uint8Array {
    // Check amounts
    amountToBeSent = toSatoshi(amountToBeSent);
    amountToReceive = toSatoshi(amountToReceive);

    const msg = new proto.SwapRequest();
    msg.setId(makeid(8));
    msg.setAmountP(amountToBeSent);
    msg.setAssetP(assetToBeSent);
    msg.setAmountR(amountToReceive);
    msg.setAssetR(assetToReceive);

    if (psbtBase64) {
      // TODO Validate the psbt and check if given
      // amountR & assetR are present in tx outputs
      msg.setTransaction(psbtBase64);
    } else {
      let psbt = makeid(30);
      //TODO check if wallet is set up
      //TODO Fetch utxos and coin selection
      //TODO updateTx with proper inputs and outputs
      msg.setTransaction(psbt);
    }

    if (this.verbose) console.log(msg.toObject());

    return msg.serializeBinary();
  }
}

function toSatoshi(x: number) {
  return Math.floor(x * Math.pow(10, 8));
}

function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
