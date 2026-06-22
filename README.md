# ☁️ AI-Powered Customer Feedback System
### Built on AWS · Fully Serverless · Zero Servers to Manage

<div align="center">

![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)
![S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![API Gateway](https://img.shields.io/badge/API_Gateway-FF4F8B?style=for-the-badge&logo=amazonapigateway&logoColor=white)

**[🌐 Live Demo](#)** · **[📊 Admin Dashboard](#)** · **[📖 Lab Guide](#)**

![Project Banner](https://img.shields.io/badge/Capstone-Bootcamp_Week_4-00B4D8?style=for-the-badge)
![Free Tier](https://img.shields.io/badge/AWS_Free_Tier-✓_Compatible-22C97A?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-22C97A?style=for-the-badge)

</div>

---

## 📌 Overview

A production-grade, fully serverless customer feedback collection and AI analysis platform — built as the Week 4 capstone project for the **CloudWithShad AWS Bootcamp**. Customers submit feedback through a redesigned public web form; every submission is automatically analyzed for **sentiment** and **named entities** by Amazon Comprehend, then stored in DynamoDB. A password-protected admin dashboard renders all the data live with interactive charts and a real-time submission feed.

> **No EC2. No containers. No web servers. Runs entirely within the AWS Free Tier.**

---

## 🏗️ Architecture

```
┌─────────────────┐     POST /feedback      ┌──────────────────────┐
│                 │ ──────────────────────► │                      │
│  Feedback Form  │                         │   API Gateway (REST)  │
│   (S3 Static)   │ ◄────────────────────── │   prod stage         │
│                 │     JSON response        │                      │
└─────────────────┘                         └──────────┬───────────┘
                                                       │
                                          Lambda Proxy Integration
                                                       │
                                                       ▼
                                            ┌──────────────────────┐
                                            │   submitFeedback     │
                                            │   Lambda (Py 3.12)   │
                                            └──────┬───────────────┘
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │                             │
                                    ▼                             ▼
                        ┌───────────────────┐        ┌───────────────────┐
                        │  Amazon           │        │  Amazon           │
                        │  Comprehend       │        │  DynamoDB         │
                        │                   │        │                   │
                        │  • Sentiment      │        │  cloudwithshad    │
                        │  • Entities       │        │  -feedback table  │
                        └───────────────────┘        └───────────────────┘

┌─────────────────┐     GET /feedback       ┌──────────────────────┐
│                 │ ──────────────────────► │                      │
│ Admin Dashboard │                         │   API Gateway (REST)  │
│  (S3 Static)    │ ◄────────────────────── │                      │
│  + SHA-256 Auth │     Aggregated JSON      └──────────┬───────────┘
└─────────────────┘                                    │
                                                       ▼
                                            ┌──────────────────────┐
                                            │  getDashboardData    │
                                            │  Lambda (Py 3.12)    │
                                            │                      │
                                            │  • Scan DynamoDB     │
                                            │  • Aggregate stats   │
                                            │  • Top entities      │
                                            └──────────────────────┘
```

---

## ✨ Features

### 📝 Public Feedback Form
- Professional two-panel layout with animated dark background (CSS orbs + grid)
- 5-point interactive rating buttons with active state toggle
- Feedback type dropdown — General / Bug / Feature / Support / Billing
- Real-time status banner (green ✓ success / red ✗ error) after submission
- Fully responsive — works on mobile and desktop
- Zero dependencies — single HTML file, no npm, no build step

### 📊 Admin Dashboard
- **SHA-256 password-protected login** — works on both S3 HTTP and CloudFront HTTPS
- **4 live KPI cards** — total responses, positive %, avg rating, latest submission
- **Sentiment donut chart** — pure Canvas API, no chart library required
- **Rating breakdown** — animated 5★ → 1★ horizontal bars
- **Feedback type breakdown** — counts per category from DynamoDB
- **Top entity bar chart** — top 10 topics Comprehend extracted, animated bars
- **Recent submissions feed** — last 10 rows with avatar initials, sentiment pill, rating badge
- **Auto-refresh every 60 seconds** — always live without manual reload

### 🧠 AI / NLP Pipeline
- **Sentiment analysis** — POSITIVE / NEGATIVE / NEUTRAL / MIXED with confidence score
- **Named entity extraction** — automatically surfaces people, places, products, organisations
- Both powered by **Amazon Comprehend** — no ML model to train or maintain

---

## 🛠️ Tech Stack

| Layer | Service | Purpose |
|---|---|---|
| **Frontend** | Amazon S3 | Static website hosting for both HTML pages |
| **API** | Amazon API Gateway (REST) | `POST /feedback` · `GET /feedback` |
| **Compute** | AWS Lambda × 2 | Python 3.12 — submit handler + dashboard handler |
| **AI / NLP** | Amazon Comprehend | Sentiment analysis + entity extraction |
| **Database** | Amazon DynamoDB | On-demand NoSQL — zero provisioning |
| **Security** | AWS IAM | Scoped execution role for both Lambda functions |
| **Monitoring** | Amazon CloudWatch | Auto-enabled Lambda invocation logs |
| **CDN (optional)** | Amazon CloudFront | HTTPS + custom domain + edge caching |

---

## 📁 Project Structure

```
cloudwithyasapp-feedback/
│
├── frontend/
│   ├── feedback-form.html        # Public customer-facing form
│   └── admin-dashboard.html      # Password-protected admin view
│
├── lambda/
│   ├── submitFeedback/
│   │   └── lambda_function.py    # POST handler — validation + Comprehend + DynamoDB
│   └── getDashboardData/
│       └── lambda_function.py    # GET handler — scan + aggregate + return JSON
│
├── docs/
│   └── architecture.png          # Architecture diagram
│
└── README.md
```

---

## 🚀 Deployment Guide

### Prerequisites
- An AWS account (Free Tier is sufficient)
- AWS Console access (no CLI required)

### Phase 1 — DynamoDB

1. AWS Console → **DynamoDB** → **Create table**
2. Table name: `cloudwithshad-feedback`
3. Partition key: `feedback_id` (String)
4. Settings: Default (on-demand capacity) → **Create table**

### Phase 2 — IAM Role

1. **IAM** → **Roles** → **Create role** → AWS service → Lambda
2. Attach policies:
   - `AmazonDynamoDBFullAccess`
   - `ComprehendFullAccess`
   - `AWSLambdaBasicExecutionRole`
3. Role name: `lambda-feedback-role` → **Create role**

### Phase 3 — Lambda Functions

**Function 1 — submitFeedback**
```
Runtime : Python 3.12
Role    : lambda-feedback-role
Timeout : 30 seconds  ← important for Comprehend latency
```
Paste `lambda/submitFeedback/lambda_function.py` into the code editor → **Deploy**

**Function 2 — getDashboardData**
```
Runtime : Python 3.12
Role    : lambda-feedback-role
```
Paste `lambda/getDashboardData/lambda_function.py` into the code editor → **Deploy**

### Phase 4 — API Gateway (REST API)

```
API type  : REST API (not HTTP API)
Name      : FeedbackAPI
Stage     : prod
```

| Resource | Method | Integration | CORS |
|---|---|---|---|
| `/feedback` | `POST` | Lambda Proxy → `submitFeedback` | ✅ Enabled |
| `/feedback` | `GET` | Lambda Proxy → `getDashboardData` | ✅ Enabled |

After deploying, copy the **Invoke URL**:
```
https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod
```

### Phase 5 — Update the HTML files

In `feedback-form.html`:
```javascript
const API_URL = 'https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod/feedback';
```

In `admin-dashboard.html`:
```javascript
const API_BASE = 'https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod';
```

### Phase 6 — S3 Static Hosting

1. Create an S3 bucket (e.g. `cloudwithyasapp-feedback`) — unblock public access
2. **Properties** → Static website hosting → Enable → Index: `feedback-form.html`
3. **Permissions** → Bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
  }]
}
```

4. Upload both HTML files → your site is live at the bucket website endpoint

---

## 🗄️ DynamoDB Schema

| Attribute | Type | Description |
|---|---|---|
| `feedback_id` | String (PK) | UUID generated by Lambda |
| `name` | String | Submitter's full name |
| `email` | String | Submitter's email address |
| `company` | String | Company name (optional) |
| `type` | String | Feedback category |
| `rating` | String | 1–5 star rating |
| `message` | String | Feedback message (max 5,000 chars) |
| `sentiment` | String | POSITIVE / NEGATIVE / NEUTRAL / MIXED |
| `sentiment_score` | String | Comprehend confidence score (0–1) |
| `entities` | List | Top 10 named entities detected |
| `submitted_at` | String | ISO 8601 UTC timestamp |

---

## 💰 AWS Free Tier Cost Breakdown

| Service | Free Allowance | Duration | Estimated Usage |
|---|---|---|---|
| Lambda | 1M requests + 400K GB-sec/month | Indefinite | < 1,000 calls/month |
| DynamoDB | 25 GB + 25 WCU + 25 RCU/month | Indefinite | < 1 GB |
| API Gateway | 1M calls/month | 12 months | < 10,000 calls/month |
| Comprehend | 50,000 units/month | 12 months | 2 units per submission |
| S3 | 5 GB + 20K GET requests/month | 12 months | < 10 MB |
| CloudWatch | 5 GB ingestion + storage/month | 12 months | Lambda logs only |

> 💡 **Estimated monthly cost at portfolio scale: $0.00**

---

## 🔐 Security Notes

The admin dashboard uses **SHA-256 password hashing** with a pre-computed hash embedded at build time. This solves a specific browser security constraint:

> `crypto.subtle` (Web Crypto API) is **only available on HTTPS or localhost**. S3 bucket URLs use plain HTTP — so the native API is blocked. This project includes a **pure-JS SHA-256 fallback** that works on HTTP (S3), HTTPS (CloudFront), and localhost equally.

### Production hardening checklist

- [ ] Replace `*` CORS origin with your specific S3/CloudFront domain
- [ ] Scope IAM policies from FullAccess down to specific resource ARNs
- [ ] Add Cognito User Pool for proper multi-user authentication
- [ ] Enable DynamoDB point-in-time recovery
- [ ] Set Lambda reserved concurrency to prevent runaway Comprehend spend
- [ ] Configure CloudFront + ACM for HTTPS on a custom domain

---

## 🐛 Known Issues & Fixes Applied

### Login fails silently on S3 HTTP URL
**Cause:** `crypto.subtle` is `undefined` on plain HTTP  
**Fix:** Pre-computed SHA-256 hash constant + pure-JS SHA-256 fallback function

### CloudFront returns `AccessDenied`
**Cause:** Missing default root object + S3 blocking direct object access  
**Fix:**
1. CloudFront → General → Default root object: `admin-dashboard.html`
2. Error pages → Create custom error response: `403` → `/admin-dashboard.html` → `200`
3. Origins → Switch to Origin Access Control (OAC) → update bucket policy

### Dashboard loads but API returns no data
**Cause:** `loadData()` was calling wrong endpoint (`/dashboard` instead of `/feedback`)  
**Fix:** Corrected fetch URL to match the deployed API Gateway route

---

## 🔭 Future Enhancements

- [ ] **SNS Email Alerts** — trigger on every NEGATIVE sentiment submission
- [ ] **Multi-language support** — Comprehend language detection + Translate before analysis
- [ ] **Cognito authentication** — replace SHA-256 login with proper user pool
- [ ] **CloudFront + Route 53** — HTTPS on a custom domain with global edge caching
- [ ] **GitHub Actions CI/CD** — auto-deploy HTML to S3 on every push to `main`
- [ ] **AWS CDK / Terraform** — full infrastructure as code, one-command deploys
- [ ] **Amazon Athena** — SQL analytics over exported DynamoDB data in S3
- [ ] **Amazon QuickSight** — managed BI dashboard with advanced visualisations

---

## 📸 Screenshots

| Feedback Form | Admin Dashboard |
|:---:|:---:|
| *(Add screenshot)* | *(Add screenshot)* |

| Login Page | Sentiment Charts |
|:---:|:---:|
| *(Add screenshot)* | *(Add screenshot)* |

> 💡 **Tip:** Take screenshots and drag them into the GitHub issue editor to get a URL, then paste them here.

---

## 📚 Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon Comprehend Developer Guide](https://docs.aws.amazon.com/comprehend/)
- [Amazon DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway REST API Reference](https://docs.aws.amazon.com/apigateway/)
- [CloudWithShad Bootcamp](https://cloudwithshad.github.io)

---

## 👤 Author

**Yasir** — CloudWithYasApp  
Built as part of the **CloudWithShad AWS Bootcamp · Week 4 Capstone · May 2026**

[![LinkedIn](www.linkedin.com/in/yasir-abdul-rahaman-07a656178)](#)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](#)

---


---

<div align="center">

**⭐ If this project helped you, please give it a star!**

*Built with ☁️ on AWS · Powered by Amazon Comprehend AI*

</div>
