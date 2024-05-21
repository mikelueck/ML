user=mflueck@gmail.com
project_id=macro-polymer-421920

# Create slackbotml-devops GCS bucket ahead of time

gcloud config set account $user
gcloud config set project $project_id
gcloud auth application-default login
