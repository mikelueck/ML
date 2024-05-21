#!/usr/bin/env bash

local_tar=@@LOCAL_TAR@@
sha_file=@@DIGEST_FILE@@
project_id=@@PROJECT_ID@@
location=@@LOCATION@@
function=@@FUNCTION@@
repository=@@REPOSITORY@@
runtime=@@RUNTIME@@
entrypoint=@@ENTRYPOINT@@

sha=""
tar_file=""

if [ $local_tar != "" ]; then
  sha="local"
  tar_file="$local_tar"
  echo "Deploying using local artifacts!!!"
else
  sha=$(eval "cat $sha_file")
fi

dest=/tmp/$sha
mkdir $dest

if [ $local_tar == "" ]; then
  artifact=$function/manifests/$sha
  echo "Downloading artifact manifest $artifact:"

  # get the manifest
  gcloud artifacts files download \
  --project=$project_id \
  --location=$location \
  --repository=$repository \
  --destination=$dest \
  --allow-overwrite \
  --local-filename=$function.manifest.$sha \
  $artifact

  # extract the source tar file
  # Assume that the second layer is the source code
  source_tar_digest=$(eval "cat $dest/$function.manifest.$sha | jq -r '.layers[1].digest'")
  artifact=$source_tar_digest
  echo "Downloading artifact source tar $artifact:"
  gcloud artifacts files download \
  --project=$project_id \
  --location=$location \
  --repository=$repository \
  --destination=$dest \
  --allow-overwrite \
  --local-filename=$function.tar.$sha \
  $artifact

  tar_file=$dest/$function.tar.$sha
fi

# extract tar to directory
mkdir $dest/$function.$sha
tar xf $tar_file -C $dest/$function.$sha

# deploy the Cloud Function
gcloud functions deploy $function \
  --gen2 \
  --runtime=$runtime \
  --region=$location \
  --source=$dest/$function.$sha \
  --entry-point=$entrypoint \
  --trigger-http \
  --set-env-vars "PROJECT_ID=$project_id" \
  --allow-unauthenticated

echo "Cleaning up $dest"
rm -rf $dest
