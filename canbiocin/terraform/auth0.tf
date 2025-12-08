resource "auth0_tenant" "tenant" {
  acr_values_supported                                 = []
  allow_organization_name_in_authentication_api        = false
  allowed_logout_urls                                  = []
  customize_mfa_in_postlogin_action                    = false
  default_audience                                     = null
  default_directory                                    = null
  default_redirection_uri                              = null
  disable_acr_values_supported                         = true
  enabled_locales                                      = ["en"]
  friendly_name                                        = null
  idle_session_lifetime                                = 72
  picture_url                                          = null
  pushed_authorization_requests_supported              = false
  sandbox_version                                      = jsonencode(22)
  session_lifetime                                     = 168
  skip_non_verifiable_callback_uri_confirmation_prompt = jsonencode(null)
  support_email                                        = null
  support_url                                          = null
  flags {
    allow_legacy_delegation_grant_types    = false
    allow_legacy_ro_grant_types            = false
    allow_legacy_tokeninfo_endpoint        = false
    dashboard_insights_view                = false
    dashboard_log_streams_next             = false
    disable_clickjack_protection_headers   = false
    disable_fields_map_fix                 = false
    disable_management_api_sms_obfuscation = false
    enable_adfs_waad_email_verification    = false
    enable_apis_section                    = false
    enable_client_connections              = false
    enable_custom_domain_in_emails         = false
    enable_dynamic_client_registration     = false
    enable_idtoken_api2                    = false
    enable_legacy_logs_search_v2           = false
    enable_legacy_profile                  = false
    enable_pipeline2                       = false
    enable_public_signup_user_exists_error = false
    enable_sso                             = true
    mfa_show_factor_list_on_enrollment     = false
    no_disclose_enterprise_connections     = false
    remove_alg_from_jwks                   = false
    revoke_refresh_token_grant             = false
    use_scope_descriptions_for_consent     = false
  }
  mtls {
    disable                 = true
    enable_endpoint_aliases = false
  }
  oidc_logout {
    rp_logout_end_session_endpoint_discovery = true
  }
  session_cookie {
    mode = null
  }
  sessions {
    oidc_logout_prompt_enabled = false
  }
}

resource "auth0_connection" "google_oauth2" {
  display_name         = null
  is_domain_connection = false
  metadata             = {}
  name                 = "google-oauth2"
  realms               = ["google-oauth2"]
  show_as_button       = null
  strategy             = "google-oauth2"
  options {
    access_token_url                       = null
    adfs_server                            = null
    allowed_audiences                      = []
    api_enable_users                       = false
    app_id                                 = null
    auth_params                            = {}
    authorization_endpoint                 = null
    brute_force_protection                 = false
    client_id                              = null
    client_secret                          = null # sensitive
    community_base_url                     = null
    configuration                          = null # sensitive
    consumer_key                           = null
    consumer_secret                        = null
    custom_scripts                         = {}
    debug                                  = false
    digest_algorithm                       = null
    disable_cache                          = false
    disable_self_service_change_password   = false
    disable_sign_out                       = false
    disable_signup                         = false
    discovery_url                          = null
    domain                                 = null
    domain_aliases                         = []
    enable_script_context                  = false
    enabled_database_customization         = false
    entity_id                              = null
    fed_metadata_xml                       = null
    fields_map                             = null
    forward_request_info                   = false
    from                                   = null
    gateway_url                            = null
    global_token_revocation_jwt_iss        = null
    global_token_revocation_jwt_sub        = null
    icon_url                               = null
    identity_api                           = null
    import_mode                            = false
    ips                                    = []
    issuer                                 = null
    jwks_uri                               = null
    key_id                                 = null
    map_user_id_to_id                      = false
    max_groups_to_retrieve                 = null
    messaging_service_sid                  = null
    metadata_url                           = null
    metadata_xml                           = null
    name                                   = null
    non_persistent_attrs                   = []
    password_policy                        = null
    ping_federate_base_url                 = null
    pkce_enabled                           = false
    precedence                             = []
    protocol_binding                       = null
    provider                               = null
    realm_fallback                         = false
    request_template                       = null
    request_token_url                      = null
    requires_username                      = false
    scopes                                 = ["email", "profile"]
    scripts                                = {}
    session_key                            = null
    set_user_root_attributes               = null
    should_trust_email_verified_connection = null
    sign_in_endpoint                       = null
    sign_out_endpoint                      = null
    sign_saml_request                      = false
    signature_algorithm                    = null
    signature_method                       = null
    signing_cert                           = null
    strategy_version                       = 0
    subject                                = null
    syntax                                 = null
    team_id                                = null
    template                               = null
    tenant_domain                          = null
    token_endpoint                         = null
    token_endpoint_auth_method             = null
    token_endpoint_auth_signing_alg        = null
    twilio_sid                             = null
    twilio_token                           = null # sensitive
    type                                   = null
    upstream_params                        = null
    use_cert_auth                          = false
    use_kerberos                           = false
    use_wsfed                              = false
    user_authorization_url                 = null
    user_id_attribute                      = null
    userinfo_endpoint                      = null
    waad_common_endpoint                   = false
    waad_protocol                          = null
  }
}

resource "auth0_connection" "microsoft" {
  display_name         = null
  is_domain_connection = false
  metadata             = {}
  name                 = "Microsoft"
  realms               = ["Microsoft"]
  show_as_button       = null
  strategy             = "windowslive"
  options {
    access_token_url                       = null
    adfs_server                            = null
    allowed_audiences                      = []
    api_enable_users                       = false
    app_id                                 = null
    auth_params                            = {}
    authorization_endpoint                 = null
    brute_force_protection                 = false
    client_id                              = null
    client_secret                          = null # sensitive
    community_base_url                     = null
    configuration                          = null # sensitive
    consumer_key                           = null
    consumer_secret                        = null
    custom_scripts                         = {}
    debug                                  = false
    digest_algorithm                       = null
    disable_cache                          = false
    disable_self_service_change_password   = false
    disable_sign_out                       = false
    disable_signup                         = false
    discovery_url                          = null
    domain                                 = null
    domain_aliases                         = []
    enable_script_context                  = false
    enabled_database_customization         = false
    entity_id                              = null
    fed_metadata_xml                       = null
    fields_map                             = null
    forward_request_info                   = false
    from                                   = null
    gateway_url                            = null
    global_token_revocation_jwt_iss        = null
    global_token_revocation_jwt_sub        = null
    icon_url                               = null
    identity_api                           = null
    import_mode                            = false
    ips                                    = []
    issuer                                 = null
    jwks_uri                               = null
    key_id                                 = null
    map_user_id_to_id                      = false
    max_groups_to_retrieve                 = null
    messaging_service_sid                  = null
    metadata_url                           = null
    metadata_xml                           = null
    name                                   = null
    non_persistent_attrs                   = []
    password_policy                        = null
    ping_federate_base_url                 = null
    pkce_enabled                           = false
    precedence                             = []
    protocol_binding                       = null
    provider                               = null
    realm_fallback                         = false
    request_template                       = null
    request_token_url                      = null
    requires_username                      = false
    scopes                                 = ["signin"]
    scripts                                = {}
    session_key                            = null
    set_user_root_attributes               = null
    should_trust_email_verified_connection = null
    sign_in_endpoint                       = null
    sign_out_endpoint                      = null
    sign_saml_request                      = false
    signature_algorithm                    = null
    signature_method                       = null
    signing_cert                           = null
    strategy_version                       = 0
    subject                                = null
    syntax                                 = null
    team_id                                = null
    template                               = null
    tenant_domain                          = null
    token_endpoint                         = null
    token_endpoint_auth_method             = null
    token_endpoint_auth_signing_alg        = null
    twilio_sid                             = null
    twilio_token                           = null # sensitive
    type                                   = null
    upstream_params                        = null
    use_cert_auth                          = false
    use_kerberos                           = false
    use_wsfed                              = false
    user_authorization_url                 = null
    user_id_attribute                      = null
    userinfo_endpoint                      = null
    waad_common_endpoint                   = false
    waad_protocol                          = null
  }
}

resource "auth0_client" "canbiocin" {
  allowed_clients                                      = []
  allowed_logout_urls                                  = ["http://localhost:8081"]
  allowed_origins                                      = []
  app_type                                             = "spa"
  async_approval_notification_channels                 = ["guardian-push"]
  callbacks                                            = ["http://localhost:8081"]
  client_aliases                                       = []
  client_metadata                                      = {}
  compliance_level                                     = null
  cross_origin_auth                                    = false
  cross_origin_loc                                     = null
  custom_login_page                                    = null
  custom_login_page_on                                 = true
  description                                          = null
  encryption_key                                       = null
  form_template                                        = null
  grant_types                                          = ["authorization_code", "implicit", "refresh_token"]
  initiate_login_uri                                   = null
  is_first_party                                       = true
  is_token_endpoint_ip_header_trusted                  = false
  logo_uri                                             = "https://storage.googleapis.com/canbiocin-static-site-dev-canbiocin-474014/CanBiocinLogo.avif"
  name                                                 = "Canbiocin"
  oidc_conformant                                      = true
  organization_discovery_methods                       = []
  organization_require_behavior                        = null
  organization_usage                                   = null
  require_proof_of_possession                          = false
  require_pushed_authorization_requests                = false
  resource_server_identifier                           = null
  skip_non_verifiable_callback_uri_confirmation_prompt = jsonencode(null)
  sso                                                  = false
  sso_disabled                                         = false
  web_origins                                          = ["http://localhost:8081"]
  default_organization {
    disable         = true
    flows           = []
    organization_id = null
  }
  jwt_configuration {
    alg                 = "RS256"
    lifetime_in_seconds = 36000
    scopes              = {}
    secret_encoded      = false
  }
  native_social_login {
    apple {
      enabled = false
    }
    facebook {
      enabled = false
    }
    google {
      enabled = false
    }
  }
  refresh_token {
    expiration_type              = "expiring"
    idle_token_lifetime          = 1296000
    infinite_idle_token_lifetime = false
    infinite_token_lifetime      = false
    leeway                       = 0
    rotation_type                = "rotating"
    token_lifetime               = 2592000
  }
}

resource "auth0_client_credentials" "canbiocin" {
  client_id             = auth0_client.canbiocin.id
  authentication_method = "none"
}

resource "auth0_client" "canbiocin_test_application" {
  allowed_clients                                      = []
  allowed_logout_urls                                  = []
  allowed_origins                                      = []
  app_type                                             = "non_interactive"
  async_approval_notification_channels                 = ["guardian-push"]
  callbacks                                            = []
  client_aliases                                       = []
  client_metadata                                      = {}
  compliance_level                                     = null
  cross_origin_auth                                    = false
  cross_origin_loc                                     = null
  custom_login_page                                    = null
  custom_login_page_on                                 = true
  description                                          = null
  encryption_key                                       = null
  form_template                                        = null
  grant_types                                          = ["client_credentials"]
  initiate_login_uri                                   = null
  is_first_party                                       = true
  is_token_endpoint_ip_header_trusted                  = false
  logo_uri                                             = null
  name                                                 = "Canbiocin (Test Application)"
  oidc_conformant                                      = true
  organization_discovery_methods                       = []
  organization_require_behavior                        = null
  organization_usage                                   = null
  require_proof_of_possession                          = false
  require_pushed_authorization_requests                = false
  resource_server_identifier                           = null
  skip_non_verifiable_callback_uri_confirmation_prompt = jsonencode(null)
  sso                                                  = false
  sso_disabled                                         = false
  web_origins                                          = []
  default_organization {
    disable         = true
    flows           = []
    organization_id = null
  }
  jwt_configuration {
    alg                 = "RS256"
    lifetime_in_seconds = 36000
    scopes              = {}
    secret_encoded      = false
  }
  refresh_token {
    expiration_type              = "non-expiring"
    idle_token_lifetime          = 2592000
    infinite_idle_token_lifetime = true
    infinite_token_lifetime      = true
    leeway                       = 0
    rotation_type                = "non-rotating"
    token_lifetime               = 31557600
  }
}

resource "auth0_client_credentials" "canbiocin_test_application" {
  client_id             = auth0_client.canbiocin_test_application.id
  authentication_method = "client_secret_post"
}

resource "auth0_connection_clients" "google_oauth2" {
  connection_id = auth0_connection.google_oauth2.id
  enabled_clients = [
    auth0_client.canbiocin.id,
    auth0_client.canbiocin_test_application.id,
  ]
}

resource "auth0_connection_clients" "microsoft" {
  connection_id = auth0_connection.microsoft.id
  enabled_clients = [
    auth0_client.canbiocin.id,
    auth0_client.canbiocin_test_application.id,
  ]
}

resource "auth0_role" "read_only" {
  description = "Read only"
  name        = "Read only"
}

locals {
  read_only_perms = ["read:ingredients", "read:recipes", "read:other"]
  update_ingredients_perms = ["write:ingredients", "read:other"]
  update_recipes_perms = ["write:recipes"]
  delete_all_perms = ["delete:ingredients", "delete:recipes", "delete:other"]
}

resource "auth0_role_permissions" "read_only" {

  role_id = auth0_role.read_only.id

  dynamic "permissions" {
    for_each = toset(local.read_only_perms)
    content {
      name = permissions.value
      resource_server_identifier = "canbiocin"
    }
  }

  depends_on = [
    auth0_resource_server_scopes.canbiocin
  ]
}

resource "auth0_role" "update_ingredients" {
  description = "Create, Update ingredients"
  name        = "Update Ingredients"
}

resource "auth0_role" "admin" {
  description = "Do everything"
  name        = "Create, Update, View, Delete everything"
}

resource "auth0_role_permissions" "update_ingredients" {
  role_id = auth0_role.update_ingredients.id

  dynamic "permissions" {
    for_each = toset(local.update_ingredients_perms)
    content {
      name = permissions.value
      resource_server_identifier = "canbiocin"
    }
  }
  depends_on = [
    auth0_resource_server_scopes.canbiocin
  ]
}

resource "auth0_role_permissions" "admin" {
  role_id = auth0_role.admin.id

  dynamic "permissions" {
    for_each = toset(setunion(local.read_only_perms, 
                              local.update_ingredients_perms, 
                              local.update_recipes_perms,
                              local.delete_all_perms))
    content {
      name = permissions.value
      resource_server_identifier = "canbiocin"
    }
  }

  depends_on = [
    auth0_resource_server_scopes.canbiocin
  ]
}

resource "auth0_role" "update_recipe" {
  description = "Create, Update Recipes"
  name        = "Update Recipe"
}

resource "auth0_role_permissions" "update_recipe" {
  for_each = toset(local.update_recipes_perms)
  role_id = auth0_role.update_recipe.id

  dynamic "permissions" {
    for_each = toset(local.update_recipes_perms)
    content {
      name = permissions.value
      resource_server_identifier = "canbiocin"
    }
  }
  depends_on = [
    auth0_resource_server_scopes.canbiocin
  ]
}

resource "auth0_resource_server_scopes" "auth0_management_api" {
  resource_server_identifier = "https://dev-1utgu7vgaanrc6i1.us.auth0.com/api/v2/"
  scopes {
    description = "Blacklist Tokens"
    name        = "blacklist:tokens"
  }
  scopes {
    description = "Configure new custom domains"
    name        = "create:custom_domains"
  }
  scopes {
    description = "Create Actions"
    name        = "create:actions"
  }
  scopes {
    description = "Create Authentication Methods"
    name        = "create:authentication_methods"
  }
  scopes {
    description = "Create Client Credentials"
    name        = "create:client_credentials"
  }
  scopes {
    description = "Create Client Grants"
    name        = "create:client_grants"
  }
  scopes {
    description = "Create Client Keys"
    name        = "create:client_keys"
  }
  scopes {
    description = "Create Clients"
    name        = "create:clients"
  }
  scopes {
    description = "Create Connection Profiles"
    name        = "create:connection_profiles"
  }
  scopes {
    description = "Create Connections"
    name        = "create:connections"
  }
  scopes {
    description = "Create Custom User Blocks"
    name        = "create:user_custom_blocks"
  }
  scopes {
    description = "Create Customer Provided Public Signing Keys"
    name        = "create:custom_signing_keys"
  }
  scopes {
    description = "Create Device Credentials"
    name        = "create:device_credentials"
  }
  scopes {
    description = "Create Email Provider"
    name        = "create:email_provider"
  }
  scopes {
    description = "Create Flows Vault connections"
    name        = "create:flows_vault_connections"
  }
  scopes {
    description = "Create Flows"
    name        = "create:flows"
  }
  scopes {
    description = "Create Forms"
    name        = "create:forms"
  }
  scopes {
    description = "Create Hooks"
    name        = "create:hooks"
  }
  scopes {
    description = "Create Network ACLs"
    name        = "create:network_acls"
  }
  scopes {
    description = "Create Organization Client Grants"
    name        = "create:organization_client_grants"
  }
  scopes {
    description = "Create Organization Discovery Domains"
    name        = "create:organization_discovery_domains"
  }
  scopes {
    description = "Create Organizations"
    name        = "create:organizations"
  }
  scopes {
    description = "Create Resource Servers"
    name        = "create:resource_servers"
  }
  scopes {
    description = "Create Rules"
    name        = "create:rules"
  }
  scopes {
    description = "Create SCIM configuration"
    name        = "create:scim_config"
  }
  scopes {
    description = "Create SCIM token"
    name        = "create:scim_token"
  }
  scopes {
    description = "Create SSO Access Tickets"
    name        = "create:sso_access_tickets"
  }
  scopes {
    description = "Create Self Service Profiles"
    name        = "create:self_service_profiles"
  }
  scopes {
    description = "Create Shields"
    name        = "create:shields"
  }
  scopes {
    description = "Create User Attribute Profiles"
    name        = "create:user_attribute_profiles"
  }
  scopes {
    description = "Create User Tickets"
    name        = "create:user_tickets"
  }
  scopes {
    description = "Create Users App Metadata"
    name        = "create:users_app_metadata"
  }
  scopes {
    description = "Create Users"
    name        = "create:users"
  }
  scopes {
    description = "Create Verifiable Digital Credential Templates"
    name        = "create:vdcs_templates"
  }
  scopes {
    description = "Create a Phone Notification Provider"
    name        = "create:phone_providers"
  }
  scopes {
    description = "Create a Phone Notification Template"
    name        = "create:phone_templates"
  }
  scopes {
    description = "Create connection keys"
    name        = "create:connections_keys"
  }
  scopes {
    description = "Create email templates"
    name        = "create:email_templates"
  }
  scopes {
    description = "Create encryption keys"
    name        = "create:encryption_keys"
  }
  scopes {
    description = "Create enrollment tickets for Guardian"
    name        = "create:guardian_enrollment_tickets"
  }
  scopes {
    description = "Create event streams"
    name        = "create:event_streams"
  }
  scopes {
    description = "Create log_streams"
    name        = "create:log_streams"
  }
  scopes {
    description = "Create organization connections"
    name        = "create:organization_connections"
  }
  scopes {
    description = "Create organization invitations"
    name        = "create:organization_invitations"
  }
  scopes {
    description = "Create organization member roles"
    name        = "create:organization_member_roles"
  }
  scopes {
    description = "Create organization members"
    name        = "create:organization_members"
  }
  scopes {
    description = "Create password checking jobs"
    name        = "create:passwords_checking_job"
  }
  scopes {
    description = "Create role members"
    name        = "create:role_members"
  }
  scopes {
    description = "Create roles"
    name        = "create:roles"
  }
  scopes {
    description = "Create signing keys"
    name        = "create:signing_keys"
  }
  scopes {
    description = "Delete Actions"
    name        = "delete:actions"
  }
  scopes {
    description = "Delete Anomaly Detection Blocks"
    name        = "delete:anomaly_blocks"
  }
  scopes {
    description = "Delete Authentication Methods"
    name        = "delete:authentication_methods"
  }
  scopes {
    description = "Delete Client Credentials"
    name        = "delete:client_credentials"
  }
  scopes {
    description = "Delete Client Grants"
    name        = "delete:client_grants"
  }
  scopes {
    description = "Delete Client Keys"
    name        = "delete:client_keys"
  }
  scopes {
    description = "Delete Clients"
    name        = "delete:clients"
  }
  scopes {
    description = "Delete Connection Profiles"
    name        = "delete:connection_profiles"
  }
  scopes {
    description = "Delete Connections"
    name        = "delete:connections"
  }
  scopes {
    description = "Delete Custom User Blocks"
    name        = "delete:user_custom_blocks"
  }
  scopes {
    description = "Delete Customer Provided Public Signing Keys"
    name        = "delete:custom_signing_keys"
  }
  scopes {
    description = "Delete Device Credentials"
    name        = "delete:device_credentials"
  }
  scopes {
    description = "Delete Email Provider"
    name        = "delete:email_provider"
  }
  scopes {
    description = "Delete Federated Connections Tokensets belonging to a user"
    name        = "delete:federated_connections_tokens"
  }
  scopes {
    description = "Delete Flows Executions"
    name        = "delete:flows_executions"
  }
  scopes {
    description = "Delete Flows Vault connections"
    name        = "delete:flows_vault_connections"
  }
  scopes {
    description = "Delete Flows"
    name        = "delete:flows"
  }
  scopes {
    description = "Delete Forms"
    name        = "delete:forms"
  }
  scopes {
    description = "Delete Guardian enrollments"
    name        = "delete:guardian_enrollments"
  }
  scopes {
    description = "Delete Hooks"
    name        = "delete:hooks"
  }
  scopes {
    description = "Delete Network ACLs"
    name        = "delete:network_acls"
  }
  scopes {
    description = "Delete Organization Client Grants"
    name        = "delete:organization_client_grants"
  }
  scopes {
    description = "Delete Organization Discovery Domains"
    name        = "delete:organization_discovery_domains"
  }
  scopes {
    description = "Delete Organizations"
    name        = "delete:organizations"
  }
  scopes {
    description = "Delete Refresh Tokens"
    name        = "delete:refresh_tokens"
  }
  scopes {
    description = "Delete Resource Servers"
    name        = "delete:resource_servers"
  }
  scopes {
    description = "Delete Rules Configs"
    name        = "delete:rules_configs"
  }
  scopes {
    description = "Delete Rules"
    name        = "delete:rules"
  }
  scopes {
    description = "Delete SCIM configuration"
    name        = "delete:scim_config"
  }
  scopes {
    description = "Delete SCIM token"
    name        = "delete:scim_token"
  }
  scopes {
    description = "Delete SSO Access Tickets"
    name        = "delete:sso_access_tickets"
  }
  scopes {
    description = "Delete Self Service Profiles"
    name        = "delete:self_service_profiles"
  }
  scopes {
    description = "Delete Sessions"
    name        = "delete:sessions"
  }
  scopes {
    description = "Delete Shields"
    name        = "delete:shields"
  }
  scopes {
    description = "Delete User Attribute Profiles"
    name        = "delete:user_attribute_profiles"
  }
  scopes {
    description = "Delete User Grants"
    name        = "delete:grants"
  }
  scopes {
    description = "Delete Users App Metadata"
    name        = "delete:users_app_metadata"
  }
  scopes {
    description = "Delete Users"
    name        = "delete:users"
  }
  scopes {
    description = "Delete Verifiable Digital Credential Templates"
    name        = "delete:vdcs_templates"
  }
  scopes {
    description = "Delete a Phone Notification Provider"
    name        = "delete:phone_providers"
  }
  scopes {
    description = "Delete a Phone Notification Template"
    name        = "delete:phone_templates"
  }
  scopes {
    description = "Delete branding settings"
    name        = "delete:branding"
  }
  scopes {
    description = "Delete custom domains configurations"
    name        = "delete:custom_domains"
  }
  scopes {
    description = "Delete encryption keys"
    name        = "delete:encryption_keys"
  }
  scopes {
    description = "Delete event streams"
    name        = "delete:event_streams"
  }
  scopes {
    description = "Delete log_streams"
    name        = "delete:log_streams"
  }
  scopes {
    description = "Delete organization connections"
    name        = "delete:organization_connections"
  }
  scopes {
    description = "Delete organization invitations"
    name        = "delete:organization_invitations"
  }
  scopes {
    description = "Delete organization member roles"
    name        = "delete:organization_member_roles"
  }
  scopes {
    description = "Delete organization members"
    name        = "delete:organization_members"
  }
  scopes {
    description = "Delete roles"
    name        = "delete:roles"
  }
  scopes {
    description = "Deletes password checking job and all its resources"
    name        = "delete:passwords_checking_job"
  }
  scopes {
    description = "List Federated Connections Tokensets belonging to a user"
    name        = "read:federated_connections_tokens"
  }
  scopes {
    description = "Read Actions"
    name        = "read:actions"
  }
  scopes {
    description = "Read Anomaly Detection Blocks"
    name        = "read:anomaly_blocks"
  }
  scopes {
    description = "Read Authentication Methods"
    name        = "read:authentication_methods"
  }
  scopes {
    description = "Read Client Credentials"
    name        = "read:client_credentials"
  }
  scopes {
    description = "Read Client Grants"
    name        = "read:client_grants"
  }
  scopes {
    description = "Read Client Keys"
    name        = "read:client_keys"
  }
  scopes {
    description = "Read Clients"
    name        = "read:clients"
  }
  scopes {
    description = "Read Connection Profiles"
    name        = "read:connection_profiles"
  }
  scopes {
    description = "Read Connections Options"
    name        = "read:connections_options"
  }
  scopes {
    description = "Read Connections"
    name        = "read:connections"
  }
  scopes {
    description = "Read Custom User Blocks"
    name        = "read:user_custom_blocks"
  }
  scopes {
    description = "Read Customer Provided Public Signing Keys"
    name        = "read:custom_signing_keys"
  }
  scopes {
    description = "Read Device Credentials"
    name        = "read:device_credentials"
  }
  scopes {
    description = "Read Email Provider"
    name        = "read:email_provider"
  }
  scopes {
    description = "Read Flows Executions"
    name        = "read:flows_executions"
  }
  scopes {
    description = "Read Flows Vault connections"
    name        = "read:flows_vault_connections"
  }
  scopes {
    description = "Read Flows Vault items"
    name        = "read:flows_vault"
  }
  scopes {
    description = "Read Flows"
    name        = "read:flows"
  }
  scopes {
    description = "Read Forms"
    name        = "read:forms"
  }
  scopes {
    description = "Read Guardian enrollments"
    name        = "read:guardian_enrollments"
  }
  scopes {
    description = "Read Guardian factors configuration"
    name        = "read:guardian_factors"
  }
  scopes {
    description = "Read Hooks"
    name        = "read:hooks"
  }
  scopes {
    description = "Read Insights"
    name        = "read:insights"
  }
  scopes {
    description = "Read Logs"
    name        = "read:logs"
  }
  scopes {
    description = "Read Multifactor Authentication policies"
    name        = "read:mfa_policies"
  }
  scopes {
    description = "Read Network ACLs"
    name        = "read:network_acls"
  }
  scopes {
    description = "Read Organization Client Grants"
    name        = "read:organization_client_grants"
  }
  scopes {
    description = "Read Organization Discovery Domains"
    name        = "read:organization_discovery_domains"
  }
  scopes {
    description = "Read Organizations"
    name        = "read:organizations"
  }
  scopes {
    description = "Read Refresh Tokens"
    name        = "read:refresh_tokens"
  }
  scopes {
    description = "Read Resource Servers"
    name        = "read:resource_servers"
  }
  scopes {
    description = "Read Rules Configs"
    name        = "read:rules_configs"
  }
  scopes {
    description = "Read Rules"
    name        = "read:rules"
  }
  scopes {
    description = "Read SCIM configuration"
    name        = "read:scim_config"
  }
  scopes {
    description = "Read SCIM token"
    name        = "read:scim_token"
  }
  scopes {
    description = "Read Security Metrics"
    name        = "read:security_metrics"
  }
  scopes {
    description = "Read Self Service Profile Custom Texts"
    name        = "read:self_service_profile_custom_texts"
  }
  scopes {
    description = "Read Self Service Profiles"
    name        = "read:self_service_profiles"
  }
  scopes {
    description = "Read Sessions"
    name        = "read:sessions"
  }
  scopes {
    description = "Read Shields"
    name        = "read:shields"
  }
  scopes {
    description = "Read Stats"
    name        = "read:stats"
  }
  scopes {
    description = "Read Tenant Settings"
    name        = "read:tenant_settings"
  }
  scopes {
    description = "Read Triggers"
    name        = "read:triggers"
  }
  scopes {
    description = "Read User Attribute Profiles"
    name        = "read:user_attribute_profiles"
  }
  scopes {
    description = "Read User Grants"
    name        = "read:grants"
  }
  scopes {
    description = "Read Users App Metadata"
    name        = "read:users_app_metadata"
  }
  scopes {
    description = "Read Users IDP tokens"
    name        = "read:user_idp_tokens"
  }
  scopes {
    description = "Read Users"
    name        = "read:users"
  }
  scopes {
    description = "Read Verifiable Digital Credential Templates"
    name        = "read:vdcs_templates"
  }
  scopes {
    description = "Read a Phone Notification Provider"
    name        = "read:phone_providers"
  }
  scopes {
    description = "Read a Phone Notification Template"
    name        = "read:phone_templates"
  }
  scopes {
    description = "Read attack protection"
    name        = "read:attack_protection"
  }
  scopes {
    description = "Read branding settings"
    name        = "read:branding"
  }
  scopes {
    description = "Read connection keys"
    name        = "read:connections_keys"
  }
  scopes {
    description = "Read custom domains configurations"
    name        = "read:custom_domains"
  }
  scopes {
    description = "Read email templates"
    name        = "read:email_templates"
  }
  scopes {
    description = "Read encryption keys"
    name        = "read:encryption_keys"
  }
  scopes {
    description = "Read entitlements"
    name        = "read:entitlements"
  }
  scopes {
    description = "Read entity limits"
    name        = "read:limits"
  }
  scopes {
    description = "Read event stream deliveries"
    name        = "read:event_deliveries"
  }
  scopes {
    description = "Read event streams"
    name        = "read:event_streams"
  }
  scopes {
    description = "Read log_streams"
    name        = "read:log_streams"
  }
  scopes {
    description = "Read logs relating to users"
    name        = "read:logs_users"
  }
  scopes {
    description = "Read organization connections"
    name        = "read:organization_connections"
  }
  scopes {
    description = "Read organization invitations"
    name        = "read:organization_invitations"
  }
  scopes {
    description = "Read organization member roles"
    name        = "read:organization_member_roles"
  }
  scopes {
    description = "Read organization members"
    name        = "read:organization_members"
  }
  scopes {
    description = "Read organization summary"
    name        = "read:organizations_summary"
  }
  scopes {
    description = "Read prompts settings"
    name        = "read:prompts"
  }
  scopes {
    description = "Read role members"
    name        = "read:role_members"
  }
  scopes {
    description = "Read roles"
    name        = "read:roles"
  }
  scopes {
    description = "Read signing keys"
    name        = "read:signing_keys"
  }
  scopes {
    description = "Redeliver event(s) to an event stream"
    name        = "update:event_deliveries"
  }
  scopes {
    description = "Update Actions"
    name        = "update:actions"
  }
  scopes {
    description = "Update Authentication Methods"
    name        = "update:authentication_methods"
  }
  scopes {
    description = "Update Client Credentials"
    name        = "update:client_credentials"
  }
  scopes {
    description = "Update Client Grants"
    name        = "update:client_grants"
  }
  scopes {
    description = "Update Client Keys"
    name        = "update:client_keys"
  }
  scopes {
    description = "Update Clients"
    name        = "update:clients"
  }
  scopes {
    description = "Update Connection Profiles"
    name        = "update:connection_profiles"
  }
  scopes {
    description = "Update Connections Options"
    name        = "update:connections_options"
  }
  scopes {
    description = "Update Connections"
    name        = "update:connections"
  }
  scopes {
    description = "Update Customer Provided Public Signing Keys"
    name        = "update:custom_signing_keys"
  }
  scopes {
    description = "Update Device Credentials"
    name        = "update:device_credentials"
  }
  scopes {
    description = "Update Email Provider"
    name        = "update:email_provider"
  }
  scopes {
    description = "Update Flows Vault connections"
    name        = "update:flows_vault_connections"
  }
  scopes {
    description = "Update Flows"
    name        = "update:flows"
  }
  scopes {
    description = "Update Forms"
    name        = "update:forms"
  }
  scopes {
    description = "Update Guardian factors"
    name        = "update:guardian_factors"
  }
  scopes {
    description = "Update Hooks"
    name        = "update:hooks"
  }
  scopes {
    description = "Update Multifactor Authentication policies"
    name        = "update:mfa_policies"
  }
  scopes {
    description = "Update Network ACLs"
    name        = "update:network_acls"
  }
  scopes {
    description = "Update Organization Discovery Domains"
    name        = "update:organization_discovery_domains"
  }
  scopes {
    description = "Update Organizations"
    name        = "update:organizations"
  }
  scopes {
    description = "Update Refresh Tokens"
    name        = "update:refresh_tokens"
  }
  scopes {
    description = "Update Resource Servers"
    name        = "update:resource_servers"
  }
  scopes {
    description = "Update Rules Configs"
    name        = "update:rules_configs"
  }
  scopes {
    description = "Update Rules"
    name        = "update:rules"
  }
  scopes {
    description = "Update SCIM configuration"
    name        = "update:scim_config"
  }
  scopes {
    description = "Update Self Service Profile Custom Texts"
    name        = "update:self_service_profile_custom_texts"
  }
  scopes {
    description = "Update Self Service Profiles"
    name        = "update:self_service_profiles"
  }
  scopes {
    description = "Update Sessions"
    name        = "update:sessions"
  }
  scopes {
    description = "Update Shields"
    name        = "update:shields"
  }
  scopes {
    description = "Update Tenant Settings"
    name        = "update:tenant_settings"
  }
  scopes {
    description = "Update Triggers"
    name        = "update:triggers"
  }
  scopes {
    description = "Update User Attribute Profiles"
    name        = "update:user_attribute_profiles"
  }
  scopes {
    description = "Update Users App Metadata"
    name        = "update:users_app_metadata"
  }
  scopes {
    description = "Update Users"
    name        = "update:users"
  }
  scopes {
    description = "Update Verifiable Digital Credential Templates"
    name        = "update:vdcs_templates"
  }
  scopes {
    description = "Update a Phone Notification Provider"
    name        = "update:phone_providers"
  }
  scopes {
    description = "Update a Phone Notification Template"
    name        = "update:phone_templates"
  }
  scopes {
    description = "Update attack protection"
    name        = "update:attack_protection"
  }
  scopes {
    description = "Update branding settings"
    name        = "update:branding"
  }
  scopes {
    description = "Update connection keys"
    name        = "update:connections_keys"
  }
  scopes {
    description = "Update custom domain configurations"
    name        = "update:custom_domains"
  }
  scopes {
    description = "Update email templates"
    name        = "update:email_templates"
  }
  scopes {
    description = "Update encryption keys"
    name        = "update:encryption_keys"
  }
  scopes {
    description = "Update entity limits"
    name        = "update:limits"
  }
  scopes {
    description = "Update event streams"
    name        = "update:event_streams"
  }
  scopes {
    description = "Update log_streams"
    name        = "update:log_streams"
  }
  scopes {
    description = "Update organization connections"
    name        = "update:organization_connections"
  }
  scopes {
    description = "Update prompts settings"
    name        = "update:prompts"
  }
  scopes {
    description = "Update role members"
    name        = "delete:role_members"
  }
  scopes {
    description = "Update roles"
    name        = "update:roles"
  }
  scopes {
    description = "Update signing keys"
    name        = "update:signing_keys"
  }
}

resource "auth0_resource_server" "auth0_management_api" {
  allow_offline_access                            = false
  consent_policy                                  = jsonencode(null)
  enforce_policies                                = null
  identifier                                      = "https://dev-1utgu7vgaanrc6i1.us.auth0.com/api/v2/"
  name                                            = "Auth0 Management API"
  signing_alg                                     = "RS256"
  signing_secret                                  = null
  skip_consent_for_verifiable_first_party_clients = false
  token_dialect                                   = null
  token_lifetime                                  = 86400
  token_lifetime_for_web                          = 7200
  verification_location                           = null
  authorization_details {
    disable = true
    type    = null
  }
  proof_of_possession {
    disable   = true
    mechanism = null
    required  = false
  }
  subject_type_authorization {
    client {
      policy = "require_client_grant"
    }
    user {
      policy = "allow_all"
    }
  }
  token_encryption {
    disable = true
    format  = null
  }
}

resource "auth0_resource_server" "canbiocin" {
  allow_offline_access                            = false
  consent_policy                                  = jsonencode(null)
  enforce_policies                                = true
  identifier                                      = "canbiocin"
  name                                            = "Canbiocin"
  signing_alg                                     = "RS256"
  signing_secret                                  = null
  skip_consent_for_verifiable_first_party_clients = true
  token_dialect                                   = "access_token_authz"
  token_lifetime                                  = 86400
  token_lifetime_for_web                          = 7200
  verification_location                           = null
  authorization_details {
    disable = true
    type    = null
  }
  proof_of_possession {
    disable   = true
    mechanism = null
    required  = false
  }
  subject_type_authorization {
    client {
      policy = "require_client_grant"
    }
    user {
      policy = "allow_all"
    }
  }
  token_encryption {
    disable = true
    format  = null
  }
}

resource "auth0_resource_server_scopes" "canbiocin" {
  resource_server_identifier = "canbiocin"
  scopes {
    description = "Create saved recipes"
    name        = "save:recipes"
  }
  scopes {
    description = "Delete Ingredients"
    name        = "delete:ingredients"
  }
  scopes {
    description = "Delete recipes"
    name        = "delete:recipes"
  }
  scopes {
    description = "Read Ingredients"
    name        = "read:ingredients"
  }
  scopes {
    description = "Read packaging, etc"
    name        = "read:other"
  }
  scopes {
    description = "Write packaging, etc"
    name        = "write:other"
  }
  scopes {
    description = "Delete packaging, etc"
    name        = "delete:other"
  }
  scopes {
    description = "Read recipes"
    name        = "read:recipes"
  }
  scopes {
    description = "Write recipes"
    name        = "write:recipes"
  }
  scopes {
    description = "write:ingredients"
    name        = "write:ingredients"
  }

  depends_on = [
    auth0_resource_server.canbiocin
  ]
}

resource "auth0_client_grant" "canbiocin" {
  allow_any_organization      = false
  audience                    = "canbiocin"
  client_id                   = auth0_client.canbiocin_test_application.id
  organization_usage          = null
  scopes                      = []
  subject_type                = "client"
  depends_on = [
    auth0_resource_server.canbiocin
  ]
}
