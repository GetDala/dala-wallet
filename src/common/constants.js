'use strict';

module.exports.EventTypes = {
    CreateSubscriber: 'dala-subscriber:create',
    CreateWallet: 'dala-wallet:create',
    UserConfirmed: 'dala-user:confirmed',
    UserCreated: 'dala-user:created',
    WebhookReceived: 'dala-webhook:received',
    ExternalTransfer: 'dala-wallet:transfers:external',
    OnChainWalletCreateSuccessful: 'dala-wallet:onchain:create:successful',
    OnChainWalletCreateFailed: 'dala-wallet:onchain:create:failed'
}