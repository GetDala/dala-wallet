var TestToken = artifacts.require('./TestToken.sol');

module.exports = function (deployer, network) {
    if (network == 'development' || network == 'develop') {
        deployer.deploy(TestToken);
    }
    if(network == 'infuraropsten'){
        //will use the actual Dala token deployed on Ropsten
    }
}