from langchain_core.messages.human import SystemMessage

# Just a thin wrapper around langchain objects

def System(prompt):
  return SystemMessage(prompt)
