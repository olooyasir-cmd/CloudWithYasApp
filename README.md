# CloudWithYasApp
# ☁️ CloudWithYasApp — Real-Time Customer Feedback Platform

> A fully serverless customer feedback system built end-to-end on AWS Free Tier.  
> Customers submit feedback via a hosted form. Owners see live sentiment analytics on a real-time admin dashboard.

![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-NoSQL-4053D6?style=flat-square&logo=amazon-dynamodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Free Tier](https://img.shields.io/badge/AWS-100%25%20Free%20Tier-success?style=flat-square)

---

## 📖 The Story

A restaurant owner in Accra stays open until midnight. Customers leave. He has no idea if they'll return.

No feedback system. No data. No second chance to fix what went wrong.

**So I built one.**

CloudWithYasApp is a QR-code-ready customer feedback platform that gives small business owners in Africa and beyond a real-time window into how their customers feel — built entirely on AWS, costing nothing to run.

---

## 🖼️ Project Overview

| Page | Description |
|---|---|
| `feedback.html` | Customer-facing form — name, email, company, category, star rating, message |
| `admin-dashboard.html` | Owner dashboard — live sentiment charts, rating breakdown, recent submissions feed |

Both pages are hosted as static files on **Amazon S3** and communicate with a single **Lambda function** via **API Gateway REST API**.

---

## 🏗️ Architecture

```
Customer Browser          API Gateway          Lambda Function         DynamoDB
(feedback.html)    ──►   REST API          ──►  Python 3.12      ──►  cloudwithyas-
                          POST /feedback        handle_post()          feedback table
Admin Browser             REST API          ──►  handle_get()    ◄──  (scan all items)
(admin-dashboard)  ──►   GET  /feedback        returns stats
```

### AWS Services Used

| Service | Purpose | Free Tier |
|---|---|---|
| **Amazon S3** | Host both static HTML pages | 5 GB storage, 20K GET requests |
| **API Gateway** | REST API — routes POST and GET to Lambda | 1M API calls/month |
| **AWS Lambda** | Business logic — save feedback, run sentiment, return analytics | 1M requests + 400K GB-seconds |
| **Amazon DynamoDB** | NoSQL store for all feedback submissions | 25 GB + 200M requests/month |
| **IAM** | Role granting Lambda access to DynamoDB and Comprehend | Free |

---

## ✨ Features

- **Multi-field feedback form** — name, email, company, feedback type dropdown, 1–5 star rating, free-text message
- **Keyword-based sentiment analysis** — POSITIVE / NEGATIVE / NEUTRAL, runs inside Lambda with no extra service cost
- **Real-time admin dashboard** with:
  - Stat cards (total responses, % positive, avg rating, latest submission)
  - Animated sentiment donut chart
  - Star rating distribution bars
  - Feedback category breakdown
  - Live submissions feed (last 10, with avatar, sentiment pill, company tag)
  - Auto-refreshes every 60 seconds
- **Password-protected dashboard** — SHA-256 hashed password checked in the browser, never stored in plain text
- **100% AWS Free Tier** — no credit card charges for normal usage
- **CORS-compliant** — works across S3 and API Gateway with proper preflight handling
- **DynamoDB pagination** — handles datasets larger than 1MB scan limit

---

## 📁 Project Structure

```
cloudwithyasapp/
│
├── feedback.html           # Customer-facing feedback form
├── admin-dashboard.html    # Owner analytics dashboard
├── lambda_function.py      # Single Lambda handling GET + POST
└── README.md
```

---

## 🚀 Deployment Guide

### Prerequisites
- An AWS account (free tier is sufficient)
- Basic familiarity with the AWS Console

---

### Step 1 — Create DynamoDB Table

1. Go to **DynamoDB** → **Create table**
2. Table name: `cloudwithyas-feedback`
3. Partition key: `feedback_id` (String)
4. Leave all other settings as default → **Create table**

---

### Step 2 — Create IAM Role

1. **IAM** → **Roles** → **Create role**
2. Trusted entity: **AWS service** → **Lambda** → Next
3. Attach these policies:
   - `AWSLambdaBasicExecutionRole`
   - `ComprehendReadOnly` *(use this, NOT ComprehendFullAccess — free tier compatible)*
   - `AmazonDynamoDBFullAccess`
4. Role name: `cloudwithyas-feedback-role` → **Create role**

---

### Step 3 — Create Lambda Function

1. **Lambda** → **Create function** → **Author from scratch**
2. Function name: `cloudwithyas-process-feedback`
3. Runtime: **Python 3.12**
4. Expand *Change default execution role* → **Use an existing role** → select `cloudwithyas-feedback-role`
5. **Create function**
6. Paste the contents of `lambda_function.py` into the code editor → **Deploy**

---

### Step 4 — Create REST API Gateway

1. **API Gateway** → **Create API** → **REST API** → **Build**
2. Select **New API** · Name: `feedback-api` → **Create API**
3. **Create resource** → Resource path: `/feedback` → tick **Enable API Gateway CORS** → **Create resource**
4. Select `/feedback` → **Create method** → `POST` → Lambda proxy integration → select your function → **Save**
5. Select `/feedback` → **Create method** → `GET` → Lambda proxy integration → select same function → **Save**
6. Select `/feedback` → **Enable CORS** → confirm `GET, POST, OPTIONS` are listed → **Save**
7. **Deploy API** → New stage → Stage name: `prod` → **Deploy**
8. Copy the **Invoke URL** — you will need it in both HTML files

> ⚠️ **Important:** You must redeploy to `prod` after *every* API Gateway change, including CORS updates.

---

### Step 5 — Configure HTML Files

In `feedback.html`, find and replace:

```javascript
const API_URL = 'YOUR_API_GATEWAY_URL_HERE/feedback';
```

Replace with your Invoke URL + `/feedback`:

```javascript
const API_URL = 'https://abc123.execute-api.us-east-1.amazonaws.com/prod/feedback';
```

In `admin-dashboard.html`, find and replace:

```javascript
const API_BASE = 'REPLACE_WITH_YOUR_REST_API_BASE_URL/prod';
```

Replace with your Invoke URL (no `/feedback` — the dashboard JS adds it):

```javascript
const API_BASE = 'https://abc123.execute-api.us-east-1.amazonaws.com/prod';
```

---

### Step 6 — Host on Amazon S3

1. **S3** → **Create bucket** → choose a unique name → **Create**
2. **Permissions** tab → **Block public access** → uncheck all four boxes → **Save**
3. **Bucket policy** → **Edit** → paste the policy below (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. **Upload** both `feedback.html` and `admin-dashboard.html`
5. Click each file → **Properties** → copy the **Object URL**

> ⚠️ **Always use the Object URL** (`https://bucket.s3.amazonaws.com/page.html`), NOT the static website hosting URL (`http://bucket.s3-website-...`). The website URL is HTTP-only and will block API calls to your HTTPS API Gateway.

---

### Step 7 — Access Your Pages

| Page | URL format |
|---|---|
| Feedback form | `https://YOUR-BUCKET.s3.amazonaws.com/feedback.html` |
| Admin dashboard | `https://YOUR-BUCKET.s3.amazonaws.com/admin-dashboard.html` |

---

## 🔐 Dashboard Password Protection

The admin dashboard uses SHA-256 hashing to protect access without exposing your password in source code.

**Generate your hash** — open your browser console (F12) and run:

```javascript
const encoder = new TextEncoder();
const data = encoder.encode('your-chosen-password');
crypto.subtle.digest('SHA-256', data).then(hash => {
  console.log([...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,'0')).join(''));
});
```

Paste the output into `admin-dashboard.html`:

```javascript
const ADMIN_HASH = 'paste-your-hash-here';
```

The real password is never stored in your code — only the irreversible hash.

---

## 🗄️ DynamoDB Schema

| Attribute | Type | Notes |
|---|---|---|
| `feedback_id` | String | Partition key — UUID generated by Lambda |
| `name` | String | Customer full name |
| `email` | String | Customer email |
| `message` | String | Raw feedback text (max 5,000 chars) |
| `sentiment` | String | `POSITIVE` \| `NEGATIVE` \| `NEUTRAL` |
| `rating` | String | 1–5 star rating (optional) |
| `company` | String | Customer company (optional) |
| `feedback_type` | String | Category from dropdown (optional) |
| `submitted_at` | String | ISO-8601 UTC timestamp |

---

## 🔌 API Reference

### `POST /feedback` — Submit feedback

**Request body:**
```json
{
  "name":    "Jane Smith",
  "email":   "jane@example.com",
  "message": "The service was excellent!",
  "company": "Acme Corp",
  "type":    "General feedback",
  "rating":  "5"
}
```

**Response:**
```json
{
  "success":   true,
  "id":        "a1b2c3d4-...",
  "sentiment": "POSITIVE"
}
```

---

### `GET /feedback` — Fetch analytics (dashboard)

**Response:**
```json
{
  "total": 42,
  "sentiment_breakdown": {
    "POSITIVE": 30,
    "NEGATIVE": 5,
    "NEUTRAL":  7
  },
  "recent_all": [ ...all items sorted newest first... ]
}
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---|---|
| **CORS error on form submit** | API Gateway → `/feedback` → Enable CORS → `GET, POST, OPTIONS` → Save → **redeploy to prod** |
| **`SubscriptionRequiredException` (Comprehend)** | Use `ComprehendReadOnly` policy, not `ComprehendFullAccess` |
| **Network error from S3 URL** | Switch from the `http://` website URL to the `https://` Object URL |
| **API changes have no effect** | You must **Deploy API → prod** after every single change |
| **`Access Denied` on S3 page** | Check Block Public Access is fully disabled + bucket policy is saved |
| **Dashboard shows no data** | Confirm GET method exists on `/feedback` + CORS re-enabled + redeployed |

---

## 💡 Key Lessons Learned

1. **CORS requires a redeploy** — enabling CORS in the console does nothing until you deploy to your stage
2. **HTTP vs HTTPS** — S3 static website hosting is HTTP-only; always use the Object URL for HTTPS
3. **`ComprehendReadOnly` vs `ComprehendFullAccess`** — both work for `detect_sentiment()`, but only ReadOnly is available without a subscription on new accounts
4. **One Lambda for everything** — a single function routing on `httpMethod` is cleaner than two separate functions for small projects
5. **DynamoDB scan pagination** — always handle `LastEvaluatedKey` or your dashboard will miss records once your table exceeds 1MB

---

## 🛠️ Built With

- [AWS Lambda](https://aws.amazon.com/lambda/) — serverless compute
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/) — REST API layer
- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) — NoSQL database
- [Amazon S3](https://aws.amazon.com/s3/) — static website hosting
- [Python 3.12](https://www.python.org/) — Lambda runtime
- [Inter](https://fonts.google.com/specimen/Inter) — UI font
- [Tabler Icons](https://tabler-icons.io/) — icon set

---

## 👤 Author

**Yasir** — [@cloudwithshad](https://github.com/cloudwithshad)

Built as part of the AWS Cloud Bootcamp.  
Designed for small businesses in Accra, Ghana and across Africa.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

*Built with ☁️ on AWS Free Tier — zero cost, real impact.*
