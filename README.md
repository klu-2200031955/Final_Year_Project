# Inventory Management System (Serverless SaaS)

A lightweight **Inventory Management Platform** for small retailers using a fully **Serverless Architecture**.
This project showcases scalable, cost-effective solutions with **Terraform IaC**, **CI/CD automation**, and **test coverage with Jest**.

## Features
- CRUD operations for inventory management using AWS Lambda
- Secure authentication via AWS Cognito
- Serverless API powered by AWS API Gateway
- NoSQL Database using Amazon DynamoDB
- CI/CD pipeline with GitHub Actions for automated deployment and testing
- Jest test coverage integrated into CI/CD workflow
- Canary deployment for safe API updates
- Scheduled pre-warming to reduce cold starts
- Infrastructure as Code (IaC) using Terraform

## Architecture
[Frontend] → [API Gateway] → [AWS Lambda] → [DynamoDB]
                         ↳ [AWS Cognito] (Authentication)

## Tech Stack
- AWS Lambda: Business logic
- Amazon DynamoDB: Inventory records storage
- Amazon Cognito: User authentication
- API Gateway: HTTP endpoint
- CloudWatch: Monitoring & logging
- Terraform: Infrastructure as Code
- GitHub Actions: CI/CD automation
- Jest: Unit & integration testing

## Project Structure
inventory-management-system/
├─ frontend/
├─ backend/
│   ├─ tests/
│   ├─ src/
├─ terraform/
└─ .github/workflows/

## Setup & Deployment
1. Prerequisites: AWS CLI, Terraform v1.6+, Node.js, npm
2. Clone repo: git clone https://github.com/<your-username>/inventory-management-system.git
3. Deploy infrastructure:
   cd terraform && terraform init && terraform plan && terraform apply -auto-approve
4. Deploy backend Lambda:
   cd backend && npm install && npm run build
5. Run tests: npm run test -- --coverage

## CI/CD Workflow
- Push to main triggers Jest tests, Terraform apply, Lambda deployment, and canary deployment.

## Authentication
- Users register/login using AWS Cognito with built-in email OTP verification.

## Canary Deployment
- API Gateway is configured with canary release to safely test new Lambda versions.

## Cold Start Optimization
- Lambda functions are pre-warmed using a scheduled CloudWatch event to reduce cold start latency.

## Monitoring
- CloudWatch Logs and Metrics for monitoring and performance tracking.

## License
MIT License.
