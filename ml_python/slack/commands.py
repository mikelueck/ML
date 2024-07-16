from flask import jsonify

from ml_python.ai.langchain.translation import translate
from ml_python.ai.langchain.messages import human

BASE_MODEL = "llm://openai/gpt-3.5-turbo"
BASE_FROM = "english"
BASE_TO = "romanian"

def translate_command(request):
    parsed = request.form
    prompt = human.Human(parsed['text'])

    chain = translate.SetupChain(BASE_FROM, BASE_TO, BASE_MODEL)

    output = chain.invoke(prompt)

    # output will be an AIMessage
    str =  f"Input: {prompt.content}\n\nTranslation: {output.content} ({output.usage_metadata["input_tokens"]},{output.usage_metadata["output_tokens"]})"

    print(str)

    return str
