# A simple class that provides an abstraction around various LLM model 
# parameters.
# 
# Example usage
#uri = "llm://openai/gpt-4/v1?temperature=0.7&max_tokens=1000&top_p=0.9&frequency_penalty=0.5&presence_penalty=0.6"
#llm_uri = LLMURI(uri)

#print(llm_uri)  # Prints the LLMURI object with parsed information
#print("Provider:", llm_uri.get_provider())
#print("Model:", llm_uri.get_model())
#print("Version:", llm_uri.get_version())
#print("Parameters:", llm_uri.get_parameters())


import urllib.parse

LLM_SCHEME = 'llm'
LLM_TEMPERATURE = 'temperature'
LLM_MAX_TOKENS = 'max_tokens'
LLM_TOP_P = 'top_p'
LLM_FREQUENCY_PENALTY = 'frequency_penalty'
LLM_PRESENCE_PENALTY = 'presence_penalty'

class LLMURI:
    def __init__(self, uri: str):
        self.scheme = None
        self.provider = None
        self.model = None
        self.version = None
        self.parameters = {}
        self.parse_uri(uri)
    
    def parse_uri(self, uri: str):
        parsed = urllib.parse.urlparse(uri)
        
        if parsed.scheme != LLM_SCHEME:
            raise ValueError("Invalid URI scheme. Expected 'llm'.")

        if parsed.netloc == '':
            raise ValueError("Invalid LLM Provider.")
        
        self.scheme = parsed.scheme
        self.provider = parsed.netloc

        parts = parsed.path.strip('/').split('/')
        if len(parts) > 0:
          self.model = parts[0]

        if len(parts) > 1:
          self.version = parts[1]
        else:
          self.version = ''

        self.parameters = dict(urllib.parse.parse_qsl(parsed.query))
        
        # Convert parameters to appropriate types
        self.parameters[LLM_TEMPERATURE] = float(self.parameters.get(LLM_TEMPERATURE, 0.7))
        self.parameters[LLM_MAX_TOKENS] = int(self.parameters.get(LLM_MAX_TOKENS, 1000))
        self.parameters[LLM_TOP_P] = float(self.parameters.get(LLM_TOP_P, 0.9))
        self.parameters[LLM_FREQUENCY_PENALTY] = float(self.parameters.get(LLM_FREQUENCY_PENALTY, 0.0))
        self.parameters[LLM_PRESENCE_PENALTY] = float(self.parameters.get(LLM_PRESENCE_PENALTY, 0.0))
    
    def get_provider(self):
        return self.provider
    
    def get_model(self):
        return self.model
    
    def get_version(self):
        return self.version
    
    def get_parameters(self):
        return self.parameters
    
    def __str__(self):
        return (f"LLMURI(provider={self.provider}, model={self.model}, version={self.version}, "
                f"parameters={self.parameters})")

