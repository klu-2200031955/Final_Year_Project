terraform {
  backend "s3" {
    bucket         = "inventory-terraform-state.github-actions"
    region         = "us-east-1"
    key            = "s3-github-actions/terraform.tfstate"
    encrypt        = true
  }

  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.40.0"
    }
  }
}
