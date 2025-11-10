#!/bin/bash

# Define your GCP Project ID
GCP_PROJECT_ID="canbiocin-474014"

# Function to load a secret and set it as an environment variable
load_secret_as_env_var() {
  local secret_name=$1
  local env_var_name=$2

  if [ -z "$secret_name" ] || [ -z "$env_var_name" ]; then
    echo "Usage: load_secret_as_env_var <secret_name> <env_var_name>"
    return 1
  fi

  echo "Loading secret: $secret_name into environment variable: $env_var_name"

  secret_value=$(gcloud secrets versions access latest --secret="$secret_name" --project="$GCP_PROJECT_ID")

  if [ $? -eq 0 ]; then
    export "$env_var_name"="$secret_value"
    echo "Successfully loaded $secret_name."
  else
    echo "Error loading secret $secret_name. Please check permissions and secret name."
    return 1
  fi
}

load_secret_as_env_var "AUTH0_AUDIENCE" "AUTH0_AUDIENCE"
load_secret_as_env_var "AUTH0_CLIENT_ID" "AUTH0_CLIENT_ID"
load_secret_as_env_var "AUTH0_CLIENT_SECRET" "AUTH0_CLIENT_SECRET"
load_secret_as_env_var "AUTH0_DOMAIN" "AUTH0_DOMAIN"

export AUTH0_CLI_LOGIN=true

echo "$1 $2 $3 $4 $5"

$1 $2 $3 $4 $5
