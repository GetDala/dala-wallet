const TestToken = artifacts.require('./TestToken.sol');
const DalaWallet = artifacts.require('./DalaWallet.sol');

module.exports = function (deployer, network) {
  if (network == 'development' || network == 'develop') {
    deployer.deploy(DalaWallet, '0x5aeda56215b167893e80b4fe645ba6d5bab767de', TestToken.address);
  }
  if (network == 'infuraropsten') {
    deployer.deploy(DalaWallet, '0xC53246cc72a8b37FBaCCA32E1AB28C72F24bDc6B', '0x5d689a3de1a648f85d23231a2d95fa89ce3d41fc');
  }
};
