import {
  UtxoInterface,
  networks,
  address,
  RecipientInterface,
  IdentityInterface,
  CoinSelector,
} from 'ldk';
import { confidential, Psbt } from 'liquidjs-lib';

// SwapTransactionInterface defines the minimum needed for implementation to hold data to construct a valid swap transaction.
interface SwapTransactionInterface {
  network: networks.Network;
  pset: Psbt;
  inputBlindingKeys: Record<string, Buffer>;
  outputBlindingKeys: Record<string, Buffer>;
}

// SwapTransaction holds a pset and expose a create method to select coins and build a transaction for a SwapRequest message
export class SwapTransaction implements SwapTransactionInterface {
  network: networks.Network;
  pset: Psbt;
  inputBlindingKeys: Record<string, Buffer> = {};
  outputBlindingKeys: Record<string, Buffer> = {};

  private identity: IdentityInterface;

  constructor(identity: IdentityInterface) {
    this.identity = identity;
    this.network = identity.network;
    this.pset = new Psbt({ network: this.network });
  }

  create(
    unspents: Array<UtxoInterface>,
    amountToBeSent: number,
    amountToReceive: number,
    assetToBeSent: string,
    assetToReceive: string,
    addressForSwapOutput: string,
    addressForChangeOutput: string,
    coinSelector: CoinSelector
  ) {
    const { selectedUtxos, changeOutputs } = coinSelector(
      unspents,
      [
        {
          value: amountToBeSent,
          asset: assetToBeSent,
          address: '',
        },
      ],
      (_: string) => addressForChangeOutput
    );

    selectedUtxos.forEach((i: UtxoInterface) => {
      this.pset.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //We put here the blinded prevout
        witnessUtxo: i.prevout,
      });

      if (!i.prevout) {
        throw new Error(
          'create tx: missing prevout member for input ' + i.txid + ':' + i.vout
        );
      }

      // we update the inputBlindingKeys map after we add an input to the transaction
      const scriptHex = i.prevout.script.toString('hex');
      this.inputBlindingKeys[scriptHex] = Buffer.from(
        this.identity.getBlindingPrivateKey(scriptHex),
        'hex'
      );
    });

    const receivingScript = address
      .toOutputScript(addressForSwapOutput, this.network)
      .toString('hex');

    // The receiving output
    this.pset.addOutput({
      script: receivingScript,
      value: confidential.satoshiToConfidentialValue(amountToReceive),
      asset: assetToReceive,
      nonce: Buffer.from('00', 'hex'),
    });

    // we update the outputBlindingKeys map after we add the receiving output to the transaction
    this.outputBlindingKeys[receivingScript] = Buffer.from(
      this.identity.getBlindingPrivateKey(receivingScript),
      'hex'
    );

    if (changeOutputs.length > 0) {
      changeOutputs.forEach((changeOutput: RecipientInterface) => {
        const changeScript = address
          .toOutputScript(changeOutput.address, this.network)
          .toString('hex');

        // Change
        this.pset.addOutput({
          script: changeScript,
          value: confidential.satoshiToConfidentialValue(changeOutput.value),
          asset: changeOutput.asset,
          nonce: Buffer.from('00', 'hex'),
        });

        // we update the outputBlindingKeys map after we add the change output to the transaction
        this.outputBlindingKeys[changeScript] = Buffer.from(
          this.identity.getBlindingPrivateKey(changeScript),
          'hex'
        );
      });
    }
  }
}
