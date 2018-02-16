import logging
import requests
import json
from microraiden.click_helpers import main, pass_app
from microraiden.proxy.resources import Expensive, PaywalledProxyUrl
from flask import Response, make_response, request, render_template_string, jsonify

class PaywalledRegisterUser(Expensive):
    def post(self, url):
        headers = {
            'Content-Type': request.headers.get('content-type'),
            'Authorization': request.headers.get('Authorization'),
            'x-api-key': request.headers.get('x-api-key')
        }
        response = requests.post('https://a1mg72o6ng.execute-api.eu-west-1.amazonaws.com/dev/v1/users', json=request.json, headers=headers)
        return response.json()

class PaywalledAuthenticate(Expensive):
    def post(self, url):
        headers = {
            'Content-Type': request.headers.get('content-type'),
            'Authorization': request.headers.get('Authorization'),
            'x-api-key': request.headers.get('x-api-key')
        }
        response = requests.post('https://a1mg72o6ng.execute-api.eu-west-1.amazonaws.com/dev/v1/authentications', json=request.json, headers=headers)
        return response.json()

@main.command()
@pass_app
def start(app):
    app.add_paywalled_resource(PaywalledRegisterUser, '/v1/users', 10)
    app.add_paywalled_resource(PaywalledAuthenticate, '/v1/authentications', 10)
    app.run(host='0.0.0.0',debug=True)
    app.join()


# from gevent import monkey
# monkey.patch_all()
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("blockchain").setLevel(logging.DEBUG)
logging.getLogger("channel_manager").setLevel(logging.DEBUG)
main()