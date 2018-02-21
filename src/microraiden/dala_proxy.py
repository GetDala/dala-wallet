import logging
import requests
import json
import configparser
import os
from microraiden.click_helpers import main, pass_app
from microraiden.proxy.resources import Expensive, PaywalledProxyUrl
from flask import Response, make_response, request, render_template_string, jsonify

config = configparser.ConfigParser()
config.read('src/microraiden/config.ini')
env = os.environ.get('ENVIRONMENT', 'SANDBOX')

baseUrl = config[env]['BASE_URL']

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
        headers = self.create_headers(request)
        response = requests.post(baseUrl+'v1/wallets', json=request.json, headers=headers)
        return response.json()

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