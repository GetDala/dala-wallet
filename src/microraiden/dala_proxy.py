import logging
import requests
import json
import configparser
import os
import boto3
import jwt
from microraiden.click_helpers import main, pass_app
from microraiden.proxy.resources import Expensive, PaywalledProxyUrl
from flask import Response, make_response, request, render_template_string, jsonify

config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__),'config.ini'))
env = os.environ.get('ENVIRONMENT', 'SANDBOX')

lambdaClient = boto3.client('lambda')

registerUser = lambdaClient.get_function(FunctionName=config[env]['LAMBDA_REGISTER_USER'])['Configuration']['FunctionArn']
authenticate = lambdaClient.get_function(FunctionName=config[env]['LAMBDA_AUTHENTICATE'])['Configuration']['FunctionArn']
createWallet = lambdaClient.get_function(FunctionName=config[env]['LAMBDA_CREATE_WALLET'])['Configuration']['FunctionArn']
subscribe = lambdaClient.get_function(FunctionName=config[env]['LAMBDA_SUBSCRIBE'])['Configuration']['FunctionArn']


class PaywalledResourceBase(Expensive):
    def create_headers(request):
        return {
            'Content-Type': request.headers.get('content-type'),
            'Authorization': request.headers.get('Authorization'),
            'x-api-key': request.headers.get('x-api-key'),
            'x-sender-address': request.headers.get('RDN-Sender-Address')
        }


class PaywalledRegisterUser(PaywalledResourceBase):
    def post(self, url):
        headers = self.create_headers(request)
        response = requests.post(baseUrl + '/v1/users', json=request.json, headers=headers)
        return response.json()

class PaywalledAuthenticate(PaywalledResourceBase):
    def post(self, url):
        headers = self.create_headers(request)
        response = requests.post(baseUrl + '/v1/authentications', json=request.json, headers=headers)
        return response.json()

class PaywalledCreateWallet(PaywalledResourceBase):
    def post(self, url):
        decoded = jwt.decode(request.headers.get('authorization'), verify=False)
        senderAddress = request.headers.get('rdn-sender-address');
        body=request.json
        response = lambdaClient.invoke(
            FunctionName=createWallet,
            Payload=json.dumps({
                'username': decoded['cognito:username'],
                'firstName': decoded['given_name'],
                'surname':decoded['last_name'],
                'senderAddress': senderAddress,
                'body': body
            })
        )
        print('response', response)
        return json.dumps({'statusCode': '200', 'status': 'Alright'})
        # headers = self.create_headers(request)
        # response = requests.post(baseUrl+'v1/wallets', json=request.json, headers=headers)
        # return response.json()

class PaywalledSubscribe(PaywalledResourceBase):
    def post(self, url):
        headers = self.create_headers(request)
        response = requests.post(baseUrl+'v1/subscribers', json=request.json, headers=headers)
        return response.json()

@main.command()
@pass_app
def start(app):
    app.add_paywalled_resource(PaywalledRegisterUser, '/v1/users', 10)
    app.add_paywalled_resource(PaywalledAuthenticate, '/v1/authentications', 10)
    app.add_paywalled_resource(PaywalledCreateWallet, '/v1/wallets', 10)
    app.add_paywalled_resource(PaywalledSubscribe, '/v1/subscribers', 10)
    app.run(host='0.0.0.0',debug=True)
    app.join()


# from gevent import monkey
# monkey.patch_all()
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("blockchain").setLevel(logging.DEBUG)
logging.getLogger("channel_manager").setLevel(logging.DEBUG)
main()