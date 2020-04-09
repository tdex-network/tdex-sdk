import { confidential, Psbt, Transaction } from 'liquidjs-lib';

export function toAssetHash(x: Buffer): string {
  const withoutFirstByte = x.slice(1);
  return withoutFirstByte.reverse().toString('hex');
}

export function toNumber(x: Buffer): number {
  return confidential.confidentialValueToSatoshi(x);
}

export function toSatoshi(x: number): number {
  return Math.floor(x * Math.pow(10, 8));
}

export function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function decodePsbt(
  psbtBase64: string
): { psbt: Psbt; transaction: Transaction } {
  let psbt: Psbt;
  try {
    psbt = Psbt.fromBase64(psbtBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }

  const bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  const transaction = Transaction.fromBuffer(bufferTx);
  return {
    psbt,
    transaction,
  };
}
