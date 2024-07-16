from langchain_core.messages.human import HumanMessage

# Just a thin wrapper around langchain objects

def Human(prompt):
  return HumanMessage(prompt)
