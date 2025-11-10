# Install Auth0 CLI
brew tap auth0/auth0-cli && brew install auth0

# setupenv.sh sets up environment variables
./setupenv.sh && auth0 login
auth0 login --scopes create:client_grants

#Terraform generated from account
auth0 tf generate --output-dir tmp-auth0-tf

#import and generate 
./setupenv.sh terraform plan -generate-config-out=auth0.tf
