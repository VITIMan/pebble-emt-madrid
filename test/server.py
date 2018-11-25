import json
import logging
import requests
import sys
from ConfigParser import SafeConfigParser
from cgi import parse_qs, escape

# gunicorn --pid /tmp/emt.pid -c \
# /home/viti/pebble-dev/EMT-Madrid/test/gunicorn.conf server:app
# logging config
# ###############################
logger = logging.getLogger("DummyServerEMT")
logger.setLevel(logging.DEBUG)
logger.propagate = False

ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s|%(levelname)s|%(name)s|%(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)
# ###############################
# Config loader
parser = SafeConfigParser()
parser.read('server.conf')
id_client = parser.get('default', 'idClient')
pass_key = parser.get('default', 'passKey')
EMT_URL = parser.get('default', 'url')
logger.info("Loaded config")


def make_request(uri, parameters, raw=False):
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    parameters.update({"idClient": [id_client],
                       "passKey": [pass_key]})
    logger.info("SEND|{}|{}".format(uri, parameters))

    response = requests.post(EMT_URL + uri,
                             data=parameters,
                             verify=False,
                             headers=headers,)
    content = response.content.decode('utf-8')
    logger.debug(content)
    return json.loads(content)


def do_GET(environ, start_response):
    path = environ['PATH_INFO']

    headers = [('Content-Type', 'application/json')]
    parameters = parse_qs(environ.get('QUERY_STRING', ''))
    # logger.debug(environ)

    try:
        id_user = parameters.pop("id_user")[0]
    except (KeyError, IndexError):
        logger.error("id_user not found")
        id_user = ""

    if "raw" in parameters:
        parameters.pop("raw")
        raw = True
    else:
        raw = False

    if path == '/geo/GetArriveStop.php':
        try:
            logger.info("SEND|{}|{}".format(
                id_user,
                escape(parameters["idStop"][0])))
            start_response("200 OK", headers)
            return json.dumps(make_request("geo/GetArriveStop.php",
                                           parameters, raw=raw))
        except (KeyError, IndexError):
            logger.error("Incorrect parameters, cannot send")
            start_response("400 Bad Request", {})
            return ""
    elif path == '/geo/GetStopsFromXY.php' in path:
        try:
            logger.info("SEND|{}|{}|{}".format(
                id_user,
                escape(parameters["latitude"][0]),
                escape(parameters["longitude"][0])))
            start_response("200 OK", headers)
            return json.dumps(make_request("geo/GetStopsFromXY.php",
                                           parameters, raw=raw))
        except (KeyError, IndexError):
            logger.error("Incorrect parameters, cannot send")
            start_response("400 Bad Request", {})
            return ""
    else:
        start_response("403 Method Not Allowed", [])
        return ''


def app(environ, start_response):

    method = environ['REQUEST_METHOD']
    # ua = environ.get('HTTP_USER_AGENT', '')

    if method == 'GET':
        ret = do_GET(environ, start_response)
    else:
        start_response("403 Method Not Allowed", [])
        ret = ''
    return ret


"""

?user_id=PEBBLE_TOKEN&raw=1&latitude=0.0&longitude=0.0

Radius,idUser and key in the server

?user_id=PEBBLE_TOKEN&raw=1&latitude=0.0&longitude=0.0

"""
