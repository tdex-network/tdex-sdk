import JSBI from 'jsbi';
import { confidential, Psbt, Transaction, TxOutput } from 'liquidjs-lib';
import { UnblindOutputResult } from 'liquidjs-lib/types/confidential';

const HUNDRED = JSBI.BigInt(100);
const TENTHOUSAND = JSBI.multiply(HUNDRED, HUNDRED);

export function toAssetHash(x: Buffer): string {
  const withoutFirstByte = x.slice(1);
  return (withoutFirstByte.reverse() as Buffer).toString('hex');
}

export function fromAssetHash(x: string): Buffer {
  return Buffer.concat([
    Buffer.from('01', 'hex'), //prefix for unconfidential asset
    Buffer.from(x, 'hex').reverse(),
  ]);
}

export function toNumber(x: Buffer): number {
  return confidential.confidentialValueToSatoshi(x);
}

function minusFee(amount: JSBI, fee: JSBI): Array<JSBI> {
  const calculatedFee = JSBI.multiply(JSBI.divide(amount, TENTHOUSAND), fee);
  return [JSBI.subtract(amount, calculatedFee), calculatedFee];
}

function plusFee(amount: JSBI, fee: JSBI): Array<JSBI> {
  const calculatedFee = JSBI.multiply(JSBI.divide(amount, TENTHOUSAND), fee);
  return [JSBI.add(amount, calculatedFee), calculatedFee];
}

export function calculateExpectedAmount(
  proposeBalance: number,
  receiveBalance: number,
  proposedAmount: number,
  feeWithDecimals: number
): number {
  const PBALANCE = JSBI.BigInt(proposeBalance);
  const RBALANCE = JSBI.BigInt(receiveBalance);
  const PAMOUNT = JSBI.BigInt(proposedAmount);
  const FEE = JSBI.BigInt(feeWithDecimals * 100);

  const invariant = JSBI.multiply(PBALANCE, RBALANCE);
  const newProposeBalance = JSBI.add(PBALANCE, PAMOUNT);
  const newReceiveBalance = JSBI.divide(invariant, newProposeBalance);
  const expectedAmount = JSBI.subtract(RBALANCE, newReceiveBalance);
  const [expectedAmountMinusFee] = minusFee(expectedAmount, FEE);
  return JSBI.toNumber(expectedAmountMinusFee);
}

export function calculateProposeAmount(
  proposeBalance: number,
  receiveBalance: number,
  expectedAmount: number,
  feeWithDecimals: number
): number {
  const PBALANCE = JSBI.BigInt(proposeBalance);
  const RBALANCE = JSBI.BigInt(receiveBalance);
  const RAMOUNT = JSBI.BigInt(expectedAmount);
  const FEE = JSBI.BigInt(feeWithDecimals * 100);

  const invariant = JSBI.multiply(PBALANCE, RBALANCE);
  const newReceiveBalance = JSBI.subtract(RBALANCE, RAMOUNT);
  const newProposeBalance = JSBI.divide(invariant, newReceiveBalance);
  const proposeAmount = JSBI.subtract(newProposeBalance, PBALANCE);
  const [proposeAmountPlusFee] = plusFee(proposeAmount, FEE);
  return JSBI.toNumber(proposeAmountPlusFee);
}

/**
 * Generates a random id of a fixed length.
 * @param length size of the string id.
 */
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

export function isValidAmount(amount: number): boolean {
  if (amount <= 0 || !Number.isSafeInteger(amount)) return false;
  return true;
}

/**
 * The unblind output function's result interface.
 */
export interface UnblindResult {
  asset: Buffer;
  // in satoshis
  value: number;
}

/**
 * Unblind an output using confidential.unblindOutput function from liquidjs-lib.
 * @param output the output to unblind.
 * @param blindKey the private blinding key.
 */
export function unblindOutput(
  output: TxOutput,
  blindKey: Buffer
): UnblindResult {
  const result: UnblindResult = { asset: Buffer.alloc(0), value: 0 };

  if (!output.rangeProof) {
    throw new Error('The output does not contain rangeProof.');
  }

  const unblindedResult: UnblindOutputResult = confidential.unblindOutput(
    output.nonce,
    blindKey,
    output.rangeProof,
    output.value,
    output.asset,
    output.script
  );

  result.asset = Buffer.concat([
    // add the prefix a the beginning (confidential.unblindOutput remove it)
    Buffer.alloc(1, 10),
    unblindedResult.asset,
  ]);
  result.value = parseInt(unblindedResult.value, 10);
  return result;
}

const emptyNonce: Buffer = Buffer.from('0x00', 'hex');

function bufferNotEmptyOrNull(buffer?: Buffer): boolean {
  return buffer != null && buffer.length > 0;
}

/**
 * Checks if a given output is a confidential one.
 * @param output the ouput to check.
 */
export function isConfidentialOutput(output: TxOutput): boolean {
  return (
    bufferNotEmptyOrNull(output.rangeProof) &&
    bufferNotEmptyOrNull(output.surjectionProof) &&
    output.nonce !== emptyNonce
  );
}

export class BufferMap<T> {
  private map: Map<string, T>;

  constructor() {
    this.map = new Map<string, T>();
  }

  private bufferToStringPrimitive(buffer: Buffer): string {
    return buffer.toString('hex').valueOf();
  }

  get(key: Buffer): T | undefined {
    return this.map.get(this.bufferToStringPrimitive(key));
  }

  set(key: Buffer, value: T): this {
    this.map.set(this.bufferToStringPrimitive(key), value);
    return this;
  }

  values(): Array<T> {
    return Array.from(this.map.values());
  }
}
