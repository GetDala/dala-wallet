import logging
import requests
import json
from microraiden.click_helpers import main, pass_app
from microraiden.proxy.resources import Expensive, PaywalledProxyUrl
from flask import Response, make_response, request, render_template_string, jsonify

class PaywalledTeapot(Expensive):
    def get(self, url):
        return "HI I AM A TEAPOT", 418

class PaywalledGoogle(PaywalledProxyUrl):
    def __init__(self, *args, **kwargs):
        super().__init__(domain='http://www.google.com', *args, **kwargs)

    def price(self):
        return self._price

class PaywalledRegisterUser(Expensive):
    def post(self, url):
        headers = {
            'Content-Type': request.headers.get('content-type'),
            'Authorization': request.headers.get('Authorization')
        }
        # for key,value in request.headers.items():
        #     headers[key] = value
        print(headers)
        response = requests.post('https://a1mg72o6ng.execute-api.eu-west-1.amazonaws.com/dev/v1/users', json=request.json, headers=headers)
        print(response.headers, response.status_code)
        return response.json()

@main.command()
@pass_app
def start(app):
    app.add_paywalled_resource(
        PaywalledGoogle,
        "/<path:x>",
        price=10
    )
    app.add_paywalled_resource(PaywalledTeapot, '/teapot', 10)
    app.add_paywalled_resource(PaywalledRegisterUser, '/users', 10)
    app.run(host='0.0.0.0',debug=True)
    app.join()


# from gevent import monkey
# monkey.patch_all()
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("blockchain").setLevel(logging.DEBUG)
logging.getLogger("channel_manager").setLevel(logging.DEBUG)
main()