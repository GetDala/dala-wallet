import logging
from microraiden.click_helpers import main, pass_app
from microraiden.proxy.resources import Expensive, PaywalledProxyUrl
from flask import make_response, request, render_template_string

class PaywalledTeapot(Expensive):
    def get(self, url):
        return "HI I AM A TEAPOT", 418

class PaywalledGoogle(PaywalledProxyUrl):
    def __init__(self, *args, **kwargs):
        super().__init__(domain='http://www.google.com', *args, **kwargs)

    def price(self):
        return self._price

@main.command()
@pass_app
def start(app):
    app.add_paywalled_resource(
        PaywalledGoogle,
        "/<path:x>",
        price=10
    )
    app.add_paywalled_resource(PaywalledTeapot, '/teapot', 10)
    app.run(host='0.0.0.0',debug=True)
    app.join()


from gevent import monkey
monkey.patch_all()
logging.basicConfig(level=logging.DEBUG)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("blockchain").setLevel(logging.DEBUG)
logging.getLogger("channel_manager").setLevel(logging.DEBUG)
main()