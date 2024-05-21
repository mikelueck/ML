import google_crc32c
import os

from google.cloud import secretmanager

project_id = os.environ["PROJECT_ID"]

client = secretmanager.SecretManagerServiceClient()

class SecretItem:
  def __init__(self, id, version):
    self.id = id
    self.version = str(version)

class Secrets:
  def __init__(self, secret_ids):
    self.secrets = {}
    
    for item in secret_ids:
      try: 
        secret_id = item.id
        version_id = str(item.version)
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"

        response = client.access_secret_version(request={"name": name})
        
        # Verify payload checksum.
        crc32c = google_crc32c.Checksum()
        crc32c.update(response.payload.data)
        if response.payload.data_crc32c == int(crc32c.hexdigest(), 16):
          self.secrets[secret_id] = response.payload.data
        else:
          print(f"Data corruption detected: {secret_id}:{version_id}")
      except:
          print(f"Fail to load secret: {secret_id}:{version_id}")
        
  def GetSecret(self, secret_id):
    return self.secrets[secret_id]
