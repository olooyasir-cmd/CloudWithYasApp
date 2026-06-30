<div align="center">

<img src="https://img.shields.io/badge/☁️-CloudWithYasApp-00B4D8?style=for-the-badge&labelColor=050f1f" alt="CloudWithYasApp"/>

# AI-Powered Customer Feedback System

**A production-grade, fully serverless cloud application built on AWS**

[![AWS](https://img.shields.io/badge/Amazon_AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda)
[![DynamoDB](https://img.shields.io/badge/DynamoDB-4053D6?style=for-the-badge&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb)
[![S3](https://img.shields.io/badge/Amazon_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

<br/>

[![Live Status](https://img.shields.io/badge/Status-Live-22C97A?style=for-the-badge&logo=statuspage&logoColor=white)](#)
[![Free Tier](https://img.shields.io/badge/AWS_Free_Tier-Compatible-22C97A?style=for-the-badge&logo=amazonaws&logoColor=white)](#)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](#)
[![Bootcamp](https://img.shields.io/badge/CloudWithShad-Week_4_Capstone-00B4D8?style=for-the-badge)](#)

<br/>

[🌐 Live Feedback Form](#) &nbsp;·&nbsp; [📊 Admin Dashboard](#) &nbsp;·&nbsp; [📖 Lab Guide](#) &nbsp;·&nbsp; [🚀 Deploy Guide](#deployment-guide)

<br/>

> *No EC2. No containers. No web servers.*
> *Runs entirely within the AWS Free Tier — estimated monthly cost: **$0.00***

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Deployment Guide](#-deployment-guide)
- [CI/CD Pipeline](#-cicd-pipeline)
- [DynamoDB Schema](#-dynamodb-schema)
- [Lambda Functions](#-lambda-functions)
- [Free Tier Breakdown](#-free-tier-breakdown)
- [Security](#-security)
- [Bugs Fixed](#-bugs-fixed)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 📌 Overview

A **fully serverless, AI-powered customer feedback platform** built as the Week 4 Capstone of the [CloudWithShad AWS Bootcamp](https://cloudwithshad.github.io). Customers submit feedback through a professional public-facing web form. Every submission is automatically analyzed by **Amazon Comprehend** for sentiment and named entities, stored in **DynamoDB**, and surfaced on a **password-protected admin dashboard** with live charts and a real-time submission feed.

The entire system — frontend, backend, AI pipeline, database, and CI/CD — was built and deployed without a single server, container, or framework.

```
Customer fills form  →  API Gateway  →  Lambda  →  Comprehend  →  DynamoDB
                                                                       ↓
Admin opens dashboard  ←  S3 Static Site  ←  Lambda  ←  API Gateway  ←┘
```

---

## 🌐 Live Demo

| Page | URL | Access |
|---|---|---|
| 📝 Feedback Form | [Open form](#) | Public — anyone can submit |
| 📊 Admin Dashboard | [Open dashboard](#) | Protected — SHA-256 login required |
| 📖 Lab Guide | [Open guide](#) | Public — full bootcamp walkthrough |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CUSTOMER FLOW                              │
│                                                                     │
│  ┌──────────────┐   POST /feedback   ┌─────────────────────────┐   │
│  │              │ ─────────────────► │                         │   │
│  │  Feedback    │                    │   API Gateway (REST)     │   │
│  │  Form        │ ◄───────────────── │   /prod stage           │   │
│  │  (S3)        │   200 + sentiment  │                         │   │
│  └──────────────┘                    └───────────┬─────────────┘   │
│                                                  │ Lambda Proxy    │
│                                                  ▼                 │
│                                     ┌────────────────────────┐     │
│                                     │   submitFeedback       │     │
│                                     │   Lambda · Python 3.12 │     │
│                                     └──────┬────────┬────────┘     │
│                                            │        │              │
│                                            ▼        ▼              │
│                              ┌─────────────────┐  ┌─────────────┐ │
│                              │ Amazon          │  │ Amazon      │ │
│                              │ Comprehend      │  │ DynamoDB    │ │
│                              │ · Sentiment     │  │ · feedback  │ │
│                              │ · Entities      │  │   table     │ │
│                              └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           ADMIN FLOW                                │
│                                                                     │
│  ┌──────────────┐   GET /feedback    ┌─────────────────────────┐   │
│  │              │ ─────────────────► │                         │   │
│  │  Admin       │                    │   API Gateway (REST)     │   │
│  │  Dashboard   │ ◄───────────────── │   /prod stage           │   │
│  │  (S3 + Auth) │   aggregated JSON  │                         │   │
│  └──────────────┘                    └───────────┬─────────────┘   │
│                                                  │ Lambda Proxy    │
│                                                  ▼                 │
│                                     ┌────────────────────────┐     │
│                                     │   getDashboardData     │     │
│                                     │   Lambda · Python 3.12 │     │
│                                     │   · Scan DynamoDB      │     │
│                                     │   · Aggregate stats    │     │
│                                     │   · Top entities       │     │
│                                     └────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE                              │
│                                                                     │
│   Git Push → GitHub Actions → S3 Upload + CloudFront Invalidate    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 📝 Public Feedback Form
- Professional **two-panel dark UI** — brand panel left, form right
- **Animated background** — CSS blur orbs + grid texture
- **5-point interactive rating** buttons with active state toggle
- **Feedback type dropdown** — General / Bug / Feature / Support / Billing
- **Real-time status banner** — green ✓ success / red ✗ error after submit
- **Admin Dashboard link** button — direct navigation from form to dashboard
- Zero dependencies — single HTML file + external CSS + external JS
- Fully responsive — works on mobile and desktop

### 📊 Admin Dashboard
- **SHA-256 protected login** — works on S3 HTTP and CloudFront HTTPS
- Password show/hide toggle with eye icon
- Shake animation + descriptive error on wrong credentials
- Auto-restores session on page refresh via `sessionStorage`
- **4 live KPI stat cards** — total responses, positive %, avg rating, latest submission
- **Sentiment donut chart** — pure Canvas API, zero chart libraries
- **Rating breakdown** — animated 5★ → 1★ horizontal bars
- **Feedback type breakdown** — category counts from DynamoDB
- **Top entity bar chart** — top 10 Comprehend-extracted topics, animated
- **Recent submissions feed** — last 10 rows with avatar initials, sentiment pill, rating, message preview
- **Auto-refresh every 60 seconds** — stays live without manual reload
- Sign out button clears session and returns to login

### 🧠 AI Pipeline (Amazon Comprehend)
- **Sentiment analysis** — POSITIVE / NEGATIVE / NEUTRAL / MIXED + confidence score
- **Named entity extraction** — people, places, products, organisations
- Runs on every single submission automatically — no ML model to train

### 🚀 CI/CD Pipeline (GitHub Actions)
- Deploys to S3 on every push to `main`
- Separate cache headers per file type (HTML no-cache, CSS/JS 1hr, assets 7 days)
- CloudFront invalidation step (instant global update)
- Commits and syncs changes back to GitHub
- Manual trigger option from GitHub Actions UI
- Final deploy report with pass/fail per job

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5 · CSS3 · Vanilla JS | Public form + admin dashboard — no frameworks |
| **Hosting** | Amazon S3 | Static website hosting for both pages |
| **CDN** | Amazon CloudFront *(optional)* | HTTPS + global edge caching |
| **API** | Amazon API Gateway (REST) | `POST /feedback` · `GET /feedback` |
| **Compute** | AWS Lambda × 2 | Python 3.12 — submit handler + dashboard handler |
| **AI / NLP** | Amazon Comprehend | Sentiment analysis + named entity extraction |
| **Database** | Amazon DynamoDB | On-demand NoSQL — 11 fields per item |
| **Auth** | SHA-256 hashing | Pre-computed hash + pure-JS fallback for HTTP |
| **Security** | AWS IAM | Least-privilege execution role for both functions |
| **Monitoring** | Amazon CloudWatch | Auto-enabled Lambda invocation logs |
| **CI/CD** | GitHub Actions | Auto-deploy to S3 + CloudFront on push to main |

---

## 📁 Project Structure

```
cloudwithyasapp/
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline — S3 deploy + GitHub sync
│
├── frontend/
│   ├── feedback-form.html          # Public feedback form — HTML structure only
│   ├── feedback-form.css           # Form styles — layout, inputs, background
│   ├── feedback-form.js            # Form logic — submit handler, rating buttons
│   │
│   ├── admin-dashboard.html        # Admin dashboard — HTML structure only
│   ├── admin-dashboard.css         # Dashboard styles — login + all panels
│   └── admin-dashboard.js          # Dashboard logic — login, charts, data fetch
│
├── lambda/
│   ├── submitFeedback/
│   │   └── lambda_function.py      # POST — validate, Comprehend, DynamoDB write
│   └── getDashboardData/
│       └── lambda_function.py      # GET — scan, aggregate, return JSON
│
├── docs/
│   └── architecture.png            # Architecture diagram
│
└── README.md
```

> **Note:** The frontend is separated into individual HTML, CSS, and JS files per page for clean maintainability. All 6 files must be uploaded to the same S3 bucket folder for relative links to resolve.

---

## 🚀 Deployment Guide

### Prerequisites
- AWS account (Free Tier is sufficient)
- GitHub account
- Git Bash or any terminal

---

### Phase 1 — DynamoDB

```
AWS Console → DynamoDB → Create table
  Table name    : cloudwithshad-feedback
  Partition key : feedback_id (String)
  Settings      : Default (on-demand capacity)
→ Create table → wait for Status: Active
```

---

### Phase 2 — IAM Role

```
IAM → Roles → Create role → AWS service → Lambda
  Attach policies:
    ✓ AmazonDynamoDBFullAccess
    ✓ ComprehendFullAccess
    ✓ AWSLambdaBasicExecutionRole
  Role name: lambda-feedback-role
→ Create role
```

---

### Phase 3 — Lambda Functions

**Function 1: `submitFeedback`**

```
Lambda → Create function → Author from scratch
  Runtime     : Python 3.12
  Role        : lambda-feedback-role
  Timeout     : 30 seconds  ← required for Comprehend latency
→ Paste lambda/submitFeedback/lambda_function.py → Deploy
```

**Function 2: `getDashboardData`**

```
Lambda → Create function → Author from scratch
  Runtime : Python 3.12
  Role    : lambda-feedback-role
→ Paste lambda/getDashboardData/lambda_function.py → Deploy
```

---

### Phase 4 — API Gateway (REST API)

```
API Gateway → Create API → REST API → Build
  Name           : FeedbackAPI
  Endpoint type  : Regional

Resources to create:
  /feedback  →  POST  →  Lambda Proxy → submitFeedback  →  Enable CORS
  /feedback  →  GET   →  Lambda Proxy → getDashboardData → Enable CORS

Actions → Deploy API → Stage: prod
→ Copy the Invoke URL
```

---

### Phase 5 — Update HTML files

In `frontend/feedback-form.js`:
```javascript
const API_URL = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/feedback';
```

In `frontend/admin-dashboard.js`:
```javascript
const API_BASE = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod';
```

---

### Phase 6 — S3 Static Hosting

```
S3 → Create bucket
  Name         : cloudwithyasapp-feedback
  Region       : us-east-1
  Public access: Unblocked

Properties → Static website hosting → Enable
  Index document: feedback-form.html

Permissions → Bucket policy:
```

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect":    "Allow",
    "Principal": "*",
    "Action":    "s3:GetObject",
    "Resource":  "arn:aws:s3:::cloudwithyasapp-feedback/*"
  }]
}
```

```
Upload all 6 frontend files → go live at the bucket website endpoint
```

---

### Phase 7 — GitHub Actions CI/CD

**7a. Create the workflow folder using Git Bash:**

```bash
# Navigate to your project folder
cd /c/Users/Yasir/Documents/cloudwithyasapp

# Create the GitHub Actions folder structure
mkdir -p .github/workflows

# Create the deploy file
touch .github/workflows/deploy.yml

# Open it and paste the deploy.yml content
notepad .github/workflows/deploy.yml
```

**7b. Create an IAM user for GitHub Actions and attach this policy:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cloudwithyasapp-feedback",
        "arn:aws:s3:::cloudwithyasapp-feedback/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "*"
    }
  ]
}
```

> ⚠️ Note: `s3:PutObjectAcl` is **not** required and should be omitted if your bucket uses "Bucket owner enforced" Object Ownership (the modern default) — ACLs are disabled on such buckets and including this permission has no effect.

**7c. Add GitHub Secrets:**

```
GitHub repo → Settings → Secrets and variables → Actions → New repository secret
```

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | Your IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user secret key |
| `AWS_REGION` | `us-east-1` |
| `S3_BUCKET_NAME` | `cloudwithyasapp-feedback` |
| `CLOUDFRONT_DIST_ID` | Your CloudFront ID *(optional)* |

**7d. Push to GitHub:**

```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/cloudwithyasapp.git
git add .
git commit -m "🚀 Initial deploy — CloudWithYasApp capstone"
git branch -M main
git push -u origin main
```

GitHub Actions will automatically deploy to S3 on every push. ✅

---

## 🔄 CI/CD Pipeline

> ✅ **Status: Live and tested** — this pipeline has been deployed and verified working end-to-end on this repository.

```yaml
# Triggers on every push to main, or manually from GitHub Actions UI
on:
  push:
    branches: [main]
  workflow_dispatch:
```

The pipeline runs **3 jobs** in order:

```
📦 Upload to S3
   ├── Verify bucket access
   ├── Upload HTML  (no-cache headers)
   ├── Upload CSS   (1hr cache)
   ├── Upload JS    (1hr cache)
   ├── Upload assets (7 day cache)
   ├── List deployed files
   └── Invalidate CloudFront (non-blocking — won't fail the deploy if skipped)
         ↓ (on success)
📤 Sync to GitHub
   ├── Check for uncommitted changes
   ├── Stage + commit with timestamp
   └── Push to main
         ↓ (always)
✅ Deployment Summary
   └── Print pass/fail report for all jobs
```

**Every future deploy — 3 commands:**

```bash
git add .
git commit -m "Update feedback form copy"
git push
```

> 💡 **Note on S3 permissions:** This pipeline does **not** use `--acl public-read` on uploaded objects, since modern S3 buckets default to "Bucket owner enforced" Object Ownership, which disables ACLs. Public read access is granted entirely through the bucket policy (see [Phase 6](#phase-6--s3-static-hosting)).

---

## 🗄️ DynamoDB Schema

| Attribute | Type | Notes |
|---|---|---|
| `feedback_id` | String · **PK** | UUID generated by Lambda — guarantees uniqueness |
| `name` | String | Submitter full name |
| `email` | String | Submitter email address |
| `company` | String | Company name (optional) |
| `type` | String | General / Bug / Feature / Support / Billing |
| `rating` | String | 1 – 5 star selection |
| `message` | String | Feedback text (max 5,000 chars — Comprehend limit) |
| `sentiment` | String | POSITIVE / NEGATIVE / NEUTRAL / MIXED |
| `sentiment_score` | String | Comprehend confidence score (0.0 – 1.0) |
| `entities` | List | Top 10 named entities extracted by Comprehend |
| `submitted_at` | String | ISO 8601 UTC timestamp |

---

## ⚡ Lambda Functions

### `submitFeedback` — POST handler

```python
# Flow:
# 1. Handle CORS OPTIONS preflight
# 2. Parse + validate request body
# 3. Call Comprehend detect_sentiment()
# 4. Call Comprehend detect_entities()
# 5. Write full record to DynamoDB with uuid4() key
# 6. Return 200 with sentiment in response body

# Key design decisions:
# - boto3 clients initialised outside handler (warm reuse)
# - message truncated to 5000 chars (Comprehend hard limit)
# - CORS dict included on every return, including 400/500 errors
# - Timeout set to 30s (Comprehend adds ~2-3s latency)
```

### `getDashboardData` — GET handler

```python
# Flow:
# 1. Handle CORS OPTIONS preflight
# 2. table.scan() with pagination (handles >1MB tables)
# 3. Counter() for sentiment breakdown
# 4. Counter() for entity frequency → most_common(10)
# 5. Sort by submitted_at → slice [:10] for recent feed
# 6. Return aggregate JSON with DecimalEncoder

# Key design decisions:
# - Pagination loop handles tables beyond 1MB
# - DecimalEncoder converts DynamoDB Decimal → float for JSON
# - Counter().most_common(10) surfaces top entity topics
```

---

## 💰 Free Tier Breakdown

| Service | Free Allowance | Duration | This Project |
|---|---|---|---|
| Lambda | 1M requests + 400K GB-sec/month | Indefinite ♾️ | < 1,000 calls/month |
| DynamoDB | 25 GB + 25 WCU + 25 RCU/month | Indefinite ♾️ | < 1 GB storage |
| API Gateway (REST) | 1M API calls/month | 12 months | < 10,000 calls/month |
| Amazon Comprehend | 50,000 units/month | 12 months | 2 units per submission |
| Amazon S3 | 5 GB + 20K GET requests/month | 12 months | < 10 MB |
| CloudWatch Logs | 5 GB ingestion + storage/month | 12 months | Lambda logs only |
| IAM | Always free | Indefinite ♾️ | Management plane only |
| GitHub Actions | 2,000 minutes/month (free tier) | Indefinite ♾️ | ~1 min per deploy |

> 💡 **Tip:** Set a `$1` AWS Budget Alert — AWS Console → Billing → Budgets → Create budget. This project should cost $0 but the alert catches anything unexpected.

---

## 🔐 Security

### SHA-256 Login (HTTP + HTTPS compatible)

The admin dashboard login uses a **pre-computed SHA-256 hash** rather than hashing at runtime. This solves a critical browser security constraint:

> `crypto.subtle` (Web Crypto API) is **only available on HTTPS or localhost**.
> S3 bucket URLs use plain HTTP — so `crypto.subtle` is `undefined` and login fails silently.

**Solution implemented:**
1. Password hash pre-computed offline → embedded as a constant
2. Pure-JS SHA-256 fallback function for HTTP environments
3. Native `crypto.subtle` used when available (HTTPS / CloudFront)

```javascript
// Works on S3 HTTP, CloudFront HTTPS, and localhost equally
async function hashText(text) {
  if (window.crypto && window.crypto.subtle) {
    // Native — HTTPS / CloudFront
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2,'0')).join('');
  }
  // Fallback — plain HTTP (S3 bucket URL)
  return sha256Fallback(text);
}
```

### Production Hardening Checklist

- [ ] Replace `*` CORS origin with your specific S3 / CloudFront domain
- [ ] Scope IAM policies from FullAccess to specific resource ARNs
- [ ] Add Amazon Cognito User Pool for proper multi-user authentication
- [ ] Enable DynamoDB Point-in-Time Recovery (PITR)
- [ ] Set Lambda reserved concurrency to cap Comprehend spend
- [ ] Use CloudFront + ACM for HTTPS on a custom domain
- [ ] Enable S3 access logging for audit trail
- [ ] Add AWS WAF to API Gateway for rate limiting

---

## 🐛 Bugs Fixed

### Bug 1 — Login silently fails on S3 HTTP URL

| | Detail |
|---|---|
| **Symptom** | Login keeps spinning then stops — never enters dashboard |
| **Root cause** | `crypto.subtle` is `undefined` on plain HTTP — `PHASH` never gets set — comparison always fails |
| **Fix** | Pre-computed hash constant + pure-JS SHA-256 fallback function |
| **Affected environment** | S3 bucket URL (`http://`) |

### Bug 2 — CloudFront throws `AccessDenied`

| | Detail |
|---|---|
| **Symptom** | `<Error><Code>AccessDenied</Code><Message>Access Denied</Message></Error>` |
| **Root cause** | Missing default root object + CloudFront blocked from reading S3 objects |
| **Fix** | Set default root object → Add custom 403 error page → Switch to Origin Access Control (OAC) → Update bucket policy |
| **Affected environment** | CloudFront distribution URL |

### Bug 3 — Dashboard loads but API data never appears

| | Detail |
|---|---|
| **Symptom** | Login succeeds, dashboard opens, all panels show loading spinner forever |
| **Root cause** | `loadData()` was fetching `/dashboard` — the correct route is `/feedback` with `GET` |
| **Fix** | `fetch(\`${API_BASE}/dashboard\`)` → `fetch(\`${API_BASE}/feedback\`)` |
| **Affected environment** | All environments |

### Bug 4 — GitHub Actions workflow fails to parse

| | Detail |
|---|---|
| **Symptom** | `Invalid workflow file ... Unrecognized named-value: 'secrets'` |
| **Root cause** | `secrets.X` referenced directly inside a step-level `if:` condition — not permitted by GitHub Actions |
| **Fix** | Passed the secret through an `env:` block on the step, then checked the environment variable inside the shell script instead |
| **Affected environment** | CI/CD pipeline (GitHub Actions) |

### Bug 5 — S3 upload fails with `AccessControlListNotSupported`

| | Detail |
|---|---|
| **Symptom** | `An error occurred (AccessControlListNotSupported) when calling the PutObject operation: The bucket does not allow ACLs` |
| **Root cause** | Workflow used `--acl public-read` on every upload, but the bucket's **Object Ownership** is set to "Bucket owner enforced," which disables ACLs entirely (the AWS default for new buckets) |
| **Fix** | Removed `--acl public-read` from all sync commands — public access is granted via the bucket policy alone, which is the modern recommended approach |
| **Affected environment** | CI/CD pipeline (GitHub Actions → S3 deploy) |

### Bug 6 — CloudFront invalidation fails with `AccessDenied`

| | Detail |
|---|---|
| **Symptom** | `User: .../github-actions-deploy is not authorized to perform: cloudfront:CreateInvalidation` |
| **Root cause** | The IAM user used by GitHub Actions was missing the `cloudfront:CreateInvalidation` permission |
| **Fix** | Attached an inline policy granting `cloudfront:CreateInvalidation` on `*` to the IAM user; also added `continue-on-error: true` to the workflow step so a missing CloudFront permission never blocks the (more important) S3 deploy from completing |
| **Affected environment** | CI/CD pipeline (GitHub Actions) |

---

## 🔭 Future Enhancements

- [ ] **SNS Email Alerts** — notify on every NEGATIVE sentiment submission in real time
- [ ] **Multi-language Support** — Comprehend language detect + Translate before analysis
- [ ] **Cognito Authentication** — proper user pool replacing the SHA-256 login
- [ ] **CloudFront + Route 53** — HTTPS on a custom domain with SSL certificate
- [ ] **DynamoDB Streams** — trigger async processing pipelines on new items
- [ ] **Amazon Athena** — SQL analytics over DynamoDB-exported S3 data
- [ ] **Amazon QuickSight** — managed BI dashboard with advanced visualisations
- [ ] **AWS CDK / Terraform** — full infrastructure as code, one-command deploys
- [ ] **Pagination on dashboard** — load more than 10 recent submissions
- [ ] **Export to CSV** — download all feedback as a spreadsheet from the dashboard

---

## 📸 Screenshots

| Feedback Form | Admin Dashboard |
|:---:|:---:|
| *(add screenshot)* | *(add screenshot)* |

| Login Page | Live Data Charts |
|:---:|:---:|
| *(add screenshot)* | *(add screenshot)* |

> 💡 **How to add screenshots:** Drag your images into any GitHub Issue editor to get a hosted URL, then paste it in place of `*(add screenshot)*` above.

---

## 📚 References

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon Comprehend Developer Guide](https://docs.aws.amazon.com/comprehend/)
- [Amazon DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway REST API Reference](https://docs.aws.amazon.com/apigateway/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CloudWithShad Bootcamp](https://cloudwithshad.github.io)

---

## 👤 Author

<div align="center">

**Yasir** · CloudWithYasApp

*Built as the Week 4 Capstone of the **CloudWithShad AWS Bootcamp · May 2026***

<br/>

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](#)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](#)

</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

```
MIT License — Copyright (c) 2026 Yasir (CloudWithYasApp)
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, and distribute it,
subject to the standard MIT License conditions.
```

---

<div align="center">

**If this project helped you, please give it a ⭐**

*Built with ☁️ on AWS · Powered by Amazon Comprehend AI · Deployed with GitHub Actions*

<br/>

`Lambda` · `DynamoDB` · `Comprehend` · `API Gateway` · `S3` · `CloudFront` · `IAM` · `GitHub Actions`

</div>