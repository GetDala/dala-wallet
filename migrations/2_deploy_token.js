var TestToken = artifacts.require('./TestToken.sol');

module.exports = function (deployer, network) {
    if (network == 'development' || network == 'develop') {
        deployer.deploy(TestToken);
    }
    if(network == 'infuraropsten'){
        deployer.deploy(TestToken);
    }
}