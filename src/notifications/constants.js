'use strict';

module.exports.Topics = {
    OnChainWalletCreated: 'ON_CHAIN_WALLET_CREATED_TOPIC',
    WalletCreated: 'WALLET_CREATED_TOPIC',
    Withdrawal: 'WITHDRAWAL_TOPIC',
    Deposit: 'DEPOSIT_TOPIC',
    Transfer: 'TRANSFER_TOPIC'
}

module.exports.Statuses = {
    Successful: 'Successful',
    Failed: 'Failed'
}

module.exports.EventTypeTopicMaps = {
    'SAVINGSACCOUNT:APPROVED': 'WALLET_CREATED_TOPIC',
    'SAVINGSACCOUNT:DEPOSIT': 'DEPOSIT_TOPIC',
    'SAVINGSACCOUNT:WITHDRAWAL': 'WITHDRAWAL_TOPIC',
    'ACCOUNTTRANSFER:CREATE': 'TRANSFER_TOPIC'
}