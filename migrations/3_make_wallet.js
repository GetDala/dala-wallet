const TestToken = artifacts.require('./TestToken.sol');
const DalaWallet = artifacts.require('./DalaWallet.sol');

module.exports = function (deployer, network) {
  if (network == 'development' || network == 'develop') {
    deployer.deploy(DalaWallet, '0x5aeda56215b167893e80b4fe645ba6d5bab767de', TestToken.address, 500);
  }
  if (network == 'infuraropsten') {
    deployer.deploy(DalaWallet, '0x5aeda56215b167893e80b4fe645ba6d5bab767de', TestToken.address, 500);
  }
};
