output "add_item_lambda_arn" {
  value = aws_lambda_function.add_item.arn
}

output "get_items_lambda_arn" {
  value = aws_lambda_function.get_items.arn
}

output "base_url" {
  description = "Base URL for API Gateway"
  value       = aws_api_gateway_rest_api.inventory_api.id
}

output "user_pool_id" {
  value = aws_cognito_user_pool.inventory_user_pool.id
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.inventory_user_pool_client.id
}

output "cognito_domain" {
  value = aws_cognito_user_pool_domain.inventory_domain.domain
}
