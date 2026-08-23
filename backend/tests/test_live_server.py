import urllib.request
import json
import urllib.parse
import sys

BASE_URL = "http://localhost:8000/api/v1"

def make_req(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req_data = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))

def run_live_tests():
    print("--- TESTING LIVE FASTAPI SERVER OVER HTTP ---")

    # 1. Customer login
    print("1. Testing Customer Login...")
    cust_res = make_req("/auth/login", method="POST", data={
        "identifier": "rahul.sharma@example.com",
        "password": "customer123",
        "role": "customer"
    })
    cust_token = cust_res.get("access_token") or cust_res.get("token")
    assert cust_token, "No access token received!"
    print("Customer logged in successfully.")

    # 2. Get Services from DB
    print("2. Fetching Services from DB...")
    services = make_req("/services")
    assert len(services) > 0, "No services returned!"
    selected_srv = services[0]
    print(f"Fetched {len(services)} services. Selected: {selected_srv['name']} (Rs. {selected_srv['price']})")

    # 3. Get Addons from DB
    print("3. Fetching Add-ons from DB...")
    addons = make_req("/services/addons")
    assert len(addons) > 0, "No addons returned!"
    print(f"Fetched {len(addons)} add-ons.")

    # 4. Create Booking in MySQL
    print("4. Creating Customer Booking in MySQL via Live API...")
    booking_data = {
        "serviceId": selected_srv["id"],
        "date": "2026-08-26",
        "timeSlot": "11:00 AM – 12:00 PM",
        "customerName": "Rahul Sharma",
        "customerPhone": "+91 98765 43210",
        "customerEmail": "rahul.sharma@example.com",
        "vehicleType": "suv",
        "vehicleBrand": "Hyundai",
        "vehicleModel": "Creta SX",
        "vehicleRegNumber": "KA-09-AB-1234",
        "vehicleColor": "Titan Grey",
        "vehicleCondition": "Muddy",
        "conditionNotes": "Heavy underbody mud and stained front seats",
        "specialInstructions": "Please sanitize AC vents thoroughly",
        "photos": [
            {"photoType": "FRONT", "fileUrl": "/static/uploads/front_preview.jpg"}
        ],
        "fullAddress": "No. 108, 4th Cross, Kuvempunagar",
        "landmark": "Near Complex",
        "city": "Mysuru",
        "state": "Karnataka",
        "pincode": "570023",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "addonIds": [addons[0]["id"]],
        "couponCode": "SAVE10",
        "paymentMethod": "UPI (Google Pay)"
    }

    created = make_req("/bookings", method="POST", data=booking_data, token=cust_token)
    b_id = created["id"]
    print(f"Booking created successfully! ID: {b_id}, Status: {created['status']}, Amount: Rs. {created['finalAmount']}")
    assert created["status"] == "Pending Verification"
    assert created["vehicleCondition"] == "Muddy"

    # 5. Fetch Single Booking
    print(f"5. Fetching booking #{b_id} details...")
    single = make_req(f"/bookings/{b_id}", token=cust_token)
    assert single["id"] == b_id
    assert len(single.get("smartSuggestions", [])) > 0
    print(f"Smart suggestions generated: {single['smartSuggestions']}")

    # 6. Admin Login & Verification
    print("6. Admin Logging In...")
    admin_res = make_req("/auth/login", method="POST", data={
        "identifier": "admin@aquago.com",
        "password": "admin123",
        "role": "admin"
    })
    admin_token = admin_res.get("access_token") or admin_res.get("token")

    print(f"7. Admin Verifying Booking #{b_id}...")
    verified = make_req(f"/admin/bookings/{b_id}/verify", method="PUT", token=admin_token)
    assert verified["status"] == "Verified"
    print("Booking verified by Admin.")

    print(f"8. Admin Assigning Technician emp-201 to Booking #{b_id}...")
    assigned = make_req(f"/admin/bookings/{b_id}/assign", method="POST", data={"employeeId": "emp-201"}, token=admin_token)
    assert assigned["status"] == "Assigned"
    assert assigned["employee"]["id"] == "emp-201"
    print("Technician assigned successfully.")

    # 9. Employee Login & Job Workflow
    print("9. Employee Logging In...")
    emp_res = make_req("/auth/login", method="POST", data={
        "identifier": "venky@aquago.com",
        "password": "employee123",
        "role": "employee"
    })
    emp_token = emp_res.get("access_token") or emp_res.get("token")

    print("10. Employee Viewing Assigned Jobs...")
    jobs = make_req("/employee/jobs", token=emp_token)
    found_job = next((j for j in jobs if j["id"] == b_id), None)
    assert found_job is not None, "Assigned job not found in employee list!"
    print(f"Found assigned job #{found_job['id']} for vehicle {found_job['vehicle']['brand']} {found_job['vehicle']['model']}")

    # Employee status progression
    print("11. Employee Accepting Job...")
    make_req(f"/employee/jobs/{b_id}/accept", method="PUT", token=emp_token)

    print("12. Employee On The Way...")
    make_req(f"/employee/jobs/{b_id}/status", method="PUT", data={"status": "On The Way"}, token=emp_token)

    print("13. Employee In Progress...")
    make_req(f"/employee/jobs/{b_id}/status", method="PUT", data={"status": "In Progress"}, token=emp_token)

    print("14. Employee Completing Job...")
    final_job = make_req(f"/employee/jobs/{b_id}/status", method="PUT", data={"status": "Completed"}, token=emp_token)
    assert final_job["status"] == "Completed"
    print(f"Job #{b_id} successfully marked as Completed in MySQL database!")

    print("\n==========================================")
    print(" ALL LIVE END-TO-END TESTS PASSED 100%! ")
    print("==========================================")

if __name__ == "__main__":
    run_live_tests()
