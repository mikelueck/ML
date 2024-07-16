from langchain.chains.llm import LLMChain
from langchain_core.prompts  import PromptTemplate
from ml_python.ai.llm import llm

def translate_template(from_language, to_language):
  translation_prompt = f"Translate the following text from {from_language} to {to_language}: "
  translation_prompt += "{prompt}"
  return PromptTemplate(input_variables=["prompt"], template=translation_prompt)

def SetupChain(from_language, to_language, llm_uri):
  
  model = llm.LLMBase.get_registry(llm_uri)(llm_uri)

  return translate_template(from_language, to_language) | model.LLM()
