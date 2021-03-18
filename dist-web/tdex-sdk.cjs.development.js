'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ldk = require('ldk');
var liquidjsLib = require('liquidjs-lib');
var proto = require('tdex-protobuf/generated/js/swap_pb');
var services = require('tdex-protobuf/generated/js/TradeServiceClientPb');
var messages = require('tdex-protobuf/generated/js/trade_pb');
var types = require('tdex-protobuf/generated/js/types_pb');

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
	try {
		var result = body();
	} catch(e) {
		return recover(e);
	}
	if (result && result.then) {
		return result.then(void 0, recover);
	}
	return result;
}

var Core = function Core(data) {
  this.verbose = false;
  this.chain = 'regtest';
  Object.assign(this, data);
};

/**
 * Generates a random id of a fixed length.
 * @param length size of the string id.
 */

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
function decodePsbt(psetBase64) {
  var psbt;

  try {
    psbt = liquidjsLib.Psbt.fromBase64(psetBase64);
  } catch (ignore) {
    throw new Error('Invalid psbt');
  }

  var bufferTx = psbt.data.globalMap.unsignedTx.toBuffer();
  var transaction = liquidjsLib.Transaction.fromBuffer(bufferTx);
  return {
    psbt: psbt,
    transaction: transaction
  };
}
function getClearTextTorProxyUrl(torProxyEndpoint, url) {
  // get just_onion_host_without_dot_onion
  var splitted = url.hostname.split('.');
  splitted.pop();
  var onionPubKey = splitted.join('.');
  return torProxyEndpoint + "/" + onionPubKey;
}

/**
 * The Swap class implements the Swap TDEX protocol i.e swap.request, swap.accept and swap.complete.
 * @see https://github.com/TDex-network/tdex-specs/blob/master/03-swap-protocol.md
 */

/**
 * Returns the sum of the values of the given inputs' utxos.
 * @param utxos the inputs.
 * @param asset the asset to fetch value.
 * @param inputBlindKeys optional, the blinding keys using to unblind witnessUtxo if blinded.
 */
var countUtxos = function countUtxos(utxos, asset, inputBlindKeys) {
  if (inputBlindKeys === void 0) {
    inputBlindKeys = {};
  }

  try {
    var assetBuffer = Buffer.from(asset, 'hex').reverse();
    var filteredByWitness = utxos.filter(function (i) {
      return i.witnessUtxo != null;
    }); // unblind confidential prevouts

    return Promise.resolve(Promise.all(filteredByWitness.map(function (i) {
      try {
        var _exit4 = false;

        var _temp6 = function () {
          if (i.witnessUtxo && ldk.isConfidentialOutput(i.witnessUtxo)) {
            var blindKey = inputBlindKeys[i.witnessUtxo.script.toString('hex')];

            if (blindKey === undefined) {
              throw new Error('no blindKey for script: ' + i.witnessUtxo.script.toString('hex'));
            }

            return Promise.resolve(ldk.unblindOutput({
              blindedAsset: i.witnessUtxo.asset,
              blindedValue: i.witnessUtxo.value,
              script: i.witnessUtxo.script.toString('hex'),
              surjectionProof: i.witnessUtxo.surjectionProof,
              rangeProof: i.witnessUtxo.rangeProof,
              nonce: i.witnessUtxo.nonce
            }, blindKey.toString('hex'))).then(function (_ref10) {
              var unblindValue = _ref10.value,
                  unblindAsset = _ref10.asset;
              i.value = unblindValue;
              i.asset = unblindAsset;
              i.witnessUtxo.value = unblindValue;
            });
          }
        }();

        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function (_result3) {
          return _exit4 ? _result3 : i;
        }) : _exit4 ? _temp6 : i);
      } catch (e) {
        return Promise.reject(e);
      }
    }))).then(function (unblindedUtxos) {
      // filter inputs by asset and return the the count
      var filteredByAsset = unblindedUtxos.filter(function (i) {
        return assetBuffer.equals(i.witnessUtxo.asset.slice(1)) || i.asset === asset;
      });
      var queryValues = filteredByAsset.map(function (i) {
        var valAsNumber = i.witnessUtxo.value instanceof Buffer ? liquidjsLib.confidential.confidentialValueToSatoshi(i.witnessUtxo.value) : i.witnessUtxo.value;
        return valAsNumber;
      }); // apply reducer to values (add the values)

      return queryValues.reduce(function (a, b) {
        return a + b;
      }, 0);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * find an output in outputs corresponding to value and asset. Provide outputBlindKeys if output are blinded.
 * @param outputs the outputs to search in.
 * @param value value of the output.
 * @param asset hex encoded asset of the output.
 * @param outputBlindKeys optional, only if blinded outputs. Blinding keys map (scriptPukKey -> blindingKey).
 */
var outputFoundInTransaction = function outputFoundInTransaction(outputs, value, asset, outputBlindKeys) {
  if (outputBlindKeys === void 0) {
    outputBlindKeys = {};
  }

  try {
    return Promise.resolve(outputs.some(function (o) {
      try {
        var _exit2 = false;

        var _temp3 = function _temp3(_result2) {
          if (_exit2) return _result2;
          // check value and asset
          var assetBuffer = Buffer.from(asset, 'hex').reverse();
          var isAsset = assetBuffer.equals(o.asset.slice(1));
          var isValue = liquidjsLib.confidential.confidentialValueToSatoshi(o.value) === value;
          return isAsset && isValue;
        };

        // unblind first if confidential ouput
        var isConfidential = ldk.isConfidentialOutput(o);

        var _temp4 = function () {
          if (isConfidential === true) {
            var blindKey = outputBlindKeys[o.script.toString('hex')]; // if no blinding keys for the confidential ouput --> return false

            if (blindKey === undefined) throw new Error("no blind key for " + o.script.toString('hex'));
            return _catch(function () {
              return Promise.resolve(ldk.unblindOutput({
                blindedAsset: o.asset,
                blindedValue: o.value,
                script: o.script.toString('hex'),
                surjectionProof: o.surjectionProof,
                rangeProof: o.rangeProof,
                nonce: o.nonce
              }, blindKey.toString('hex'))).then(function (_ref9) {
                var unblindValue = _ref9.value,
                    unblindAsset = _ref9.asset;
                // check unblind value and unblind asset
                _exit2 = true;
                return unblindValue === value && unblindAsset === asset;
              });
            }, function () {
              // if unblind fail --> return false
              _exit2 = true;
              return false;
            });
          }
        }();

        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Take a swap messages and check if the message's data is corresponding to the  msg's transaction.
 * @param msgRequest the swap request message.
 * @param msgAccept the swap accept message.
 */
var compareMessagesAndTransaction = function compareMessagesAndTransaction(msgRequest, msgAccept) {
  try {
    // decode the transaction.
    var decodedFromRequest = decodePsbt(msgRequest.getTransaction()); // nonWitnessUtxo to witnessUtxoutxos

    decodedFromRequest.psbt.data.inputs.forEach(function (i, inputIndex) {
      if (!i.witnessUtxo && i.nonWitnessUtxo) {
        var vout = decodedFromRequest.transaction.ins[inputIndex].index;
        var witnessUtxo = liquidjsLib.Transaction.fromHex(i.nonWitnessUtxo).outs[vout];
        i.witnessUtxo = witnessUtxo;
      }
    }); // check the amount of the transaction

    return Promise.resolve(countUtxos(decodedFromRequest.psbt.data.inputs, msgRequest.getAssetP(), blindKeysMap(msgRequest.getInputBlindingKeyMap()))).then(function (totalP) {
      if (totalP < msgRequest.getAmountP()) {
        throw new Error('Cumulative utxos count is not enough to cover SwapRequest.amount_p');
      } // check if the output if found in the transaction


      return Promise.resolve(outputFoundInTransaction(decodedFromRequest.transaction.outs, msgRequest.getAmountR(), msgRequest.getAssetR(), blindKeysMap(msgRequest.getOutputBlindingKeyMap()))).then(function (outputRFound) {
        if (!outputRFound) throw new Error("Either SwapRequest.amount_r or SwapRequest.asset_r do not match the provided psbt (amount: " + msgRequest.getAmountR() + ", asset: " + msgRequest.getAssetR() + ")"); // msg accept

        return function () {
          if (msgAccept) {
            // decode the tx and check the msg's ids
            var decodedFromAccept = decodePsbt(msgAccept.getTransaction());
            if (msgRequest.getId() !== msgAccept.getRequestId()) throw new Error('SwapRequest.id and SwapAccept.request_id are not the same'); // check the amount of utxos.

            return Promise.resolve(countUtxos(decodedFromAccept.psbt.data.inputs, msgRequest.getAssetR(), blindKeysMap(msgAccept.getInputBlindingKeyMap()))).then(function (totalR) {
              if (totalR < msgRequest.getAmountR()) {
                throw new Error('Cumulative utxos count is not enough to cover SwapRequest.amount_r');
              } // check if there is an output found in the transaction.


              var outputPFound = outputFoundInTransaction(decodedFromAccept.transaction.outs, msgRequest.getAmountP(), msgRequest.getAssetP(), blindKeysMap(msgAccept.getOutputBlindingKeyMap()));
              if (!outputPFound) throw new Error("Either SwapRequest.amount_p or SwapRequest.asset_p do not match the provided psbt amount=" + msgRequest.getAmountP() + " asset=" + msgRequest.getAssetP());
            });
          }
        }();
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var Swap = /*#__PURE__*/function (_Core) {
  _inheritsLoose(Swap, _Core);

  function Swap() {
    return _Core.apply(this, arguments) || this;
  }

  var _proto = Swap.prototype;

  /**
   * Create and serialize a SwapRequest Message.
   * @param args the args of swap.request see requestOpts.
   */
  _proto.request = function request(_ref) {
    var amountToBeSent = _ref.amountToBeSent,
        assetToBeSent = _ref.assetToBeSent,
        amountToReceive = _ref.amountToReceive,
        assetToReceive = _ref.assetToReceive,
        psetBase64 = _ref.psetBase64,
        inputBlindingKeys = _ref.inputBlindingKeys,
        outputBlindingKeys = _ref.outputBlindingKeys;

    try {
      var _this2 = this;

      // Check amounts
      var msg = new proto.SwapRequest();
      msg.setId(makeid(8));
      msg.setAmountP(amountToBeSent);
      msg.setAssetP(assetToBeSent);
      msg.setAmountR(amountToReceive);
      msg.setAssetR(assetToReceive);
      msg.setTransaction(psetBase64);

      if (inputBlindingKeys) {
        // set the input blinding keys
        Object.entries(inputBlindingKeys).forEach(function (_ref2) {
          var key = _ref2[0],
              value = _ref2[1];
          msg.getInputBlindingKeyMap().set(key, Uint8Array.from(value));
        });
      }

      if (outputBlindingKeys) {
        // set the output blinding keys
        Object.entries(outputBlindingKeys).forEach(function (_ref3) {
          var key = _ref3[0],
              value = _ref3[1];
          msg.getOutputBlindingKeyMap().set(key, Uint8Array.from(value));
        });
      } // check the message content and transaction.


      return Promise.resolve(compareMessagesAndTransaction(msg)).then(function () {
        if (_this2.verbose) console.log(msg.toObject());
        return msg.serializeBinary();
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Create and serialize an accept message.
   * @param args the Swap.accept args, see AcceptOpts.
   */
  ;

  _proto.accept = function accept(_ref4) {
    var message = _ref4.message,
        psetBase64 = _ref4.psetBase64,
        inputBlindingKeys = _ref4.inputBlindingKeys,
        outputBlindingKeys = _ref4.outputBlindingKeys;

    try {
      var _this4 = this;

      // deserialize message parameter to get the SwapRequest message.
      var msgRequest = proto.SwapRequest.deserializeBinary(message); // Build Swap Accept message

      var msgAccept = new proto.SwapAccept();
      msgAccept.setId(makeid(8));
      msgAccept.setRequestId(msgRequest.getId());
      msgAccept.setTransaction(psetBase64);

      if (inputBlindingKeys) {
        // set the input blinding keys
        Object.entries(inputBlindingKeys).forEach(function (_ref5) {
          var key = _ref5[0],
              value = _ref5[1];
          msgAccept.getInputBlindingKeyMap().set(key, Uint8Array.from(value));
        });
      }

      if (outputBlindingKeys) {
        // set the output blinding keys
        Object.entries(outputBlindingKeys).forEach(function (_ref6) {
          var key = _ref6[0],
              value = _ref6[1];
          msgAccept.getOutputBlindingKeyMap().set(key, Uint8Array.from(value));
        });
      } // compare messages and transaction data


      return Promise.resolve(compareMessagesAndTransaction(msgRequest, msgAccept)).then(function () {
        if (_this4.verbose) console.log(msgAccept.toObject()); // serialize the SwapAccept message.

        return msgAccept.serializeBinary();
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * create and serialize a SwapComplete message.
   * @param args contains the SwapAccept message + the base64 encoded transaction.
   */
  ;

  _proto.complete = function complete(_ref7) {
    var message = _ref7.message,
        psetBase64 = _ref7.psetBase64;

    //First validate signatures
    var _decodePsbt = decodePsbt(psetBase64),
        psbt = _decodePsbt.psbt;

    if (!psbt.validateSignaturesOfAllInputs()) throw new Error('Signatures not valid');
    var msgAccept = proto.SwapAccept.deserializeBinary(message); //Build SwapComplete

    var msgComplete = new proto.SwapComplete();
    msgComplete.setId(makeid(8));
    msgComplete.setAcceptId(msgAccept.getId());
    msgComplete.setTransaction(psetBase64);
    if (this.verbose) console.log(msgAccept.toObject());
    return msgComplete.serializeBinary();
  };

  return Swap;
}(Core);
Swap.parse = parse;

function parse(_ref8) {
  var message = _ref8.message,
      type = _ref8.type;
  var msg;

  try {
    msg = proto[type].deserializeBinary(message);
  } catch (e) {
    throw new Error("Not valid message of expected type " + type);
  }

  return JSON.stringify(msg.toObject(), undefined, 2);
}
/**
 * Convert jspb's Map type to BlindKeysMap.
 * @param jspbMap the map to convert.
 */


function blindKeysMap(jspbMap) {
  var map = {};
  jspbMap.forEach(function (entry, key) {
    var value = entry instanceof Uint8Array ? Buffer.from(entry) : Buffer.from(entry, 'hex');
    map[key] = value;
  });
  return map;
}

var TraderClient = /*#__PURE__*/function () {
  function TraderClient(providerUrl) {
    this.providerUrl = providerUrl;
    var url = new URL(providerUrl); // we assume we are in Liquid mainnet
    // TODO check if socks5 proxy is running (ie. Tor Browser)

    if (url.hostname.includes('onion') && !url.protocol.includes('https')) {
      // We use the HTTP1 cleartext endpoint here provided by the public tor reverse proxy
      // https://pkg.go.dev/github.com/tdex-network/tor-proxy@v0.0.3/pkg/torproxy#NewTorProxy
      //host:port/<just_onion_host_without_dot_onion>/[<grpc_package>.<grpc_service>/<grpc_method>]
      var torProxyEndpoint = process.env.TOR_PROXY_ENDPOINT || 'https://proxy.tdex.network';
      this.providerUrl = getClearTextTorProxyUrl(torProxyEndpoint, url);
    }

    this.client = new services.TradeClient(this.providerUrl);
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
      var market = new types.Market();
      market.setBaseAsset(baseAsset);
      market.setQuoteAsset(quoteAsset);
      var request = new messages.TradeProposeRequest();
      request.setMarket(market);
      request.setType(tradeType);
      request.setSwapRequest(proto.SwapRequest.deserializeBinary(swapRequestSerialized));

      var call = _this.client.tradePropose(request);

      var data;
      call.on('data', function (reply) {
        throwErrorIfSwapFail(reply);
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
      var request = new messages.TradeCompleteRequest();
      request.setSwapComplete(proto.SwapComplete.deserializeBinary(swapCompleteSerialized));

      var call = _this2.client.tradeComplete(request);

      var data;
      call.on('data', function (reply) {
        throwErrorIfSwapFail(reply);
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
      _this3.client.markets(new messages.MarketsRequest(), null, function (err, response) {
        if (err) return reject(err);
        var list = response.getMarketsList().map(function (mktWithFee) {
          return {
            baseAsset: mktWithFee.getMarket().getBaseAsset(),
            quoteAsset: mktWithFee.getMarket().getQuoteAsset(),
            feeBasisPoint: mktWithFee.getFee().getBasisPoint()
          };
        });
        resolve(list);
      });
    });
  };

  _proto.marketPrice = function marketPrice(_ref2, tradeType, amount, asset) {
    var _this4 = this;

    var baseAsset = _ref2.baseAsset,
        quoteAsset = _ref2.quoteAsset;
    var market = new types.Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    var request = new messages.MarketPriceRequest();
    request.setMarket(market);
    request.setType(tradeType);
    request.setAmount(amount);
    request.setAsset(asset);
    return new Promise(function (resolve, reject) {
      _this4.client.marketPrice(request, null, function (err, response) {
        if (err) return reject(err);
        var list = response.getPricesList().map(function (mktWithFee) {
          return mktWithFee.toObject();
        });
        resolve(list);
      });
    });
  };

  _proto.balances = function balances(_ref3) {
    var _this5 = this;

    var baseAsset = _ref3.baseAsset,
        quoteAsset = _ref3.quoteAsset;
    var market = new types.Market();
    market.setBaseAsset(baseAsset);
    market.setQuoteAsset(quoteAsset);
    var request = new messages.BalancesRequest();
    request.setMarket(market);
    return new Promise(function (resolve, reject) {
      _this5.client.balances(request, null, function (err, response) {
        if (err) return reject(err);
        var reply = response.getBalancesList().map(function (balanceWithFee) {
          return balanceWithFee.toObject();
        });
        resolve(reply);
      });
    });
  };

  return TraderClient;
}();
function throwErrorIfSwapFail(tradeReply) {
  var swapFail = tradeReply.getSwapFail();

  if (swapFail) {
    var errorMessage = "SwapFail for message id=" + swapFail.getId() + ". Failure code " + swapFail.getFailureCode() + " | reason: " + swapFail.getFailureMessage();
    throw new Error(errorMessage);
  }
}

var SwapTransaction = /*#__PURE__*/function () {
  function SwapTransaction(identity) {
    this.inputBlindingKeys = {};
    this.outputBlindingKeys = {};
    this.identity = identity;
    this.network = identity.network;
    this.pset = new liquidjsLib.Psbt({
      network: this.network
    });
  }

  var _proto = SwapTransaction.prototype;

  _proto.create = function create(unspents, amountToBeSent, amountToReceive, assetToBeSent, assetToReceive, addressForSwapOutput, addressForChangeOutput, coinSelector) {
    var _this = this;

    if (coinSelector === void 0) {
      coinSelector = ldk.greedyCoinSelector();
    }

    var _coinSelector = coinSelector(unspents, [{
      value: amountToBeSent,
      asset: assetToBeSent,
      address: ''
    }], function (_) {
      return addressForChangeOutput;
    }),
        selectedUtxos = _coinSelector.selectedUtxos,
        changeOutputs = _coinSelector.changeOutputs;

    selectedUtxos.forEach(function (i) {
      _this.pset.addInput({
        // if hash is string, txid, if hash is Buffer, is reversed compared to txid
        hash: i.txid,
        index: i.vout,
        //We put here the blinded prevout
        witnessUtxo: i.prevout
      });

      if (!i.prevout) {
        throw new Error('create tx: missing prevout member for input ' + i.txid + ':' + i.vout);
      } // we update the inputBlindingKeys map after we add an input to the transaction


      var scriptHex = i.prevout.script.toString('hex');
      _this.inputBlindingKeys[scriptHex] = Buffer.from(_this.identity.getBlindingPrivateKey(scriptHex), 'hex');
    });
    var receivingScript = ldk.address.toOutputScript(addressForSwapOutput, this.network).toString('hex'); // The receiving output

    this.pset.addOutput({
      script: receivingScript,
      value: liquidjsLib.confidential.satoshiToConfidentialValue(amountToReceive),
      asset: assetToReceive,
      nonce: Buffer.from('00', 'hex')
    }); // we update the outputBlindingKeys map after we add the receiving output to the transaction

    this.outputBlindingKeys[receivingScript] = Buffer.from(this.identity.getBlindingPrivateKey(receivingScript), 'hex');

    if (changeOutputs.length > 0) {
      changeOutputs.forEach(function (changeOutput) {
        var changeScript = ldk.address.toOutputScript(changeOutput.address, _this.network).toString('hex'); // Change

        _this.pset.addOutput({
          script: changeScript,
          value: liquidjsLib.confidential.satoshiToConfidentialValue(changeOutput.value),
          asset: changeOutput.asset,
          nonce: Buffer.from('00', 'hex')
        }); // we update the outputBlindingKeys map after we add the change output to the transaction


        _this.outputBlindingKeys[changeScript] = Buffer.from(_this.identity.getBlindingPrivateKey(changeScript), 'hex');
      });
    }
  };

  return SwapTransaction;
}();

(function (TradeType) {
  TradeType[TradeType["BUY"] = 0] = "BUY";
  TradeType[TradeType["SELL"] = 1] = "SELL";
})(exports.TradeType || (exports.TradeType = {}));

var TradeCore = /*#__PURE__*/function (_Core) {
  _inheritsLoose(TradeCore, _Core);

  function TradeCore(args, factoryTraderClient) {
    var _this;

    _this = _Core.call(this, args) || this;

    _this.validate(args);

    _this.utxos = args.utxos;
    _this.coinSelector = args.coinSelector;
    _this.grpcClient = factoryTraderClient(args.providerUrl);
    return _this;
  }

  var _proto = TradeCore.prototype;

  _proto.validate = function validate(args) {
    if (!this.providerUrl) throw new Error('To be able to trade you need to select a liquidity provider via { providerUrl }');
    if (!this.explorerUrl) throw new Error('To be able to trade you need to select an explorer via { explorerUrl }');

    if (args.utxos.length <= 0) {
      throw new Error('You need at least one utxo to trade');
    }
  }
  /**
   * Trade.buy let the trader buy the baseAsset,
   * sending his own quoteAsset using the current market price
   */
  ;

  _proto.buy = function buy(_ref) {
    var market = _ref.market,
        amount = _ref.amount,
        asset = _ref.asset,
        identity = _ref.identity;

    try {
      var _this3 = this;

      return Promise.resolve(_this3.marketOrderRequest(market, exports.TradeType.BUY, amount, asset, identity)).then(function (swapAccept) {
        return Promise.resolve(_this3.marketOrderComplete(swapAccept, identity));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * Trade.sell let the trader sell the baseAsset,
   * receiving the quoteAsset using the current market price
   */
  ;

  _proto.sell = function sell(_ref2) {
    var market = _ref2.market,
        amount = _ref2.amount,
        asset = _ref2.asset,
        identity = _ref2.identity;

    try {
      var _this5 = this;

      return Promise.resolve(_this5.marketOrderRequest(market, exports.TradeType.SELL, amount, asset, identity)).then(function (swapAccept) {
        return Promise.resolve(_this5.marketOrderComplete(swapAccept, identity));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.preview = function preview(_ref3) {
    var market = _ref3.market,
        tradeType = _ref3.tradeType,
        amount = _ref3.amount,
        asset = _ref3.asset;

    try {
      var _this7 = this;

      if (!ldk.isValidAmount(amount)) {
        throw new Error('Amount is not valid');
      }

      var baseAsset = market.baseAsset,
          quoteAsset = market.quoteAsset;
      return Promise.resolve(_this7.grpcClient.marketPrice({
        baseAsset: baseAsset,
        quoteAsset: quoteAsset
      }, tradeType, amount, asset)).then(function (prices) {
        var previewedAmount = prices[0].amount;
        return tradeType === exports.TradeType.BUY ? {
          assetToBeSent: quoteAsset,
          amountToBeSent: asset === baseAsset ? previewedAmount : amount,
          assetToReceive: baseAsset,
          amountToReceive: asset === baseAsset ? amount : previewedAmount
        } : {
          assetToBeSent: baseAsset,
          amountToBeSent: asset === quoteAsset ? previewedAmount : amount,
          assetToReceive: quoteAsset,
          amountToReceive: asset === quoteAsset ? amount : previewedAmount
        };
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.marketOrderRequest = function marketOrderRequest(market, tradeType, amountInSatoshis, assetHash, identity) {
    try {
      var _this9 = this;

      return Promise.resolve(_this9.preview({
        market: market,
        tradeType: tradeType,
        amount: amountInSatoshis,
        asset: assetHash
      })).then(function (_ref4) {
        var assetToBeSent = _ref4.assetToBeSent,
            amountToBeSent = _ref4.amountToBeSent,
            assetToReceive = _ref4.assetToReceive,
            amountToReceive = _ref4.amountToReceive;
        var addressForOutput = identity.getNextAddress();
        var addressForChange = identity.getNextChangeAddress();
        var swapTx = new SwapTransaction(identity);
        swapTx.create(_this9.utxos, amountToBeSent, amountToReceive, assetToBeSent, assetToReceive, addressForOutput.confidentialAddress, addressForChange.confidentialAddress);
        var swap = new Swap();
        return Promise.resolve(swap.request({
          assetToBeSent: assetToBeSent,
          amountToBeSent: amountToBeSent,
          assetToReceive: assetToReceive,
          amountToReceive: amountToReceive,
          psetBase64: swapTx.pset.toBase64(),
          inputBlindingKeys: swapTx.inputBlindingKeys,
          outputBlindingKeys: swapTx.outputBlindingKeys
        })).then(function (swapRequestSerialized) {
          // 0 === Buy === receiving base_asset; 1 === sell === receiving base_asset
          return Promise.resolve(_this9.grpcClient.tradePropose(market, tradeType, swapRequestSerialized));
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.marketOrderComplete = function marketOrderComplete(swapAcceptSerialized, identity) {
    try {
      var _this11 = this;

      // trader need to check the signed inputs by the provider
      // and add his own inputs if all is correct
      var swapAcceptMessage = proto.SwapAccept.deserializeBinary(swapAcceptSerialized);
      var transaction = swapAcceptMessage.getTransaction();
      return Promise.resolve(identity.signPset(transaction)).then(function (signedPset) {
        // Trader  adds his signed inputs to the transaction
        var swap = new Swap();
        var swapCompleteSerialized = swap.complete({
          message: swapAcceptSerialized,
          psetBase64: signedPset
        }); // Trader call the tradeComplete endpoint to finalize the swap

        return Promise.resolve(_this11.grpcClient.tradeComplete(swapCompleteSerialized));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return TradeCore;
}(Core);

var Trade = /*#__PURE__*/function (_TradeCore) {
  _inheritsLoose(Trade, _TradeCore);

  function Trade(args) {
    return _TradeCore.call(this, args, function (provider) {
      return new TraderClient(provider);
    }) || this;
  }

  return Trade;
}(TradeCore);

Object.keys(ldk).forEach(function (k) {
  if (k !== 'default') Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return ldk[k];
    }
  });
});
exports.Swap = Swap;
exports.SwapTransaction = SwapTransaction;
exports.Trade = Trade;
exports.TradeCore = TradeCore;
exports.TraderClient = TraderClient;
exports.blindKeysMap = blindKeysMap;
exports.throwErrorIfSwapFail = throwErrorIfSwapFail;
//# sourceMappingURL=tdex-sdk.cjs.development.js.map
