"use strict";

const Web3 = require("web3");
const secretsClient = require("serverless-secrets/client");
const secretsPromise = secretsClient.load();
const { createEngine } = require("./utils");
const contract = require("../../lib/DalaWallet.json");

/**
 * The sweep event calls sweep on the provided wallet address and returns the resultant transaction hash. It does not indicate whether the transaction was successful or not.
 *
 * @param {string} address - the wallet address that should be swept
 */
module.exports.sweep = (address, context) => {
  return secretsPromise
    .then(() => {
      const {
        RPC_SERVER,
        PRIVATE_KEY,
        FROM_ADDRESS,
        DEFAULT_GAS
      } = process.env;
      const engine = createEngine(RPC_SERVER, PRIVATE_KEY, `0x${FROM_ADDRESS}`);

      const web3 = new Web3(engine);
      const wallet = web3.eth.contract(contract.abi).at(address);

      return {
        wallet,
        from: FROM_ADDRESS,
        gas: DEFAULT_GAS
      };
    })
    .then(({ wallet, from, gas }) => {
      return new Promise((resolve, reject) => {
        return wallet.sweep.sendTransaction({ from, gas }, (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        });
      });
    })
    .then(result => {
      console.log("sweep result", result);
      //did the wallet sweep work fine
      return context.succeed(result);
    })
    .catch(error => {
      return context.fail(error);
    });
};
