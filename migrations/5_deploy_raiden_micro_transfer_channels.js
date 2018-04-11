const TestToken = artifacts.require('./TestToken.sol');
const RaidenMicroTransferChannels = artifacts.require('./RaidenMicroTransferChannels.sol');

module.exports = function (deployer, network) {
  if(network == 'infuramainnet'){
    deployer.deploy(RaidenMicroTransferChannels, '0xa87c3ec87eb802aad080df0adb331e504d327e5d', 500, []);
  }
};
