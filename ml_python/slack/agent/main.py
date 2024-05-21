import functions_framework
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
#import openai

from ml_python.utils.secrets import secrets
from ml_python.slack import utils
from ml_python.slack import events

project_id = secrets.project_id

#TODO should probably take the version as an environment variable
s = secrets.Secrets([ 
  secrets.SecretItem("SLACK_API_TOKEN", "1"),
  secrets.SecretItem("SLACK_SIGNING_SECRET", "1"),
  secrets.SecretItem("SLACK_APP_ID", "1")])

ROUTES = (
    ('event/url_verification', events.url_verification_event),
    ('event/event_callback/reaction_added', events.reaction_added_event),
    #('command/reflect', reflect_command),
    #('command/recall', recall_command),
)

# Initialize the Slack client
BOT_APP_ID = s.GetSecret("SLACK_APP_ID")
slack_client = WebClient(s.GetSecret("SLACK_API_TOKEN"))

def dispatch(request):
  verify(request, s.GetSecret("SLACK_SIGNING_SECRET"))

  # events are application/json, and
  # slash commands are sent as x-www-form-urlencoded
  route = "unknown"
  if request.content_type == 'application/json':
      parsed = request.json
      event_type = parsed['type']
      route = 'event/' + event_type
      if 'event' in parsed and 'type' in parsed['event']:
          route += '/' + parsed['event']['type']
  elif request.content_type == 'application/x-www-form-urlencoded':
      data = request.form
      route = 'command/' + data['command'].strip('/')

  for path, handler in ROUTES:
      if path == route:
          return handler(request)

  print("couldn't handle route(%s), json(%s), form(%s)" % (route, request.json, request.form))
  raise Exception("couldn't handle route %s" % (route,))
  
