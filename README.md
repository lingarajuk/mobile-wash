# Mobile Wash - On-Demand Car & Vehicle Washing Platform

An on-demand mobile vehicle washing platform featuring a modern React frontend and a FastAPI backend with PostgreSQL/SQLite, JWT authentication, booking lifecycle management, live tracking, and role-based access control.

## 🚀 Features

- **Customer Portal**: Service discovery, multi-vehicle management, dynamic pricing & packages, booking flow with slot selection, live order tracking, ratings & reviews.
- **Admin Dashboard**: Analytics, customer & employee management, booking assignment, payment records, service & offer management.
- **Employee Portal**: Task tracking, live status updates, route assistance, earnings dashboard.
- **Backend API**: FastAPI REST API with SQLAlchemy ORM, Alembic migrations, Pydantic validation, JWT OAuth2 security, and automated tests.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Vanilla CSS design system, Lucide icons, React Router
- **Backend**: Python, FastAPI, SQLAlchemy, Alembic, SQLite / PostgreSQL
- **DevOps**: Docker, Docker Compose

## 🏁 Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```
