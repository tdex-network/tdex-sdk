import { confidential, Psbt, Transaction, ECPair, payments, networks } from 'liquidjs-lib';
export { networks } from 'liquidjs-lib';
import * as proto from 'tdex-protobuf/js/swap_pb';
import { SwapRequest, SwapAccept, SwapComplete } from 'tdex-protobuf/js/swap_pb';
import JSBI from 'jsbi';
import axios from 'axios';
import { credentials } from '@grpc/grpc-js';
import { TradeClient } from 'tdex-protobuf/js/trade_grpc_pb';
import { Market, TradeProposeRequest, TradeCompleteRequest, MarketsRequest, BalancesRequest } from 'tdex-protobuf/js/trade_pb';

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var Core = function Core(data) {
  this.verbose = false;
  this.chain = 'regtest';
  Object.assign(this, data);
};

var HUNDRED = /*#__PURE__*/JSBI.BigInt(100);
var TENTHOUSAND = /*#__PURE__*/JSBI.multiply(HUNDRED, HUNDRED);
function toAssetHash(x) {
  var withoutFirstByte = x.slice(1);
  return withoutFirstByte.reverse().toString('hex');
}
function toNumber(x) {
  return confidential.confidentialValueToSatoshi(x);
}

function minusFee(amount, fee) {
  var calculatedFee = JSBI.multiply(JSBI.divide(amount, TENTHOUSAND), fee);
  return [JSBI.subtract(amount, calculatedFee), calculatedFee];
}

function plusFee(amount, fee) {
  var calculatedFee = JSBI.multiply(JSBI.divide(amount, TENTHOUSAND), fee);
  return [JSBI.add(amount, calculatedFee), calculatedFee];
}

function calculateExpectedAmount(proposeBalance, receiveBalance, proposedAmount, feeWithDecimals) {
  var PBALANCE = JSBI.BigInt(proposeBalance);
  var RBALANCE = JSBI.BigInt(receiveBalance);
  var PAMOUNT = JSBI.BigInt(proposedAmount);
  var FEE = JSBI.BigInt(feeWithDecimals * 100);
  var invariant = JSBI.multiply(PBALANCE, RBALANCE);
  var newProposeBalance = JSBI.add(PBALANCE, PAMOUNT);
  var newReceiveBalance = JSBI.divide(invariant, newProposeBalance);
  var expectedAmount = JSBI.subtract(RBALANCE, newReceiveBalance);

  var _minusFee = minusFee(expectedAmount, FEE),
      expectedAmountMinusFee = _minusFee[0];

  return JSBI.toNumber(expectedAmountMinusFee);
}
function calculateProposeAmount(proposeBalance, receiveBalance, expectedAmount, feeWithDecimals) {
  var PBALANCE = JSBI.BigInt(proposeBalance);
  var RBALANCE = JSBI.BigInt(receiveBalance);
  var RAMOUNT = JSBI.BigInt(expectedAmount);
  var FEE = JSBI.BigInt(feeWithDecimals * 100);
  var invariant = JSBI.multiply(PBALANCE, RBALANCE);
  var newReceiveBalance = JSBI.subtract(RBALANCE, RAMOUNT);
  var newProposeBalance = JSBI.divide(invariant, newReceiveBalance);
  var proposeAmount = JSBI.subtract(newProposeBalance, PBALANCE);

  var _plusFee = plusFee(proposeAmount, FEE),
      proposeAmountPlusFee = _plusFee[0];

  return JSBI.toNumber(proposeAmountPlusFee);
}
function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
function decodePsbt(psbtBase64) {
  var psbt;

  try {
    psbt = Psbt.fromBase64(psbtBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }

  var bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  var transaction = Transaction.fromBuffer(bufferTx);
  return {
    psbt: psbt,
    transaction: transaction
  };
}
function coinselect(utxos, amount) {
  var unspents = [];
  var availableSat = 0;
  var change = 0;

  for (var i = 0; i < utxos.length; i++) {
    var utxo = utxos[i];
    unspents.push({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.value,
      asset: utxo.asset
    });
    availableSat += utxo.value;
    if (availableSat >= amount) break;
  }

  if (availableSat < amount) throw new Error('You do not have enough in your wallet');
  change = availableSat - amount;
  return {
    unspents: unspents,
    change: change
  };
}
function isValidAmount(amount) {
  if (amount <= 0 || !Number.isSafeInteger(amount)) return false;
  return true;
}

var Swap = /*#__PURE__*/function (_Core) {
  _inheritsLoose(Swap, _Core);

  function Swap() {
    return _Core.apply(this, arguments) || this;
  }

  var _proto = Swap.prototype;

  _proto.request = function request(_ref) {
    var assetToBeSent = _ref.assetToBeSent,
        amountToBeSent = _ref.amountToBeSent,
        assetToReceive = _ref.assetToReceive,
        amountToReceive = _ref.amountToReceive,
        psbtBase64 = _ref.psbtBase64;
    // Check amounts
    var msg = new SwapRequest();
    msg.setId(makeid(8));
    msg.setAmountP(amountToBeSent);
    msg.setAssetP(assetToBeSent);
    msg.setAmountR(amountToReceive);
    msg.setAssetR(assetToReceive);
    msg.setTransaction(psbtBase64);
    compareMessagesAndTransaction(msg);
    if (this.verbose) console.log(msg.toObject());
    return msg.serializeBinary();
  };

  _proto.accept = function accept(_ref2) {
    var message = _ref2.message,
        psbtBase64 = _ref2.psbtBase64;
    var msgRequest = SwapRequest.deserializeBinary(message); // Build Swap Accepr message

    var msgAccept = new SwapAccept();
    msgAccept.setId(makeid(8));
    msgAccept.setRequestId(msgRequest.getId());
    msgAccept.setTransaction(psbtBase64);
    compareMessagesAndTransaction(msgRequest, msgAccept);
    if (this.verbose) console.log(msgAccept.toObject());
    return msgAccept.serializeBinary();
  };

  _proto.complete = function complete(_ref3) {
    var message = _ref3.message,
        psbtBase64 = _ref3.psbtBase64;

    //First validate signatures
    var _decodePsbt = decodePsbt(psbtBase64),
        psbt = _decodePsbt.psbt;

    if (!psbt.validateSignaturesOfAllInputs()) throw new Error('Signatures not valid');
    var msgAccept = SwapAccept.deserializeBinary(message); //Build SwapComplete

    var msgComplete = new SwapComplete();
    msgComplete.setId(makeid(8));
    msgComplete.setAcceptId(msgAccept.getId());
    msgComplete.setTransaction(psbtBase64);
    if (this.verbose) console.log(msgAccept.toObject());
    return msgComplete.serializeBinary();
  };

  return Swap;
}(Core);
Swap.parse = parse;

function compareMessagesAndTransaction(msgRequest, msgAccept) {
  var decodedFromRequest = decodePsbt(msgRequest.getTransaction());
  var totalP = countUtxos(decodedFromRequest.psbt.data.inputs, msgRequest.getAssetP());
  if (totalP < msgRequest.getAmountP()) throw new Error('Cumulative utxos count is not enough to cover SwapRequest.amount_p');
  var outputRFound = outputFoundInTransaction(decodedFromRequest.transaction.outs, msgRequest.getAmountR(), msgRequest.getAssetR());
  if (!outputRFound) throw new Error('Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt');

  if (msgAccept) {
    var decodedFromAccept = decodePsbt(msgAccept.getTransaction());
    if (msgRequest.getId() !== msgAccept.getRequestId()) throw new Error('SwapRequest.id and SwapAccept.request_id are not the same');
    var totalR = countUtxos(decodedFromAccept.psbt.data.inputs, msgRequest.getAssetR());
    if (totalR < msgRequest.getAmountR()) throw new Error('Cumulative utxos count is not enough to cover SwapRequest.amount_r');
    var outputPFound = outputFoundInTransaction(decodedFromAccept.transaction.outs, msgRequest.getAmountP(), msgRequest.getAssetP());
    if (!outputPFound) throw new Error('Either SwapRequest.amount_p or SwapRequest.asset_p do not match the provided psbt');
  }
}

function outputFoundInTransaction(outputs, value, asset) {
  var found = outputs.find(function (o) {
    return toNumber(o.value) === value && toAssetHash(o.asset) === asset;
  });
  return found !== undefined;
}

function countUtxos(utxos, asset) {
  return utxos.filter(function (i) {
    return toAssetHash(i.witnessUtxo.asset) === asset;
  }).map(function (i) {
    return toNumber(i.witnessUtxo.value);
  }).reduce(function (a, b) {
    return a + b;
  }, 0);
}

function parse(_ref4) {
  var message = _ref4.message,
      type = _ref4.type;
  var msg;

  try {
    msg = proto[type].deserializeBinary(message);
  } catch (e) {
    throw new Error("Not valid message of expected type " + type);
  }

  return JSON.stringify(msg.toObject(), undefined, 2);
}

var fetchBalances = function fetchBalances(address, url) {
  try {
    return Promise.resolve(fetchUtxos(address, url)).then(function (utxos) {
      return utxos.reduce(function (storage, item) {
        // get the first instance of the key by which we're grouping
        var group = item['asset']; // set `storage` for this instance of group to the outer scope (if not empty) or initialize it

        storage[group] = storage[group] || 0; // add this item to its group within `storage`

        storage[group] += item.value; // return the updated storage to the reduce function, which will then loop through the next

        return storage;
      }, {}); // {} is the initial value of the storage
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var fetchUtxos = function fetchUtxos(address, url) {
  try {
    return Promise.resolve(axios.get(url + "/address/" + address + "/utxo")).then(function (_axios$get) {
      return _axios$get.data;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var WatchOnlyWallet = /*#__PURE__*/function () {
  function WatchOnlyWallet(_ref) {
    var address = _ref.address,
        network = _ref.network;
    var payment = payments.p2wpkh({
      address: address,
      network: network
    });
    this.network = network;
    this.address = payment.address;
    this.script = payment.output.toString('hex');
  }

  var _proto = WatchOnlyWallet.prototype;

  _proto.updateTx = function updateTx(psbtBase64, inputs, inputAmount, outputAmount, inputAsset, outputAsset) {
    var _this = this;

    var psbt;

    try {
      psbt = Psbt.fromBase64(psbtBase64);
    } catch (ignore) {
      throw new Error('Invalid psbt');
    }

    inputs = inputs.filter(function (utxo) {
      return utxo.asset === inputAsset;
    });

    var _coinselect = coinselect(inputs, inputAmount),
        unspents = _coinselect.unspents,
        change = _coinselect.change;

    unspents.forEach(function (i) {
      return psbt.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //The scriptPubkey and the value only are needed.
        witnessUtxo: {
          script: Buffer.from(_this.script, 'hex'),
          asset: Buffer.concat([Buffer.from('01', 'hex'), Buffer.from(inputAsset, 'hex').reverse()]),
          value: confidential.satoshiToConfidentialValue(i.value),
          nonce: Buffer.from('00', 'hex')
        }
      });
    });
    psbt.addOutput({
      script: Buffer.from(this.script, 'hex'),
      value: confidential.satoshiToConfidentialValue(outputAmount),
      asset: Buffer.concat([Buffer.from('01', 'hex'), Buffer.from(outputAsset, 'hex').reverse()]),
      nonce: Buffer.from('00', 'hex')
    });

    if (change > 0) {
      psbt.addOutput({
        script: Buffer.from(this.script, 'hex'),
        value: confidential.satoshiToConfidentialValue(change),
        asset: Buffer.concat([Buffer.from('01', 'hex'), Buffer.from(inputAsset, 'hex').reverse()]),
        nonce: Buffer.from('00', 'hex')
      });
    }

    var base64 = psbt.toBase64();
    return base64;
  };

  return WatchOnlyWallet;
}();
WatchOnlyWallet.fromAddress = fromAddress;
WatchOnlyWallet.createTx = createTx;
WatchOnlyWallet.toHex = toHex;
var Wallet = /*#__PURE__*/function (_WatchOnlyWallet) {
  _inheritsLoose(Wallet, _WatchOnlyWallet);

  function Wallet(_ref2) {
    var _this2;

    var network = _ref2.network,
        address = _ref2.address,
        keyPair = _ref2.keyPair;
    _this2 = _WatchOnlyWallet.call(this, {
      network: network,
      address: address
    }) || this;
    _this2.updateTx = _WatchOnlyWallet.prototype.updateTx;
    if (!keyPair) _this2.keyPair = ECPair.makeRandom({
      network: _this2.network
    });else _this2.keyPair = keyPair;
    _this2.privateKey = _this2.keyPair.privateKey.toString('hex');
    _this2.publicKey = _this2.keyPair.publicKey.toString('hex');
    return _this2;
  }

  var _proto2 = Wallet.prototype;

  _proto2.sign = function sign(psbtBase64) {
    var _this3 = this;

    var psbt;

    try {
      psbt = Psbt.fromBase64(psbtBase64);
    } catch (ignore) {
      throw new Error('Invalid psbt');
    }

    psbt.data.inputs.forEach(function (p, i) {
      if (p.witnessUtxo.script.toString('hex') === _this3.script) {
        psbt.signInput(i, _this3.keyPair);
        if (!psbt.validateSignaturesOfInput(i)) throw new Error('Invalid signature');
      }
    });
    return psbt.toBase64();
  };

  return Wallet;
}(WatchOnlyWallet);
Wallet.fromWIF = fromWIF;
Wallet.fromRandom = fromRandom;

function fromAddress(address, network) {
  var _network = network ? networks[network] : networks.liquid;

  try {
    return new WatchOnlyWallet({
      address: address,
      network: _network
    });
  } catch (ignore) {
    throw new Error('fromAddress: Invalid address or network');
  }
}

function fromRandom(network) {
  var _network = network ? networks[network] : networks.liquid;

  try {
    var keyPair = ECPair.makeRandom({
      network: _network
    });

    var _payments$p2wpkh = payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: _network
    }),
        address = _payments$p2wpkh.address;

    return new Wallet({
      keyPair: keyPair,
      network: _network,
      address: address
    });
  } catch (ignore) {
    throw new Error('fromRandom: Failed to create wallet');
  }
}

function fromWIF(wif, network) {
  var _network = network ? networks[network] : networks.liquid;

  try {
    var keyPair = ECPair.fromWIF(wif, _network);

    var _payments$p2wpkh2 = payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: _network
    }),
        address = _payments$p2wpkh2.address;

    return new Wallet({
      keyPair: keyPair,
      network: _network,
      address: address
    });
  } catch (ignore) {
    throw new Error('fromWIF: Invalid keypair');
  }
}

function createTx(network) {
  var _network = network ? networks[network] : networks.liquid;

  var psbt = new Psbt({
    network: _network
  });
  return psbt.toBase64();
}

function toHex(psbtBase64) {
  var psbt;

  try {
    psbt = Psbt.fromBase64(psbtBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }

  psbt.validateSignaturesOfAllInputs();
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().toHex();
}

var TraderClient = /*#__PURE__*/function () {
  function TraderClient(providerUrl) {
    this.providerUrl = providerUrl;
    this.client = new TradeClient(providerUrl, credentials.createInsecure());
  }
  /**
   * tradePropose
   * @param market
   * @param tradeType
   * @param swapRequestSerialized
   */


  var _proto = TraderClient.prototype;

  _proto.tradePropose = function tradePropose(_ref, tradeType, swapRequestSerialized) {
    var _this = this;

    var baseAsset = _ref.baseAsset,
        quoteAsset = _ref.quoteAsset;
    return new Promise(function (resolve, reject) {
      var market = new Market();
      market.setBaseAsset(baseAsset);
      market.setQuoteAsset(quoteAsset);
      var request = new TradeProposeRequest();
      request.setMarket(market);
      request.setType(tradeType);
      request.setSwapRequest(SwapRequest.deserializeBinary(swapRequestSerialized));

      var call = _this.client.tradePropose(request);

      var data;
      call.on('data', function (reply) {
        var swapAcceptMsg = reply.getSwapAccept();
        data = swapAcceptMsg.serializeBinary();
      });
      call.on('end', function () {
        return resolve(data);
      });
      call.on('error', function (e) {
        return reject(e);
      });
    });
  }
  /**
   * tradeComplete
   * @param swapCompleteSerialized
   */
  ;

  _proto.tradeComplete = function tradeComplete(swapCompleteSerialized) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      var request = new TradeCompleteRequest();
      request.setSwapComplete(SwapComplete.deserializeBinary(swapCompleteSerialized));

      var call = _this2.client.tradeComplete(request);

      var data;
      call.on('data', function (reply) {
        data = reply.getTxid();
      });
      call.on('end', function () {
        return resolve(data);
      });
      call.on('error', function (e) {
        return reject(e);
      });
    });
  };

  _proto.markets = function markets() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.client.markets(new MarketsRequest(), function (err, response) {
        if (err) return reject(err);
        var list = response.getMarketsList().map(function (item) {
          return item.getMarket();
        }).map(function (market) {
          return {
            baseAsset: market.getBaseAsset(),
            quoteAsset: market.getQuoteAsset()
          };
        });
        resolve(list);
      });
    });
  };

  _proto.balances = function balances(_ref2) {
    var _this4 = this;

    var baseAsset = _ref2.baseAsset,
        quoteAsset = _ref2.quoteAsset;
    var market = new Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    var request = new BalancesRequest();
    request.setMarket(market);
    return new Promise(function (resolve, reject) {
      _this4.client.balances(request, function (err, response) {
        var _balances;

        if (err) return reject(err);
        var baseAmount = response.getBalancesList().find(function (b) {
          return b.getAsset() === baseAsset;
        }).getAmount();
        var quoteAmount = response.getBalancesList().find(function (b) {
          return b.getAsset() === quoteAsset;
        }).getAmount();
        var reply = {
          fee: response.getFee(),
          balances: (_balances = {}, _balances[baseAsset] = baseAmount, _balances[quoteAsset] = quoteAmount, _balances)
        };
        resolve(reply);
      });
    });
  };

  return TraderClient;
}();

var TradeType;

(function (TradeType) {
  TradeType[TradeType["BUY"] = 0] = "BUY";
  TradeType[TradeType["SELL"] = 1] = "SELL";
})(TradeType || (TradeType = {}));

var Trade = /*#__PURE__*/function (_Core) {
  _inheritsLoose(Trade, _Core);

  function Trade(args) {
    var _this;

    _this = _Core.call(this, args) || this;
    if (!_this.chain) throw new Error('To be able to trade you need to select the network via { chain }');
    if (!_this.providerUrl) throw new Error('To be able to trade you need to select a liquidity provider via { providerUrl }');
    if (!_this.explorerUrl) throw new Error('To be able to trade you need to select an explorer via { explorerUrl }');
    _this.grpcClient = new TraderClient(_this.providerUrl);
    return _this;
  }
  /**
   * Trade.buy let the trder buy the baseAsset,
   * sending his own quoteAsset using the current market price
   */


  var _proto = Trade.prototype;

  _proto.buy = function buy(_ref) {
    var market = _ref.market,
        amount = _ref.amount,
        address = _ref.address,
        privateKey = _ref.privateKey;

    try {
      var _this3 = this;

      if (!privateKey && !address) throw new Error('Either private key or native segwit address is required');

      if (!privateKey) {
        var watchOnlyWallet = WatchOnlyWallet.fromAddress(address, _this3.chain);
        return Promise.resolve(_this3.marketOrderRequest(market, TradeType.BUY, amount, watchOnlyWallet));
      } else {
        var wallet = Wallet.fromWIF(privateKey, _this3.chain);
        return Promise.resolve(_this3.marketOrderRequest(market, TradeType.BUY, amount, wallet)).then(function (swapAccept) {
          return Promise.resolve(_this3.marketOrderComplete(swapAccept, wallet));
        });
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Trade.sell let the trder sell the baseAsset,
   * receiving the quoteAsset using the current market price
   */
  ;

  _proto.sell = function sell(_ref2) {
    var market = _ref2.market,
        amount = _ref2.amount,
        address = _ref2.address,
        privateKey = _ref2.privateKey;

    try {
      var _this5 = this;

      if (!privateKey && !address) throw new Error('Either private key or native segwit address is required');

      if (!privateKey) {
        var watchOnlyWallet = WatchOnlyWallet.fromAddress(address, _this5.chain);
        return Promise.resolve(_this5.marketOrderRequest(market, TradeType.SELL, amount, watchOnlyWallet));
      } else {
        var wallet = Wallet.fromWIF(privateKey, _this5.chain);
        return Promise.resolve(_this5.marketOrderRequest(market, TradeType.SELL, amount, wallet)).then(function (swapAccept) {
          return Promise.resolve(_this5.marketOrderComplete(swapAccept, wallet));
        });
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.preview = function preview(market, tradeType, amountInSatoshis) {
    try {
      var _this7 = this;

      if (!isValidAmount(amountInSatoshis)) {
        throw new Error('Amount is not valid');
      }

      var baseAsset = market.baseAsset,
          quoteAsset = market.quoteAsset;
      return Promise.resolve(_this7.grpcClient.balances({
        baseAsset: baseAsset,
        quoteAsset: quoteAsset
      })).then(function (balancesAndFee) {
        if (tradeType === TradeType.BUY) {
          var assetToBeSent = quoteAsset;
          var assetToReceive = baseAsset;
          var amountToReceive = amountInSatoshis;
          if (amountToReceive > balancesAndFee.balances[assetToReceive]) throw new Error('Amount exceeds market balance');
          var amountToBeSent = calculateProposeAmount(balancesAndFee.balances[assetToBeSent], balancesAndFee.balances[assetToReceive], amountToReceive, balancesAndFee.fee);
          return {
            assetToBeSent: assetToBeSent,
            amountToBeSent: amountToBeSent,
            assetToReceive: assetToReceive,
            amountToReceive: amountToReceive
          };
        } else {
          var _assetToBeSent = baseAsset;
          var _assetToReceive = quoteAsset;
          var _amountToBeSent = amountInSatoshis;
          if (_amountToBeSent > balancesAndFee.balances[_assetToBeSent]) throw new Error('Amount exceeds market balance');

          var _amountToReceive = calculateExpectedAmount(balancesAndFee.balances[_assetToBeSent], balancesAndFee.balances[_assetToReceive], _amountToBeSent, balancesAndFee.fee);

          return {
            assetToBeSent: _assetToBeSent,
            amountToBeSent: _amountToBeSent,
            assetToReceive: _assetToReceive,
            amountToReceive: _amountToReceive
          };
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.marketOrderRequest = function marketOrderRequest(market, tradeType, amountInSatoshis, wallet) {
    try {
      var _this9 = this;

      return Promise.resolve(_this9.preview(market, tradeType, amountInSatoshis)).then(function (_ref3) {
        var assetToBeSent = _ref3.assetToBeSent,
            amountToBeSent = _ref3.amountToBeSent,
            assetToReceive = _ref3.assetToReceive,
            amountToReceive = _ref3.amountToReceive;
        return Promise.resolve(fetchUtxos(wallet.address, _this9.explorerUrl)).then(function (traderUtxos) {
          var emptyPsbt = Wallet.createTx(_this9.chain);
          var psbtBase64 = wallet.updateTx(emptyPsbt, traderUtxos, amountToBeSent, amountToReceive, assetToBeSent, assetToReceive);
          var swap = new Swap();
          var swapRequestSerialized = swap.request({
            assetToBeSent: assetToBeSent,
            amountToBeSent: amountToBeSent,
            assetToReceive: assetToReceive,
            amountToReceive: amountToReceive,
            psbtBase64: psbtBase64
          }); // 0 === Buy === receiving base_asset; 1 === sell === receiving base_asset

          return Promise.resolve(_this9.grpcClient.tradePropose(market, tradeType, swapRequestSerialized));
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.marketOrderComplete = function marketOrderComplete(swapAcceptSerialized, wallet) {
    try {
      var _this11 = this;

      // trader need to check the signed inputs by the provider
      // and add his own inputs if all is correct
      var swapAcceptMessage = SwapAccept.deserializeBinary(swapAcceptSerialized);
      var transaction = swapAcceptMessage.getTransaction();
      var signedPsbt = wallet.sign(transaction); // Trader  adds his signed inputs to the transaction

      var swap = new Swap();
      var swapCompleteSerialized = swap.complete({
        message: swapAcceptSerialized,
        psbtBase64: signedPsbt
      }); // Trader call the tradeComplete endpoint to finalize the swap

      return Promise.resolve(_this11.grpcClient.tradeComplete(swapCompleteSerialized));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return Trade;
}(Core);

export { Swap, Trade, TradeType, TraderClient, Wallet, WatchOnlyWallet, calculateExpectedAmount, calculateProposeAmount, fetchBalances, fetchUtxos };
//# sourceMappingURL=tdex-sdk.esm.js.map
