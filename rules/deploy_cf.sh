#!/usr/bin/env bash

emulate=@@EMULATE@@
local_tar=@@LOCAL_TAR@@
sha_file=@@DIGEST_FILE@@
project_id=@@PROJECT_ID@@
location=@@LOCATION@@
function=@@FUNCTION@@
repository=@@REPOSITORY@@
runtime=@@RUNTIME@@
entrypoint=@@ENTRYPOINT@@
service_acct=@@SERVICE_ACCT@@

sha=""
tar_file=""

if [ $local_tar != "" ]; then
  sha="local"
  tar_file="$local_tar"

  if [ $emulate != "1" ]; then
    echo "Deploying using local artifacts!!!"
  fi
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


alpha=""
local=""
if [ $emulate == "1" ]; then
  alpha="alpha"
  local="local"
fi

# delete the previous local version 
if [ $emulate == "1" ]; then
  echo "Deleting the previous version..."
  gcloud alpha functions local delete $function
fi

# we need to build it first
# I tried just using gcloud alpha functions local deploy but couldn't figure 
# out the authentication aspects
if [ $emulate == "1" ]; then
  pushd $dest/$function.$sha
  pack build $function --builder gcr.io/buildpacks/builder:v1 \
      --env GOOGLE_FUNCTION_SIGNATURE_TYPE=http \
      --env GOOGLE_FUNCTION_TARGET=$entrypoint
  popd
  # map our local ADC (Application Default Credentials) into th container
  adc="$HOME/.config/gcloud/application_default_credentials.json"
  mount="/tmp/keys/adc.json"
  port=8080
  docker run \
    --name $function \
    -e PROJECT_ID=$project_id \
    -e GOOGLE_APPLICATION_CREDENTIALS=$mount \
    -e PORT=$port \
    -p $port:$port \
    -v $adc:$mount:ro \
    $function 
else
  args=() 

  args+=("gcloud")
  args+=("$alpha")
  args+=("functions")
  args+=("$local")
  args+=("deploy")
  args+=("$function")
  args+=("--gen2")
  args+=("--runtime=$runtime")
  args+=("--region=$location")
  args+=("--trigger-http")
  args+=("--service-account=$service_acct@$project_id.iam.gserviceaccount.com")
  args+=("--allow-unauthenticated")
  args+=("--source=$dest/$function.$sha")
  args+=("--entry-point=$entrypoint")
  args+=("--set-env-vars 'PROJECT_ID=$project_id'")

  IFS=' '
  cmd="${args[*]}"

  # deploy the Cloud Function
  echo "Running: $cmd"
  eval "$cmd"
fi


echo "Cleaning up $dest"
rm -rf $dest
