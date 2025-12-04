resource "auth0_user" "mflueck" {
    app_metadata   = null
    connection_name = auth0_connection.google_oauth2.name
    blocked        = false
    email          = "mflueck@gmail.com"
    email_verified = true
    family_name    = "Lueck"
    given_name     = "Michael"
    name           = "Michael Lueck"
    nickname       = "mflueck"
    phone_number   = null
    phone_verified = false
    picture        = "https://lh3.googleusercontent.com/a/ACg8ocKVmrEOPIbKhzEHvPkHqj5C1dBcxs43vFdCHJzDRp0vM4DtsMjdvQ=s96-c"
    user_metadata  = null
    username       = null
    verify_email   = false
}

resource "auth0_user_roles" "mflueck" {
  user_id = auth0_user.mflueck.id
  roles = [
    auth0_role.read_only.id,
    auth0_role.update_ingredients.id,
    auth0_role.update_recipe.id,
  ]
}
