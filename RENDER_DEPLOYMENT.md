# AquaGo Mobile Wash - Render Production Deployment Guide

This guide provides step-by-step instructions to deploy the entire **AquaGo Wash** platform to **Render** (or Netlify for frontend static sites), using **one shared Backend API** and **one shared MySQL Database** across all 3 web applications (**Customer**, **Worker**, and **Admin**).

---

## 🏗️ Production Architecture

```
   ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
   │   Customer Web App    │   │    Worker Web App     │   │     Admin Web App     │
   │  (Render/Netlify SPA) │   │  (Render/Netlify SPA) │   │  (Render/Netlify SPA) │
   └───────────┬───────────┘   └───────────┬───────────┘   └───────────┬───────────┘
               │                           │                           │
               └───────────────────────────┼───────────────────────────┘
                                           │ HTTPS (VITE_API_URL)
                                           ▼
                       ┌───────────────────────────────────────┐
                       │          Render Web Service           │
                       │          FastAPI Python API           │
                       │     (0.0.0.0:$PORT | /api/health)     │
                       └───────────────────┬───────────────────┘
                                           │ DATABASE_URL
                                           ▼
                       ┌───────────────────────────────────────┐
                       │          Render MySQL Service         │
                       │        (Auto-seeded & Migrated)       │
                       └───────────────────────────────────────┘
```

---

## 🚀 Option 1: Automated Blueprint Deployment (`render.yaml`)

Render supports Infrastructure as Code via the included `render.yaml` file.

### Steps:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository (`mobile-wash`).
4. Render will parse `render.yaml` and display the following 4 services:
   - `aquago-backend` (Web Service)
   - `aquago-customer` (Static Site)
   - `aquago-worker` (Static Site)
   - `aquago-admin` (Static Site)
5. Fill in the missing environment variables when prompted:
   - **Backend**: Provide `DATABASE_URL` from your MySQL instance (see [Database Setup](#1-mysql-database-setup) below) and optional `CLOUDINARY_URL`.
   - **Customer / Worker / Admin**: Provide `VITE_API_URL` pointing to your deployed backend URL: `https://aquago-backend.onrender.com/api/v1`.
6. Click **Apply**.

---

## 🛠️ Option 2: Step-by-Step Manual Deployment

If you prefer deploying each component individually via the Render UI, follow these steps:

---

### 1. MySQL Database Setup

1. In the Render Dashboard, click **New +** → **PostgreSQL** or deploy a **MySQL** instance.
   > **Note on MySQL on Render**: Render offers native PostgreSQL and Docker-based services. If you want a managed MySQL database on Render, you can create a **Private Service** using Docker image `mysql:8.0` with a persistent disk, or use a cloud MySQL provider such as **Aiven for MySQL**, **PlanetScale**, **Clever Cloud**, or **Railway MySQL**.
2. Note your connection details:
   - **Internal / External Database URL**: `mysql://user:password@host:port/database_name`
   - Alternatively: Host, Port, Database Name, User, Password.
3. *Note*: The AquaGo backend automatically translates `mysql://` connection strings into `mysql+pymysql://` for SQLAlchemy 2.0.

---

### 2. Backend Web Service Deployment

1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `aquago-backend`
   - **Language / Runtime**: `Python` (or `Docker`)
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: `.` (leave empty or set to root)
   - **Build Command**:
     ```bash
     cd backend && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && python seed.py && python migrate_db.py && python migrate_db_v2.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: `Free` or `Starter`
4. Expand **Advanced**:
   - **Health Check Path**: `/api/health` ⚠️ *(Critical: Set this to `/api/health` to ensure zero-downtime deployment)*
   - **Auto-Deploy**: `Yes`
5. Under **Environment Variables**, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql://root:password@mysql-host:3306/mobile_wash` | MySQL database connection URL |
| `JWT_SECRET_KEY` | *(Generate a 32+ char random string)* | Secret for auth tokens |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24 hour token expiry |
| `CORS_ORIGINS` | `https://customer.onrender.com,https://worker.onrender.com,https://admin.onrender.com` | Allowed frontend domains |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` | Cloud storage for vehicle photos *(recommended)* |
| `RAZORPAY_KEY_ID` | `rzp_test_mockkey123` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `rzp_secret_mocksecret456` | Razorpay Secret |

6. Click **Create Web Service**.
7. Once deployed, test your backend:
   ```bash
   curl -i https://<your-backend-name>.onrender.com/api/health
   ```
   **Expected Response**: `{"status": "ok"}` with HTTP `200 OK`.

---

### 3. Customer Web App Deployment

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure the static site settings:
   - **Name**: `aquago-customer`
   - **Branch**: `main`
   - **Build Command**: `npm run build:customer`
   - **Publish Directory**: `dist/customer`
4. Under **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-backend-name>.onrender.com/api/v1` |

5. Under **Redirects / Rewrites** (or auto-handled by `public/_redirects`):
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

### 4. Worker Web App Deployment

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure the static site settings:
   - **Name**: `aquago-worker`
   - **Branch**: `main`
   - **Build Command**: `npm run build:worker`
   - **Publish Directory**: `dist/worker`
4. Under **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-backend-name>.onrender.com/api/v1` |

5. Under **Redirects / Rewrites**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

### 5. Admin Web App Deployment

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure the static site settings:
   - **Name**: `aquago-admin`
   - **Branch**: `main`
   - **Build Command**: `npm run build:admin`
   - **Publish Directory**: `dist/admin`
4. Under **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://<your-backend-name>.onrender.com/api/v1` |

5. Under **Redirects / Rewrites**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
6. Click **Create Static Site**.

---

## 🔒 CORS Configuration Finalization

Once all three static sites are created:
1. Copy their production URLs:
   - Customer: `https://aquago-customer.onrender.com`
   - Worker: `https://aquago-worker.onrender.com`
   - Admin: `https://aquago-admin.onrender.com`
2. Go to **aquago-backend** → **Environment**.
3. Set `CORS_ORIGINS` to:
   ```
   https://aquago-customer.onrender.com,https://aquago-worker.onrender.com,https://aquago-admin.onrender.com
   ```
4. Save and trigger a manual redeploy of the backend if needed (Render auto-redeploys when environment variables change).

---

## 📷 Cloud Image Storage Note (Cloudinary)

Render Web Services run on ephemeral disks (disks reset on redeploy or restart). 
To ensure customer vehicle photos and worker inspection before/after photos persist indefinitely:
1. Create a free account at [Cloudinary.com](https://cloudinary.com/).
2. Copy your **API Environment Variable** (e.g. `cloudinary://123456789:abcdefg@mycloudname`).
3. Add `CLOUDINARY_URL` to your Render backend environment variables.
4. The backend `StorageService` automatically detects Cloudinary credentials and routes all vehicle photos to Cloudinary.

---

## ✅ End-to-End Production Verification Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | `GET https://<api-url>/api/health` | Returns `{"status": "ok"}` with 200 HTTP code |
| 2 | `GET https://<api-url>/docs` | Swagger UI loads with all endpoints |
| 3 | Open Customer App | Home page loads, services list fetched from API |
| 4 | Customer Auth | Login with `rahul.sharma@example.com` / `customer123` |
| 5 | Booking Flow | Create a water wash booking for a Sedan |
| 6 | Open Worker App | Login with `venky@aquago.com` / `employee123` |
| 7 | Worker Action | Accept booking → Update status to "On The Way" → "In Progress" → Complete |
| 8 | Open Admin App | Login with `admin@aquago.com` / `admin123` |
| 9 | Admin Dashboard | Real-time booking updates, worker assignment, and stats load |
