import click
import os
import logging
from flask import send_file
from microraiden.click_helpers import main, pass_app
from microraiden.make_helpers import make_paywalled_proxy
from microraiden.proxy.resources import Expensive

class PaywalledTeapot(Expensive):
    def get(self, url):
        return "HI I AM A TEAPOT", 418


@main.command()
@pass_app
def start(app):
    app.add_paywalled_resource(PaywalledTeapot, '/teapot', 10)
    app.run(debug=True)  # nosec
    app.join()


from gevent import monkey
monkey.patch_all()
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("blockchain").setLevel(logging.DEBUG)
logging.getLogger("channel_manager").setLevel(logging.DEBUG)
main()