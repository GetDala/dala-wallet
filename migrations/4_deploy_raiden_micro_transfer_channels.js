const TestToken = artifacts.require('./TestToken.sol');
const RaidenMicroTransferChannels = artifacts.require('./RaidenMicroTransferChannels.sol');

module.exports = function (deployer, network) {
  if (network == 'development' || network == 'develop') {
    deployer.deploy(RaidenMicroTransferChannels, TestToken.address, 500, []);
  }
  if (network == 'infuraropsten') {
    deployer.deploy(RaidenMicroTransferChannels, '0x5d689a3de1a648f85d23231a2d95fa89ce3d41fc', 500, []);
  }
  if(network == 'infuraropsten'){
    deployer.deploy(RaidenMicroTransferChannels, '0xa87c3ec87eb802aad080df0adb331e504d327e5d', 500, []);
  }
};
