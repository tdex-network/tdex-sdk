const axios = require('axios');
// Nigiri Chopstick Liquid base URI
const APIURL = process.env.EXPLORER || `http://localhost:3001`;

export function sleep(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchUtxos(address: string): Promise<any> {
  let utxos: any = [];
  try {
    await sleep(3000);
    utxos = (await axios.get(`${APIURL}/address/${address}/utxo`)).data;
  } catch (e) {
    console.error(e);
    throw e;
  }
  return utxos;
}

export async function faucet(address: string): Promise<void> {
  try {
    await axios.post(`${APIURL}/faucet`, { address });
    await sleep(3000);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function fetchTxHex(txId: string): Promise<string> {
  let hex: string;
  try {
    await sleep(3000);
    hex = (await axios.get(`${APIURL}/tx/${txId}/hex`)).data;
  } catch (e) {
    console.error(e);
    throw e;
  }
  return hex;
}
