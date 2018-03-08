import logging
import requests
import json
import configparser
import os
import boto3
import jwt
import urllib.parse
from microraiden.click_helpers import main, pass_app
from microraiden.proxy.resources import Expensive, PaywalledProxyUrl
from flask import Response, make_response, request, render_template_string, jsonify

config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__), 'config.ini'))
env = os.environ.get('ENVIRONMENT', 'SANDBOX')

lambdaClient = boto3.client('lambda')

registerUser = lambdaClient.get_function(
    FunctionName=config[env]['LAMBDA_REGISTER_USER'])['Configuration']['FunctionArn']
authenticate = lambdaClient.get_function(
    FunctionName=config[env]['LAMBDA_AUTHENTICATE'])['Configuration']['FunctionArn']
createWallet = lambdaClient.get_function(
    FunctionName=config[env]['LAMBDA_CREATE_WALLET'])['Configuration']['FunctionArn']
subscribe = lambdaClient.get_function(FunctionName=config[env]['LAMBDA_SUBSCRIBE'])[
    'Configuration']['FunctionArn']
internalTransfer = lambdaClient.get_function(
    FunctionName=config[env]['LAMBDA_INTERNAL_TRANSFER'])['Configuration']['FunctionArn']
externalTransfer = lambdaClient.get_function(
    FunctionName=config[env]['LAMBDA_EXTERNAL_TRANSFER'])['Configuration']['FunctionArn']


class PaywalledResourceBase(Expensive):
    def unauthorizedPost(self, url, lambdaFunction):
        senderAddress = request.headers.get('rdn-sender-address')
        body = request.json
        response = lambdaClient.invoke(
            FunctionName=lambdaFunction,
            Payload=json.dumps({
                'queryStringParameters': json.dumps(urllib.parse.parse_qs(request.query_string)),
                'headers': {
                    'senderAddress': senderAddress,
                    'paywall': True
                },
                'body': body
            })
        )
        return self.parseResponse(response)

    def authorizedPost(self, url, lambdaFunction):
        decoded = jwt.decode(request.headers.get(
            'authorization'), verify=False)
        print('decoded', decoded)
        senderAddress = request.headers.get('rdn-sender-address')
        body = request.json

        response = lambdaClient.invoke(
            FunctionName=lambdaFunction,
            Payload=json.dumps({
                'queryStringParameters': json.dumps(urllib.parse.parse_qs(request.query_string)),
                'headers': {
                    'username': decoded['cognito:username'],
                    'firstName': decoded['given_name'],
                    'surname': decoded['family_name'],
                    'senderAddress': senderAddress,
                    'paywall': True
                },
                'body': body
            })
        )
        return self.parseResponse(response)

    def parseResponse(self, response):
        print('parseResponse', response)
        if response['StatusCode'] != 200:
            return json.dumps({
                'statusCode': 500,
                'body': response['Payload']
            })
        else:
            return json.dumps(response['Payload'])


class PaywalledRegisterUser(PaywalledResourceBase):
    def post(self, url):
        return self.unauthorizedPost(url, registerUser)


class PaywalledAuthenticate(PaywalledResourceBase):
    def post(self, url):
        return self.unauthorizedPost(url, authenticate)


class PaywalledCreateWallet(PaywalledResourceBase):
    def post(self, url):
        return self.authorizedPost(url, createWallet)


class PaywalledSubscribe(PaywalledResourceBase):
    def post(self, url):
        return self.authorizedPost(url, subscribe)


class PaywalledInternalTransfer(PaywalledResourceBase):
    def post(self, url):
        return self.authorizedPost(url, internalTransfer)


class PaywalledExternalTransfer(PaywalledResourceBase):
    def post(self, url):
        return self.authorizedPost(url, externalTransfer)


@main.command()
@pass_app
def start(app):
    app.add_paywalled_resource(PaywalledRegisterUser, '/v1/users', 10)
    app.add_paywalled_resource(PaywalledAuthenticate, '/v1/authentications', 10)
    app.add_paywalled_resource(PaywalledCreateWallet, '/v1/wallets', 10)
    app.add_paywalled_resource(PaywalledSubscribe, '/v1/subscribers', 10)
    app.add_paywalled_resource(PaywalledInternalTransfer, '/v1/internal-transfers', 10)
    app.add_paywalled_resource(PaywalledExternalTransfer, '/v1/external-transfers', 10)
    app.run(host='0.0.0.0', debug=True)
    app.join()


# from gevent import monkey
# monkey.patch_all()
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("blockchain").setLevel(logging.DEBUG)
logging.getLogger("channel_manager").setLevel(logging.DEBUG)
main()
