import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.models.booking import Booking
from app.models.user import User

client = TestClient(app)

def test_full_booking_lifecycle():
    print("\n--- STARTING FULL E2E BOOKING LIFECYCLE TEST ---")

    # 1. Login Customer
    print("1. Logging in customer...")
    login_res = client.post("/api/v1/auth/login", json={
        "identifier": "rahul.sharma@example.com",
        "password": "customer123",
        "role": "customer"
    })
    assert login_res.status_code == 200, f"Customer login failed: {login_res.text}"
    cust_token = login_res.json().get("access_token") or login_res.json().get("token")
    cust_headers = {"Authorization": f"Bearer {cust_token}"}
    print("Customer logged in successfully.")

    # 2. Upload vehicle photo
    print("2. Testing vehicle photo upload...")
    test_photo_content = b"FAKE_IMAGE_DATA_HEADER_BYTES_JPEG"
    photo_res = client.post(
        "/api/v1/bookings/upload-photo",
        files={"file": ("front_hood.jpg", test_photo_content, "image/jpeg")},
        data={"photo_type": "FRONT"}
    )
    assert photo_res.status_code == 200, f"Photo upload failed: {photo_res.text}"
    photo_url = photo_res.json().get("fileUrl")
    print(f"Photo uploaded successfully: {photo_url}")

    # 3. Create Booking
    print("3. Submitting customer booking to MySQL...")
    booking_payload = {
        "serviceId": "srv-2", # Premium Doorstep Wash (base ₹599)
        "date": "2026-08-25",
        "timeSlot": "09:00 AM – 10:00 AM",
        "customerName": "Rahul Sharma",
        "customerPhone": "+91 98765 43210",
        "customerEmail": "rahul.sharma@example.com",
        "vehicleType": "sedan",
        "vehicleBrand": "Honda",
        "vehicleModel": "City ZX",
        "vehicleRegNumber": "KA-09-MA-7821",
        "vehicleColor": "Platinum White",
        "vehicleCondition": "Heavy Dirt",
        "conditionNotes": "Heavy rain mud on lower doors and brake dust on alloy rims",
        "specialInstructions": "Please take extra care with the diamond cut alloy wheels",
        "photos": [
            {"photoType": "FRONT", "fileUrl": photo_url}
        ],
        "fullAddress": "No. 42, 3rd Main Road, Gokulam 2nd Stage",
        "landmark": "Near Water Tank",
        "city": "Mysuru",
        "state": "Karnataka",
        "pincode": "570002",
        "latitude": 12.3118,
        "longitude": 76.6529,
        "addonIds": ["addon-1", "addon-2"], # Tyre & Rim Polish (₹99) + Dashboard Polish (₹149)
        "couponCode": "FIRSTWASH", # Flat ₹150 discount
        "paymentMethod": "UPI (Google Pay)"
    }

    create_res = client.post("/api/v1/bookings", json=booking_payload, headers=cust_headers)
    assert create_res.status_code == 201, f"Booking creation failed: {create_res.text}"
    created_booking = create_res.json()
    booking_id = created_booking["id"]
    print(f"Booking created with ID: {booking_id}")
    print(f"Booking Status: {created_booking['status']}")
    print(f"Calculated Total Amount: Rs. {created_booking['finalAmount']}")
    print(f"Smart Suggestions: {created_booking.get('smartSuggestions')}")

    assert created_booking["status"] == "Pending Verification"
    assert created_booking["customerName"] == "Rahul Sharma"
    assert created_booking["vehicleCondition"] == "Heavy Dirt"
    assert len(created_booking["photos"]) >= 1

    # 4. Verify in MySQL directly
    db = SessionLocal()
    db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
    assert db_booking is not None, "Booking not found in MySQL database!"
    assert str(db_booking.status) == "Pending Verification"
    db.close()
    print("Verified record in MySQL database.")

    # 5. Admin Login & Verification
    print("5. Logging in admin...")
    admin_login = client.post("/api/v1/auth/login", json={
        "identifier": "admin@aquago.com",
        "password": "admin123",
        "role": "admin"
    })
    admin_token = admin_login.json().get("access_token") or admin_login.json().get("token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    print(f"6. Admin verifying booking #{booking_id}...")
    verify_res = client.put(f"/api/v1/admin/bookings/{booking_id}/verify", headers=admin_headers)
    assert verify_res.status_code == 200, f"Verify booking failed: {verify_res.text}"
    assert verify_res.json()["status"] == "Verified"
    print("Booking verified by Admin.")

    # 7. Admin Assigns Employee
    print(f"7. Admin assigning technician to booking #{booking_id}...")
    assign_res = client.post(
        f"/api/v1/admin/bookings/{booking_id}/assign",
        json={"employeeId": "emp-201"},
        headers=admin_headers
    )
    assert assign_res.status_code == 200, f"Assign technician failed: {assign_res.text}"
    assert assign_res.json()["status"] == "Assigned"
    assert assign_res.json()["employee"]["id"] == "emp-201"
    print("Technician emp-201 assigned successfully.")

    # 8. Employee Login & Job Status Flow
    print("8. Logging in employee...")
    emp_login = client.post("/api/v1/auth/login", json={
        "identifier": "venky@aquago.com",
        "password": "employee123",
        "role": "employee"
    })
    emp_token = emp_login.json().get("access_token") or emp_login.json().get("token")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}

    # Employee views jobs
    jobs_res = client.get("/api/v1/employee/jobs", headers=emp_headers)
    assert jobs_res.status_code == 200
    my_job = next((j for j in jobs_res.json() if j["id"] == booking_id), None)
    assert my_job is not None, f"Assigned job {booking_id} not visible to employee!"
    print(f"Employee found assigned job: {my_job['id']}")

    # Employee accepts job
    print("9. Employee accepting job...")
    accept_res = client.put(f"/api/v1/employee/jobs/{booking_id}/accept", headers=emp_headers)
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "Accepted"

    # Employee on the way
    print("10. Employee updating status to 'On The Way'...")
    otw_res = client.put(f"/api/v1/employee/jobs/{booking_id}/status", json={"status": "On The Way"}, headers=emp_headers)
    assert otw_res.status_code == 200
    assert otw_res.json()["status"] == "On The Way"

    # Employee in progress
    print("11. Employee updating status to 'In Progress'...")
    inp_res = client.put(f"/api/v1/employee/jobs/{booking_id}/status", json={"status": "In Progress"}, headers=emp_headers)
    assert inp_res.status_code == 200
    assert inp_res.json()["status"] == "In Progress"

    # Employee completes job
    print("12. Employee completing job...")
    comp_res = client.put(f"/api/v1/employee/jobs/{booking_id}/status", json={"status": "Completed"}, headers=emp_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "Completed"

    print("\n--- ALL E2E BOOKING LIFECYCLE TESTS PASSED PERFECTLY! ---")

if __name__ == "__main__":
    test_full_booking_lifecycle()
