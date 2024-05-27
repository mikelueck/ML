from flask import jsonify


def gpt_command(request):
    parsed = request.form
    text = parsed['text']
    return "Got it: {}".format(text)
