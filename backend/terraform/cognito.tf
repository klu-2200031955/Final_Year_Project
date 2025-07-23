resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false  # ensure lowercase only
}

resource "aws_cognito_user_pool" "inventory_user_pool" {
  name = "inventory-user-pool"

  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
  }

  auto_verified_attributes = ["email"]
}

resource "aws_cognito_user_pool_client" "inventory_user_pool_client" {
  name                             = "inventory-client"
  user_pool_id                     = aws_cognito_user_pool.inventory_user_pool.id
  generate_secret                  = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows             = ["code"]
  allowed_oauth_scopes           = ["email", "openid", "profile"]
  callback_urls                  = ["http://localhost:3000"]
  logout_urls                    = ["http://localhost:3000"]
  supported_identity_providers   = ["COGNITO"]
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
}

resource "aws_cognito_user_pool_domain" "inventory_domain" {
  domain       = "inventory-auth-${random_string.suffix.result}"
  user_pool_id = aws_cognito_user_pool.inventory_user_pool.id
}
