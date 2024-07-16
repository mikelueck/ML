from langchain_openai import ChatOpenAI
from ml_python.utils.secrets import secrets
from ml_python.ai.llm import llm
from ml_python.ai.llm import uri

LLM_OPENAI_PROVIDER = "openai"

s = secrets.Secrets([
  secrets.SecretItem("OPENAI_API_KEY", "2")
])

class OpenAILLM(llm.BaseLLMClass):
  llm = None

  def makeModelName(self):
     if len(self.llm_uri.get_version()) > 0:
       return "{}-{}".format(self.llm_uri.get_model(), self.llm_uri.get_version())
     return self.llm_uri.get_model()

  @classmethod
  def get_provider(cls):
    return LLM_OPENAI_PROVIDER

  def __init__(self, llm_uri):
    super().__init__(llm_uri)
    if self.llm_uri.get_provider() != LLM_OPENAI_PROVIDER:
      raise ValueError("Invalid provider for OpenAI, found {}".format(self.llm_uri.get_provider()))

    self.llm = ChatOpenAI(api_key=s.GetSecret("OPENAI_API_KEY"),
                      model_name=self.makeModelName(),
                      temperature=self.llm_uri.get_parameters()[uri.LLM_TEMPERATURE],
                      frequency_penalty=self.llm_uri.get_parameters()[uri.LLM_FREQUENCY_PENALTY],
                      presence_penalty=self.llm_uri.get_parameters()[uri.LLM_PRESENCE_PENALTY]
                )

  def LLM(self):
    return self.llm
    

