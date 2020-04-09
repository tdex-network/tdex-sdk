# tdex-sdk
 🛠 SDK for building applications on top of TDEX

## ⬇️ Install

* Install with **yarn**
```sh
$ yarn add tdex-sdk
```
* Install with **npm**
```sh
$ npm install --save tdex-sdk
```


## 📄 Usage

**Quickstart**

```js
import { Swap } from 'tdex-sdk';

const swap = new Swap({ chain: "regtest" });

const LBTC = '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225';
const USDT = 'c5870288a7c9eb5db398a5b5e7221feb9753134439e8ed9f569b0eea5a423330';

// Alice starts a swap proposal 
//
// You need to create and provide an unsigned transaction that has 
// enough inputs to cover amountToBeSent and the desired output
const swapRequestMessage = swap.request({
  assetToBeSent: USDT,
  amountToBeSent: 300,
  assetToReceive: LBTC,
  amountToReceive: 0.05,
  psbtBase64: "..."
})

//Bob parses the request and inspect the terms
const json = Swap.parse({
  message: swapRequestMessage,
  type: 'SwapRequest'
});

// Bob provides the transaction with his signed inputs and outputs
const swapAcceptMessage = swap.accept({
  message: swapRequestMessage,
  psbtBase64: "..."
});


//Alice can parse again the message and inspect the terms (optional)
const json = Swap.parse({
  message: swapAcceptMessage,
  type: 'SwapAccept'
});

// Alice adds his signed inputs to the transaction
const swapCompleteMessage = swap.complete({
  message: swapAcceptMessage,
  psbtBase64: "..."
});

// Alice can sends the completed swap to Bob 
// Now Bob finalize the transaction and broadcast it 

```


## 🛣 Roadmap

* [ ] Swap protocol
* [ ] Trade protocol
* [ ] Wallet support
* [ ] Browser support


## 🖥 Local Development

Below is a list of commands you will probably find useful.

### `yarn start`

Runs the project in development/watch mode. Your project will be rebuilt upon changes. Error messages are pretty printed and formatted for compatibility VS Code's Problems tab. Your library will be rebuilt if you make edits.

### `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).


### `yarn test`

Runs the test watcher (Jest) in an interactive mode.
By default, runs tests related to files changed since the last commit.

 
