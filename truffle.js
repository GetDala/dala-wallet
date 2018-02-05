const mnemonic = require('./secret').mnemonic;
const HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id,
    },
    infuraropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/G2bbwcegsuLDEAnhkd2n")
      },
      from: '0x69b3bb7355d49ec0cb8503ff449f8758d7866733',
      gasPrice: 10000000000,
      gas: 4500000,
      network_id: 3
    }
  }
};
