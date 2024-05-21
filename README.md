# grpc_base

## Description

## Setup

If using ubuntu, perform these steps first

```
sudo apt-get update

#install bazel
brew install bazel
bazel --version 
# bazel 7.1.0-homebrew

#update PNPM from root with WORKSPACE file
#  see here for details https://docs.aspect.build/rulesets/aspect_rules_js/docs/pnpm/

bazel run -- @pnpm//:pnpm --dir $PWD install


#install go

https://go/dev/dl/
go version 
# go version go1.22.1 darwin/amd64

#install pybind11
brew install pybind11

#install docker
sudo snap install docker
sudo groupadd docker
sudo usermod -aG docker ${USER}
sudo chmod 666 /var/run/docker.sock
# check docker install
docker run hello-world

#install npm and yarn
sudo apt -y install npm
sudo npm install --global yarn

#install curl (perquisite for nvm below)
sudo apt -y install curl


```

then continue with the install as follows...

```
yarn
```

For yarn, make sure you're using node 18, check with `node -v`:

- Download Node Version Manager(NVM) for macOS or Linux, then install version 18, switch, and check the version:
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
  nvm install 18
  nvm use 18
  node -v
  ```
- If you get `nvm: command not found after running the install script`, follow the troubleshooting guides under "Installing and Updating" on the documentation https://github.com/nvm-sh/nvm#profile_snippet::

# Using Cloud functions

#gcloud CLI
#https://cloud.google.com/sdk/docs/install

brew install jq

# Cloud Functions local development
# gcloud alpha will first download the alpha commands
# https://cloud.google.com/functions/docs/running/functions-emulator

# Local Cloud Function Emulator
# https://buildpacks.io/docs/for-platform-operators/how-to/integrate-ci/pack/
brew install buildpacks/tap/pack

# deploy locally
# also bazel run //<package>:<target>-emulate-deploy
gcloud alpha functions local deploy <local_function_name> \
    --entry-point=<ENTRY_POINT> \
    --runtime=python312

# call local function
gcloud alpha functions local call <local_function_name> \
    --data='{"message": "<your message>"}'

# delete local function
gcloud alpha functions local delete <local_function_name>

