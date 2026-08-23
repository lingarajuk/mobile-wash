# AquaGo Wash - Multi-Portal Doorstep Vehicle Care Platform

AquaGo Wash is an enterprise-grade mobile doorstep vehicle washing and detailing platform built with **Customer & Worker React Native Mobile Applications**, **three dedicated Web Applications (Customer, Worker, Admin)**, **one shared FastAPI Backend API**, and **one shared MySQL Database**.

---

## 🏗️ Target Architecture

```text
AquaGo Wash Platform
│
├── Customer Mobile App (React Native / Expo) -> npm run dev:customer-mobile
│
├── Worker Mobile App (React Native / Expo)   -> npm run dev:worker-mobile
│
├── Customer Web App (Vite React - Port 5173) -> http://localhost:5173
│
├── Worker Web App (Vite React - Port 5174)   -> http://localhost:5174
│
├── Admin Web Dashboard (Port 5175)           -> http://localhost:5175
│
└── Shared FastAPI Backend API (Port 5000)    -> http://localhost:5000
    │
    └── Shared MySQL Database (Port 3306)     -> Real-time single source of truth
```

---

## 📱 Mobile Applications (React Native + Expo)

### 1. Customer Mobile App (`apps/customer-mobile/`)
- **App Name**: AquaGo Wash (`com.aquago.wash`)
- **Bottom Navigation**: Home, Services, Bookings, Notifications, Profile
- **Features**:
  - Greeting banner & location selector (*"Good Morning, Rahul 👋 • Mysuru"*)
  - 8-Step booking flow (Service -> Vehicle -> Photos -> Location -> Schedule -> Addons -> Review -> Payment)
  - Vehicle inspection photo capture (Front, Back, Left, Right)
  - My Bookings with Upcoming, Active, and Completed tabs
  - Real-time GPS technician tracking when en route
  - Post-service rating and review submission
- **Run Command**:
  ```bash
  npm run dev:customer-mobile
  ```

### 2. Worker Mobile App (`apps/worker-mobile/`)
- **App Name**: AquaGo Worker (`com.aquago.worker`)
- **Bottom Navigation**: Dashboard, Jobs, History, Profile
- **Features**:
  - Live technician KPI dashboard (Today's jobs, Active, Upcoming, Completed)
  - Full job action lifecycle buttons:
    - `[Accept Job]` -> when Assigned
    - `[Start Travel]` -> when Accepted (broadcasts live GPS coordinates)
    - `[I've Arrived]` -> when On The Way
    - `[Start Wash Service]` -> when Arrived
    - `[Post Live Work Update]` -> records real-time updates for customer and admin
    - `[Take Before / After Photos]` -> saves camera pictures against booking
    - `[Complete Wash Service]` -> finalizes job and records timestamp
  - `[Navigate to Customer]` -> Opens Google Maps navigation with customer coordinates
- **Run Command**:
  ```bash
  npm run dev:worker-mobile
  ```

---

## 🤖 Android Testing Guide (Expo Go)

1. Install the **Expo Go** app on your Android phone from the Google Play Store.
2. Ensure your phone and computer are connected to the same Wi-Fi network.
3. Start the mobile app:
   ```bash
   npm run dev:customer-mobile
   # OR
   npm run dev:worker-mobile
   ```
4. Scan the QR code displayed in your terminal using the Expo Go app.

### Required Android Permissions
- `CAMERA`: Capture before/after wash verification photos.
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`: Select photos from gallery.
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`: Doorstep address selection and live technician GPS broadcasting.

---

## 🌐 Web Portals & Quick Commands

| Portal / App | Command | URL | Default Demo Credentials |
|---|---|---|---|
| **Customer Mobile** | `npm run dev:customer-mobile` | Expo QR Code | `rahul.sharma@example.com` / `customer123` |
| **Worker Mobile** | `npm run dev:worker-mobile` | Expo QR Code | `venky@aquago.com` / `employee123` |
| **Customer Web** | `npm run dev:customer` | [http://localhost:5173](http://localhost:5173) | `rahul.sharma@example.com` / `customer123` |
| **Worker Web** | `npm run dev:worker` | [http://localhost:5174](http://localhost:5174) | `venky@aquago.com` / `employee123` |
| **Admin Web** | `npm run dev:admin` | [http://localhost:5175](http://localhost:5175) | `admin@aquago.com` / `admin123` |
| **FastAPI Backend** | `npm run dev:backend` | [http://localhost:5000/docs](http://localhost:5000/docs) | — |

---

## 🐳 Docker Deployment

```bash
# Start all containers in background
docker compose up -d

# Stop all containers (keeps MySQL data intact)
docker compose down
```
