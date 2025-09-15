```markdown
# 🛍️ Inventory Management System (Serverless SaaS)

A **lightweight inventory management platform** for small retailers, built on a **fully serverless architecture**.  
It demonstrates **scalability, cost-effectiveness, automated testing, and CI/CD best practices**.

---

## ✨ Features

- **CRUD operations** on inventory items with AWS Lambda + DynamoDB
- **Secure authentication** using Amazon Cognito (email + OTP verification)
- **REST API** with Amazon API Gateway
- **Infrastructure as Code** using Terraform
- **Automated CI/CD** pipelines:
  - Backend deployment & Terraform provisioning
  - Frontend deployment to Netlify
  - Backend destroy workflow for cleanup
- **Unit tests with Jest** + **coverage reporting**
- **Canary deployments** for safe API updates
- **Scheduled pre-warming** of critical Lambda functions to reduce cold starts
- **CloudWatch monitoring** for metrics and logs

---

## 🏛️ Architecture

```

┌────────────┐     ┌─────────────┐
│  Frontend  │───▶│ API Gateway │
└────────────┘     └──────┬──────┘
│
┌────▼────┐
│ Lambda │
└────┬────┘
│
┌─────▼─────┐
│ DynamoDB  │
└───────────┘
│
┌─────▼─────┐
│ Cognito   │  (User Sign-Up / Login / OTP Verification)
└───────────┘

```

---

## 🚀 Tech Stack

| Layer | Technology |
|------|-----------|
| **Frontend** | React + Vite, deployed to **Netlify** |
| **Backend** | **AWS Lambda** (Node.js) |
| **API** | **Amazon API Gateway** |
| **Auth** | **Amazon Cognito** (email verification + JWT) |
| **Database** | **Amazon DynamoDB** |
| **Monitoring** | **CloudWatch** + X-Ray |
| **IaC** | **Terraform** |
| **CI/CD** | **GitHub Actions** |
| **Testing** | **Jest** with coverage gates |

---

## 🧩 Folder Structure

```

.
├── backend
│   ├── functions          # Lambda source code (CRUD handlers)
│   ├── tests              # Jest unit tests
│   └── terraform          # Terraform IaC (API Gateway, Lambda, DynamoDB, Cognito)
├── frontend               # React + Vite frontend
└── .github/workflows      # GitHub Actions CI/CD pipelines

````

---

## ⚡ Setup & Deployment

### 1️⃣ Prerequisites
- **AWS Account** with programmatic credentials
- **Terraform** ≥ 1.6.6
- **Node.js** ≥ 18
- **Netlify Account** + site created

---

### 2️⃣ Backend Deployment (Terraform)

```bash
cd backend/terraform
terraform init
terraform apply -auto-approve
````

This will create:

* DynamoDB Table
* Lambda Functions
* API Gateway Endpoints
* Cognito User Pool & App Client

The Terraform output will display:

* `base_url` → API Gateway URL
* `user_pool_id`
* `user_pool_client_id`

---

### 3️⃣ Frontend

Create a `.env` file inside `frontend/`:

```
VITE_BASE_URL=<base_url_from_terraform>
VITE_USER_POOL_ID=<user_pool_id_from_terraform>
VITE_CLIENT_ID=<user_pool_client_id_from_terraform>
```

Then:

```bash
cd frontend
npm install
npm run dev   # local development
```

For production deployment the GitHub Actions workflow automatically deploys to Netlify after backend provisioning.

---

## 🔐 User Authentication Flow

1. User signs up on the frontend with email + password.
2. Cognito sends an **OTP verification code** to the email.
3. After successful OTP verification, the user can log in.
4. The frontend attaches the **JWT token** from Cognito to every API call.
5. API Gateway verifies the token and passes the claims to Lambda.

---

## 🧪 Testing

Run unit tests with coverage:

```bash
cd backend
npm install
npm test
```

The pipeline enforces minimum coverage via `--coverageThreshold` to keep code quality high.

---

## 🕐 Canary Deployment

API updates are released using **API Gateway Canary Deployments**:

* Gradually shift traffic to the new version.
* Automatic rollback if errors exceed threshold.

---

## 🔎 Monitoring & Logging

* **CloudWatch Dashboards** track Lambda duration, error rate, and DynamoDB throughput.
* **CloudWatch Alarms** notify via SNS on error spikes.
* **X-Ray Tracing** enabled for end-to-end request tracing.

---

## 🧹 Tear Down (Cleanup)

To destroy all backend resources:

```bash
cd backend/terraform
terraform destroy -auto-approve
```

or trigger the **`Terraform Cleanup`** workflow (`backend-destroy.yml`) manually from GitHub Actions.

---

## 📈 Future Enhancements

* Multi-tenant SaaS model (tenant isolation).
* MFA & advanced security hardening.
* Real-time dashboards with WebSockets or AppSync.
* Usage-based pricing tiers.

---

## 👨‍💻 Author

**Samudrala Venkata Pavan Tarun Kumar**

* [GitHub](https://github.com/klu-2200031955)
* [LinkedIn](https://www.linkedin.com/in/samudrala-venkata-pavan-tarun-kumar-032242255)

---

### ⭐ If you find this project helpful, give it a star!

```

---

**Tips to customise before publishing:**
* Add a screenshot or animated GIF of your frontend dashboard under a `## 🎨 UI Preview` section.
* Replace `<base_url_from_terraform>` placeholders with a sample value if you want a ready-to-run demo.
* You can generate the architecture diagram with [Mermaid](https://mermaid.js.org/) or Excalidraw and embed it with `![Architecture](docs/architecture.png)`.

This README highlights all the work you’ve completed (CRUD, CI/CD, canary, testing, etc.) and shows strong production-readiness for recruiters or portfolio viewers.
```
