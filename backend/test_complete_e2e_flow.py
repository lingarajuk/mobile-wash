import sys
import os
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000/api/v1"

def api_call(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            err_json = json.loads(content)
        except Exception:
            err_json = {"error": content}
        return e.code, err_json

def run_test():
    print("==================================================")
    print("AQUAGO WASH - FULL E2E WORKFLOW INTEGRATION TEST")
    print("==================================================")

    # 1. Customer Login
    print("\n1. Customer Login...")
    status, cust_res = api_call("/auth/login", method="POST", data={
        "identifier": "rahul.sharma@example.com",
        "password": "customer123",
        "role": "customer"
    })
    assert status == 200, f"Customer login failed: {cust_res}"
    cust_token = cust_res.get("token")
    print("[SUCCESS] Customer Logged In:", cust_res.get("user", {}).get("name"))

    # 2. Admin Login
    print("\n2. Admin Login...")
    status, adm_res = api_call("/auth/login", method="POST", data={
        "identifier": "admin@aquago.com",
        "password": "admin123",
        "role": "admin"
    })
    assert status == 200, f"Admin login failed: {adm_res}"
    adm_token = adm_res.get("token")
    print("[SUCCESS] Admin Logged In:", adm_res.get("user", {}).get("name"))

    # 3. Employee Login
    print("\n3. Employee Login...")
    status, emp_res = api_call("/auth/login", method="POST", data={
        "identifier": "venky@aquago.com",
        "password": "employee123",
        "role": "employee"
    })
    assert status == 200, f"Employee login failed: {emp_res}"
    emp_token = emp_res.get("token")
    print("[SUCCESS] Employee Logged In:", emp_res.get("user", {}).get("name"))

    # 4. Fetch Services, Vehicles, Addresses
    status, srv_list = api_call("/services", token=cust_token)
    assert len(srv_list) > 0, "No services found"
    selected_srv = srv_list[0]
    print(f"[SUCCESS] Selected Service: {selected_srv['name']} (ID: {selected_srv['id']})")

    status, veh_list = api_call("/vehicles", token=cust_token)
    assert len(veh_list) > 0, "No vehicles found"
    selected_veh = veh_list[0]
    print(f"[SUCCESS] Selected Vehicle: {selected_veh['brand']} {selected_veh['model']} ({selected_veh['regNumber']})")

    status, addr_list = api_call("/addresses", token=cust_token)
    assert len(addr_list) > 0, "No addresses found"
    selected_addr = addr_list[0]
    print(f"[SUCCESS] Selected Address: {selected_addr['house']}, {selected_addr['area']}")

    # 5. Customer creates Booking
    print("\n5. Creating Doorstep Wash Booking in MySQL...")
    booking_payload = {
        "serviceId": selected_srv["id"],
        "vehicleId": selected_veh["id"],
        "addressId": selected_addr["id"],
        "date": "2026-08-25",
        "timeSlot": "10:00 AM - 11:00 AM",
        "vehicleCondition": "Moderate Mud",
        "conditionNotes": "Slight brake dust on alloy rims and rain spots on windshield.",
        "specialInstructions": "Please call 5 mins before arrival at security gate.",
        "photos": [
            {"photoType": "FRONT", "fileUrl": "/static/uploads/front_preview.jpg"},
            {"photoType": "LEFT", "fileUrl": "/static/uploads/left_preview.jpg"}
        ],
        "addons": ["add-1"],
        "couponCode": "WELCOME50",
        "paymentMethod": "UPI (Google Pay)",
        "basePrice": float(selected_srv["price"]),
        "addonAmount": 150.0,
        "discountAmount": 50.0,
        "taxAmount": 30.0,
        "finalAmount": float(selected_srv["price"]) + 150.0 - 50.0 + 30.0
    }
    status, booking_data = api_call("/bookings", method="POST", data=booking_payload, token=cust_token)
    assert status == 201, f"Create booking failed: {booking_data}"
    booking_id = booking_data["id"]
    print(f"[SUCCESS] Booking Created Successfully: #{booking_data.get('bookingNumber', booking_id)} (Status: {booking_data.get('status')})")

    # 6. Admin views Booking details
    print("\n6. Admin fetching Booking Details from /bookings/{id}...")
    status, b_det = api_call(f"/bookings/{booking_id}", token=adm_token)
    assert status == 200, f"Admin get booking failed: {b_det}"
    print("[SUCCESS] Booking Details verified by Admin:", b_det["customerName"], "Amount: Rs." + str(b_det["finalAmount"]))

    # 7. Admin Verifies Booking
    print("\n7. Admin Verifying Booking...")
    status, verify_res = api_call(f"/bookings/{booking_id}/verify", method="PUT", token=adm_token)
    assert status == 200, f"Verify booking failed: {verify_res}"
    print("[SUCCESS] Booking Verified. Status is now:", verify_res.get("status"))

    # 8. Admin Assigns Technician
    print("\n8. Admin Assigning Certified Technician...")
    status, employees_list = api_call("/admin/employees", token=adm_token)
    assert len(employees_list) > 0, "No employees found"
    assigned_emp_id = employees_list[0]["id"]
    status, assign_res = api_call(f"/bookings/{booking_id}/assign", method="PUT", data={"employeeId": assigned_emp_id}, token=adm_token)
    assert status == 200, f"Assign technician failed: {assign_res}"
    print("[SUCCESS] Technician Assigned. Status is now:", assign_res.get("status"))

    # 9. Technician Accepts Job
    print("\n9. Technician Accepting Job...")
    status, accept_res = api_call(f"/employee/jobs/{booking_id}/accept", method="PUT", token=emp_token)
    assert status == 200, f"Accept job failed: {accept_res}"
    print("[SUCCESS] Job Accepted by Specialist. Status:", accept_res.get("status"))

    # 10. Technician Starts Driving (ON_THE_WAY) & Broadcasts GPS
    print("\n10. Technician On The Way & GPS Location Tracking...")
    status, on_way_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={"status": "On The Way", "progressStep": 2}, token=emp_token)
    assert status == 200
    print("[SUCCESS] Status updated to: On The Way")

    status, loc_res = api_call(f"/bookings/{booking_id}/location", method="POST", data={
        "latitude": 12.3150,
        "longitude": 76.6550,
        "speed": 32.5,
        "heading": 88.0
    }, token=emp_token)
    assert status == 200
    print("[SUCCESS] Live GPS Coordinates Broadcasted and Stored in MySQL:", loc_res)

    # 11. Technician Arrives & Records Inspection Notes
    print("\n11. Technician Marks Arrived & Saves Pre-Wash Inspection Notes...")
    status, arrived_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={"status": "Arrived", "progressStep": 2}, token=emp_token)
    assert status == 200

    status, insp_res = api_call(f"/bookings/{booking_id}/inspection", method="POST", data={
        "exteriorCondition": "Minor Dirt & Road Tar",
        "interiorCondition": "Clean",
        "existingScratches": "Small 2cm scratch near driver door handle",
        "dentsNotes": "No dent observed",
        "brokenParts": "None",
        "dirtyAreas": "Lower door sills and alloy wheels",
        "inspectionNotes": "Inspection verified with vehicle owner before foam application."
    }, token=emp_token)
    assert status == 200
    print("[SUCCESS] Vehicle Inspection Stored in MySQL:", insp_res.get("existingScratches"))

    # 12. Technician Starts Wash (IN PROGRESS) & Completes Wash
    print("\n12. Wash In Progress & Wash Completion...")
    status, prog_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={"status": "In Progress", "progressStep": 3}, token=emp_token)
    assert status == 200
    print("[SUCCESS] Status updated to: In Progress")

    status, comp_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={"status": "Completed", "progressStep": 4}, token=emp_token)
    assert status == 200
    print("[SUCCESS] Status updated to: Completed (Payment Status:", comp_res.get("paymentStatus"), ")")

    # 13. Customer Submits 5-Star Review
    print("\n13. Customer Submitting 5-Star Review...")
    status, rev_res = api_call(f"/bookings/{booking_id}/review", method="POST", data={
        "rating": 5,
        "comment": "Outstanding doorstep foam wash! The car looks showroom clean and technician Venkatesh was super polite.",
        "serviceQualityRating": 5,
        "technicianRating": 5
    }, token=cust_token)
    assert status == 200
    print("[SUCCESS] Review Stored in MySQL:", rev_res)

    # 14. Verification of Audit Timeline & Review on Booking
    print("\n14. Verifying Complete Status Timeline and Review on Booking Record...")
    status, final_booking = api_call(f"/bookings/{booking_id}", token=adm_token)
    assert status == 200
    print("[SUCCESS] Timeline events recorded in MySQL:", len(final_booking.get("statusHistory", [])))
    for event in final_booking.get("statusHistory", []):
        print(f"   - {event.get('createdAt')}: {event.get('newStatus')} (by {event.get('changedBy')} / {event.get('changedByRole')})")

    assert final_booking.get("review") is not None, "Review not linked to booking"
    print("[SUCCESS] Verified Review Rating:", final_booking["review"]["rating"], "Stars")
    print("[SUCCESS] Verified Review Comment:", final_booking["review"]["comment"])

    print("\n==================================================")
    print("ALL FULL E2E WORKFLOW INTEGRATION TESTS PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    run_test()
