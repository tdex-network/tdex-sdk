import { Pset, Transaction } from 'liquidjs-lib';
import { Psbt } from 'liquidjs-lib/src/psbt';

export function decodePsbt(
  psetBase64: string
): { psbt: Psbt; transaction: Transaction } {
  let psbt: Psbt;
  try {
    psbt = Psbt.fromBase64(psetBase64);
  } catch (ignore) {
    console.log(ignore);
    throw new Error('Invalid psbt');
  }

  const bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  const transaction = Transaction.fromBuffer(bufferTx);
  return {
    psbt,
    transaction,
  };
}

export function isRawTransaction(tx: string): boolean {
  try {
    Transaction.fromHex(tx);
    return true;
  } catch (ignore) {
    return false;
  }
}

export function isPsetV0(tx: string): boolean {
  try {
    Psbt.fromBase64(tx);
    return true;
  } catch (ignore) {
    return false;
  }
}

const emptyNonce: Buffer = Buffer.from('0x00', 'hex');

function bufferNotEmptyOrNull(buffer?: Buffer): boolean {
  return buffer != null && buffer.length > 0;
}

// Checks if a given output is a confidential one.
export function isConfidentialOutput({
  rangeProof,
  surjectionProof,
  nonce,
}: any): boolean {
  return (
    bufferNotEmptyOrNull(rangeProof) &&
    bufferNotEmptyOrNull(surjectionProof) &&
    nonce !== emptyNonce
  );
}

export function isValidAmount(amount: number): boolean {
  return !(amount <= 0 || !Number.isSafeInteger(amount));
}

export function psetToUnsignedHex(psetBase64: string): string {
  let pset: Psbt;
  try {
    pset = Psbt.fromBase64(psetBase64);
  } catch (ignore) {
    throw new Error('Invalid pset');
  }
  return pset.data.globalMap.unsignedTx.toBuffer().toString('hex');
}

export function decodePset(psetBase64: string): Pset {
  let pset: Pset;
  try {
    pset = Pset.fromBase64(psetBase64);
  } catch (ignore) {
    throw new Error('Invalid pset');
  }
  return pset;
}
