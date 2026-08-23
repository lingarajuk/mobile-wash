# AquaGo Wash - Multi-Portal Doorstep Vehicle Care Platform

AquaGo Wash is an enterprise-grade mobile doorstep vehicle washing and detailing platform built with **three separated frontend web applications**, **one shared FastAPI backend API**, and **one shared MySQL database**.

---

## 🏗️ Architecture

```text
AquaGo Wash
│
├── Customer Web App (Port 5173)    -> http://localhost:5173
│
├── Worker Web App (Port 5174)      -> http://localhost:5174
│
├── Admin Web App (Port 5175)       -> http://localhost:5175
│
└── Shared FastAPI Backend (Port 5000) -> http://localhost:5000
    │
    └── MySQL Database (Port 3306)  -> Persistent Named Volume (mysql_data)
```

---

## 🐳 Docker Deployment & Quick Start

### 1. Start all 5 containers with Docker Compose
```bash
docker compose up --build -d
```

### 2. View running containers
```bash
docker compose ps
```

### 3. View live logs
```bash
docker compose logs -f
```

### 4. Stop all containers (keeps MySQL data volume safe)
```bash
docker compose down
```

### 5. Rebuild from scratch
```bash
docker compose build --no-cache
```

---

## 🌐 Application URLs & Credentials

| Service | Port | Local URL | Role / Purpose | Default Demo Credentials |
|---|---|---|---|---|
| **Customer Web App** | `5173` | [http://localhost:5173](http://localhost:5173) | Book doorstep wash, upload vehicle photos, track worker live | `rahul.sharma@example.com` / `customer123` |
| **Worker Web App** | `5174` | [http://localhost:5174](http://localhost:5174) | View assigned jobs, accept bookings, share GPS, upload wash photos | `venky@aquago.com` / `employee123` |
| **Admin Web App** | `5175` | [http://localhost:5175](http://localhost:5175) | Manage bookings, dispatch technicians, analytics & revenue reports | `admin@aquago.com` / `admin123` |
| **Shared Backend API** | `5000` | [http://localhost:5000/docs](http://localhost:5000/docs) | FastAPI REST API documentation (Swagger UI) | — |
| **MySQL Database** | `3306` | `localhost:3306` | Shared MySQL 8.0 Database (`mobile_wash`) | User: `root` / Pass: `root` |

---

## 💻 Local Development (Without Docker)

### Run all 3 Frontends locally
```bash
# Customer App (Port 5173)
npm run dev:customer

# Worker App (Port 5174)
npm run dev:worker

# Admin App (Port 5175)
npm run dev:admin
```

### Run FastAPI Backend locally
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` to configure custom database or port settings:

```env
# Database Settings
DB_HOST=mysql
DB_PORT=3306
DB_NAME=mobile_wash
DB_USER=root
DB_PASSWORD=root

# Backend Configuration
BACKEND_PORT=5000
JWT_SECRET=aquago_super_secret_jwt_key_2026_change_in_production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend API Configuration
VITE_API_URL=http://localhost:5000/api/v1
```
