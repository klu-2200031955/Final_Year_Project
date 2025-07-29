# backend.tf (new file)
terraform {
  backend "s3" {
    bucket         = "inventory-app-tfstate-12345" # Replace with your unique bucket name
    key            = "terraform.tfstate"
    region         = "us-east-1" # Change to your preferred region
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

# Add this to your existing Terraform configuration (main.tf)
resource "aws_s3_bucket" "terraform_state" {
  bucket = "inventory-app-tfstate-12345" # Must match backend.tf and be globally unique

  lifecycle {
    prevent_destroy = true # Prevent accidental deletion
  }

  tags = {
    Name        = "Terraform State Storage"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_lock" {
  name         = "terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Name = "Terraform Lock Table"
  }
}