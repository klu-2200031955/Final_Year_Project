resource "aws_s3_bucket" "terraform_state" {
  bucket = "inventory-terraform-state-bucket"
  force_destroy = true
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "terraform-lock-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
