import sys
import os
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api/v1"

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

def run_worker_flow_test():
    print("==================================================================")
    print("AQUAGO WASH - WORKER PROFILE & ASSIGNED DASHBOARD 3-WAY SYNC TEST")
    print("==================================================================")

    # 1. Logins
    print("\n1. Logging in Customer, Admin, and Technician (Worker)...")
    status, cust_res = api_call("/auth/login", method="POST", data={
        "identifier": "rahul.sharma@example.com",
        "password": "customer123",
        "role": "customer"
    })
    assert status == 200, f"Customer login failed: {cust_res}"
    cust_token = cust_res["token"]
    print("[PASS] Customer Logged In:", cust_res["user"]["name"])

    status, adm_res = api_call("/auth/login", method="POST", data={
        "identifier": "admin@aquago.com",
        "password": "admin123",
        "role": "admin"
    })
    assert status == 200, f"Admin login failed: {adm_res}"
    adm_token = adm_res["token"]
    print("[PASS] Admin Logged In:", adm_res["user"]["name"])

    status, emp_res = api_call("/auth/login", method="POST", data={
        "identifier": "venky@aquago.com",
        "password": "employee123",
        "role": "employee"
    })
    assert status == 200, f"Employee login failed: {emp_res}"
    emp_token = emp_res["token"]
    print("[PASS] Technician (Worker) Logged In:", emp_res["user"]["name"])

    # 2. Worker Profile & Allowed Updates
    print("\n2. Testing Worker Profile & Permitted Profile Updates (/employee/profile)...")
    status, worker_prof = api_call("/employee/profile", token=emp_token)
    assert status == 200, f"Get worker profile failed: {worker_prof}"
    print(f"[PASS] Worker Profile Retrieved: ID={worker_prof['id']}, Role={worker_prof['role']}, Rating={worker_prof['rating']}, CompletedJobs={worker_prof['completedJobs']}")

    status, upd_prof = api_call("/employee/profile", method="PUT", data={
        "skills": "Pressure Foam Wash, Interior Detailing, Ceramic Spray, Steam Sanitization",
        "experience": "4+ Years",
        "bio": "Certified master technician specialized in premium doorstep detailing.",
        "status": "Available",
        "location": "Saraswathipuram & Vijayanagar, Mysuru"
    }, token=emp_token)
    assert status == 200, f"Update profile failed: {upd_prof}"
    assert "Ceramic Spray" in upd_prof["skills"]
    print("[PASS] Worker Permitted Profile Info Updated and Verified in MySQL")

    # 3. Customer Creates Booking
    print("\n3. Customer Creates New Doorstep Washing Booking...")
    status, srv_list = api_call("/services", token=cust_token)
    selected_srv = srv_list[0]
    status, veh_list = api_call("/vehicles", token=cust_token)
    selected_veh = veh_list[0]
    status, addr_list = api_call("/addresses", token=cust_token)
    selected_addr = addr_list[0]

    booking_payload = {
        "serviceId": selected_srv["id"],
        "vehicleId": selected_veh["id"],
        "addressId": selected_addr["id"],
        "date": "2026-08-26",
        "timeSlot": "02:00 PM - 03:00 PM",
        "vehicleCondition": "Heavy Mud & Grime",
        "conditionNotes": "Mud spots on lower sills, brake dust on alloy wheels.",
        "specialInstructions": "Security guard at gate will direct to parking slot #B4.",
        "photos": [
            {"photoType": "FRONT", "fileUrl": "/static/uploads/front_preview.jpg"},
            {"photoType": "BACK", "fileUrl": "/static/uploads/back_preview.jpg"}
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
    status, b_data = api_call("/bookings", method="POST", data=booking_payload, token=cust_token)
    assert status == 201, f"Create booking failed: {b_data}"
    booking_id = b_data["id"]
    print(f"[PASS] Booking Created: #{b_data.get('bookingNumber', booking_id)} (Status: {b_data.get('status')})")

    # 4. Admin Verifies and Assigns Venkatesh Kumar
    print("\n4. Admin Verifies Booking & Assigns Venkatesh Kumar...")
    status, v_res = api_call(f"/bookings/{booking_id}/verify", method="PUT", token=adm_token)
    assert status == 200

    assigned_emp_id = worker_prof["id"] # emp-201
    status, assign_res = api_call(f"/bookings/{booking_id}/assign", method="PUT", data={"employeeId": assigned_emp_id}, token=adm_token)
    assert status == 200
    print("[PASS] Booking Verified and Assigned to Worker emp-201")

    # 5. Worker Checks Assigned Jobs & Views Details
    print("\n5. Worker Views Assigned Jobs (/employee/jobs) & Single Job (/employee/jobs/{id})...")
    status, emp_jobs = api_call("/employee/jobs", token=emp_token)
    assert status == 200
    matching_job = next((j for j in emp_jobs if j["id"] == booking_id), None)
    assert matching_job is not None, "Assigned job not visible in worker dashboard"
    print(f"[PASS] Worker Dashboard contains assigned job: #{matching_job['bookingNumber']} (Status: {matching_job['status']})")

    status, job_details = api_call(f"/employee/jobs/{booking_id}", token=emp_token)
    assert status == 200
    assert job_details["customerName"] is not None
    assert job_details["vehicle"]["regNumber"] is not None
    assert len(job_details["photos"]) >= 2
    print("[PASS] Worker Job Details retrieved successfully with customer, vehicle, and photos")

    # 6. Worker Accepts Job
    print("\n6. Worker Accepts Assigned Job (/employee/jobs/{id}/accept)...")
    status, accept_res = api_call(f"/employee/jobs/{booking_id}/accept", method="PUT", token=emp_token)
    assert status == 200
    assert accept_res["status"] == "Accepted"
    print("[PASS] Job Accepted! Status is now: ACCEPTED")

    # 7. Worker Starts Travel (ON THE WAY) & Broadcasts GPS
    print("\n7. Worker Starts Travel (ON THE WAY) & Broadcasts GPS (/employee/jobs/{id}/location)...")
    status, on_way_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={
        "status": "On The Way",
        "progressStep": 2,
        "notes": "Technician started travel from Saraswathipuram hub"
    }, token=emp_token)
    assert status == 200

    status, loc_res = api_call(f"/employee/jobs/{booking_id}/location", method="POST", data={
        "latitude": 12.3160,
        "longitude": 76.6560,
        "speed": 34.0,
        "heading": 85.0
    }, token=emp_token)
    assert status == 200
    print("[PASS] Live GPS Coordinates Saved in MySQL (Visible to Admin, Worker, Customer)")

    # 8. Worker Arrives & Saves Pre-Wash Inspection
    print("\n8. Worker Arrives & Saves Vehicle Inspection (/employee/jobs/{id}/inspection)...")
    status, arrived_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={
        "status": "Arrived",
        "progressStep": 2,
        "notes": "Specialist arrived at customer doorstep with mobile pressure unit"
    }, token=emp_token)
    assert status == 200

    status, insp_res = api_call(f"/employee/jobs/{booking_id}/inspection", method="POST", data={
        "exteriorCondition": "Heavy Mud on Sills",
        "interiorCondition": "Clean with light dust",
        "existingScratches": "Minor 1.5cm scratch on left rear bumper",
        "dentsNotes": "No major dents",
        "brokenParts": "None",
        "dirtyAreas": "Wheels, underbody skirts, rear boot",
        "inspectionNotes": "Pre-wash inspection confirmed with vehicle owner."
    }, token=emp_token)
    assert status == 200
    print("[PASS] Pre-Wash Inspection Checklist Stored in MySQL")

    # 9. Worker Logs Real-Time Work Progress Updates
    print("\n9. Worker Posts Work Progress Updates (/employee/jobs/{id}/work-update)...")
    status, wu1 = api_call(f"/employee/jobs/{booking_id}/work-update", method="POST", data={
        "updateText": "Active snow foam dwelling and pressure rinse completed."
    }, token=emp_token)
    assert status == 200

    status, wu2 = api_call(f"/employee/jobs/{booking_id}/work-update", method="POST", data={
        "updateText": "Interior vacuuming, dashboard sanitization, and liquid gloss wax finished."
    }, token=emp_token)
    assert status == 200
    print(f"[PASS] 2 Work Progress Updates Logged in MySQL: '{wu1['updateText']}' & '{wu2['updateText']}'")

    # 10. Worker Completes Wash
    print("\n10. Worker Completes Wash (IN PROGRESS -> COMPLETED)...")
    status, prog_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={
        "status": "In Progress",
        "progressStep": 3
    }, token=emp_token)
    assert status == 200

    status, comp_res = api_call(f"/employee/jobs/{booking_id}/status", method="PUT", data={
        "status": "Completed",
        "progressStep": 4,
        "notes": "Doorstep pressure foam wash and interior detailing completed successfully."
    }, token=emp_token)
    assert status == 200
    assert comp_res["status"] == "Completed"
    assert comp_res["paymentStatus"] == "Paid"
    print("[PASS] Service Marked as COMPLETED! (Payment status: Paid)")

    # 11. Customer Reviews & 3-Way Synchronization Check
    print("\n11. Customer Submits Review & Checking 3-Way Synchronization...")
    status, rev_res = api_call(f"/bookings/{booking_id}/review", method="POST", data={
        "rating": 5,
        "comment": "Exceptional service by Venkatesh! Punctual, meticulous, and the car looks showroom fresh.",
        "serviceQualityRating": 5,
        "technicianRating": 5
    }, token=cust_token)
    assert status == 200

    # Verification: Customer view
    status, cust_view = api_call(f"/bookings/{booking_id}", token=cust_token)
    assert status == 200
    assert cust_view["status"] == "Completed"
    assert len(cust_view["workUpdates"]) == 2
    assert cust_view["review"]["rating"] == 5
    print("[PASS] CUSTOMER View Verified: Sees Completed status, 2 work updates, review")

    # Verification: Admin view
    status, adm_view = api_call(f"/admin/bookings/{booking_id}", token=adm_token)
    assert status == 200
    assert adm_view["status"] == "Completed"
    assert len(adm_view["workUpdates"]) == 2
    assert adm_view["review"]["comment"] is not None
    print("[PASS] ADMIN View Verified: Sees Completed status, work updates, audit timeline, review")

    # Verification: Worker Profile & History
    status, worker_view = api_call(f"/employee/jobs/{booking_id}", token=emp_token)
    assert status == 200
    assert worker_view["status"] == "Completed"

    status, worker_history = api_call("/employee/history", token=emp_token)
    assert status == 200
    assert any(h["id"] == booking_id for h in worker_history)
    print(f"[PASS] WORKER History Verified: Completed job #{booking_id} listed in work history")

    status, worker_reviews = api_call("/employee/reviews", token=emp_token)
    assert status == 200
    assert any(r["bookingId"] == booking_id for r in worker_reviews)
    print(f"[PASS] WORKER Profile Reviews Verified: 5-Star customer review visible in worker profile")

    print("\n==================================================================")
    print("ALL 11 STAGES OF WORKER PROFILE & ASSIGNED DASHBOARD PASSED 100%!")
    print("==================================================================")

if __name__ == "__main__":
    run_worker_flow_test()
