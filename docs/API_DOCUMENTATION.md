# REST API Documentation - Mobile Water Wash

## Base URL
Development: `http://localhost:8000/api/v1`

FastAPI Interactive Swagger Specs: `http://localhost:8000/docs`
ReDoc Specs: `http://localhost:8000/redoc`

---

## 🔑 1. Authentication Endpoints

### 1.1 Register User
- **POST** `/auth/register`
- **Request Body**:
```json
{
  "full_name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "phone": "+91 98765 43210",
  "password": "customer123",
  "role": "customer"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cust-101",
    "role": "customer",
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.com",
    "phone": "+91 98765 43210",
    "profilePic": "https://...",
    "referralCode": "RAHUL884"
  }
}
```

### 1.2 Login User
- **POST** `/auth/login`
- **Request Body**:
```json
{
  "identifier": "rahul.sharma@example.com",
  "password": "customer123",
  "role": "customer"
}
```
- **Response (200 OK)**: Token & user object.

### 1.3 Get Current User Profile
- **GET** `/auth/me`
- **Headers**: `Authorization: Bearer <token>`

---

## 🚗 2. Customer Vehicles Endpoints

### 2.1 Get Customer Vehicles
- **GET** `/vehicles`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
```json
[
  {
    "id": "veh-1",
    "type": "sedan",
    "brand": "Honda",
    "model": "City ZX",
    "regNumber": "KA-09-MA-7821",
    "color": "Platinum White",
    "isDefault": true
  }
]
```

### 2.2 Add Vehicle
- **POST** `/vehicles`
- **Headers**: `Authorization: Bearer <token>`

---

## 📍 3. Saved Addresses Endpoints

### 3.1 Get Saved Addresses
- **GET** `/addresses`
- **Headers**: `Authorization: Bearer <token>`

### 3.2 Add Saved Address
- **POST** `/addresses`

---

## 🧼 4. Services & Addons Endpoints

### 4.1 List Services
- **GET** `/services?category=all&search=`

### 4.2 Get Addons List
- **GET** `/services/addons`

---

## 📅 5. Bookings Endpoints

### 5.1 Create Booking
- **POST** `/bookings`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "serviceId": "srv-2",
  "vehicleId": "veh-1",
  "addressId": "addr-1",
  "date": "2026-08-25",
  "timeSlot": "09:00 AM – 10:00 AM",
  "addonIds": ["addon-1", "addon-2"],
  "couponCode": "FIRSTWASH",
  "paymentMethod": "UPI (Google Pay)"
}
```

### 5.2 Get Booking History
- **GET** `/bookings?statusTab=all`

### 5.3 Cancel Booking
- **PUT** `/bookings/{id}/cancel`

---

## 👷 6. Employee Endpoints

### 6.1 Employee Profile
- **GET** `/employee/profile`

### 6.2 Get Assigned Jobs
- **GET** `/employee/jobs`

### 6.3 Accept Job
- **PUT** `/employee/jobs/{id}/accept`

### 6.4 Update Job Progress Status
- **PUT** `/employee/jobs/{id}/status`
- **Request Body**:
```json
{
  "status": "On The Way",
  "progressStep": 2
}
```

---

## 👑 7. Admin Endpoints

### 7.1 Dashboard Analytics
- **GET** `/admin/dashboard`

### 7.2 Manage Customers
- **GET** `/admin/customers`
- **PUT** `/admin/customers/{id}/status`

### 7.3 Manage Employees
- **GET** `/admin/employees`
- **POST** `/admin/employees`

### 7.4 Assign Employee to Booking
- **POST** `/admin/bookings/{id}/assign`
```json
{
  "employeeId": "emp-201"
}
```
