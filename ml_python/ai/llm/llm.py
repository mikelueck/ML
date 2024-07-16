from ml_python.ai.llm import uri

class LLMBase(type):
  REGISTRY = {}

  def __new__(cls, name, bases, attrs):
   new_cls = type.__new__(cls, name, bases, attrs)
   cls.REGISTRY[new_cls.get_provider()] = new_cls
   return new_cls
    
  @classmethod
  def get_registry(cls, llm_uri):
    llm_uri = uri.LLMURI(llm_uri)
    print("Initializing LLM from URI: {}".format(llm_uri.get_provider()))
    if llm_uri.get_provider() in cls.REGISTRY:
      return cls.REGISTRY[llm_uri.get_provider()]

    raise ValueError
  


class BaseLLMClass(metaclass=LLMBase):
  llm_uri: None
  
  def __init__(self, llm_uri):
    self.llm_uri = uri.LLMURI(llm_uri)

  def LLM(self):
    raise NotImplementedError

  @classmethod
  def get_provider(cls):
    return "base"
