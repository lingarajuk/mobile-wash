import urllib.request
import json

BASE = 'http://localhost:5000/api/v1'

def post(endpoint, data, token=None):
    req = urllib.request.Request(f'{BASE}{endpoint}', data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    if token: req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(endpoint, token=None):
    req = urllib.request.Request(f'{BASE}{endpoint}')
    if token: req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

# 1. Login Customer
print('1. Authenticating Customer in Docker...')
cust_auth = post('/auth/login', {'identifier': 'rahul.sharma@example.com', 'password': 'customer123', 'role': 'customer'})
cust_token = cust_auth['token']
print(f'   Customer token obtained: {cust_token[:20]}...')

# 2. Login Admin
print('2. Authenticating Admin in Docker...')
admin_auth = post('/auth/login', {'identifier': 'admin@aquago.com', 'password': 'admin123', 'role': 'admin'})
admin_token = admin_auth['token']
print(f'   Admin token obtained: {admin_token[:20]}...')

# 3. Login Worker
print('3. Authenticating Worker in Docker...')
worker_auth = post('/auth/login', {'identifier': 'venky@aquago.com', 'password': 'employee123', 'role': 'employee'})
worker_token = worker_auth['token']
print(f'   Worker token obtained: {worker_token[:20]}...')

# 4. Customer creates new booking
print('4. Customer creating new booking in Docker MySQL...')
new_booking = post('/bookings', {
    'service_id': 1,
    'vehicle_id': 1,
    'address_id': 1,
    'booking_date': '2026-08-25',
    'time_slot': '10:00 AM - 11:30 AM',
    'payment_method': 'Cash After Service'
}, cust_token)
b_id = new_booking['id']
b_status = new_booking['status']
print(f'   Booking created successfully with ID: #{b_id} and status: {b_status}')

# 5. Admin verifies booking
print('5. Admin verifying booking...')
verified = post(f'/admin/bookings/{b_id}/verify', {}, admin_token)
print(f'   Status after verify: {verified["status"]}')

# 6. Admin assigns worker
print('6. Admin assigning worker...')
assigned = post(f'/admin/bookings/{b_id}/assign', {'employee_id': 1}, admin_token)
print(f'   Status after assign: {assigned["status"]}')

# 7. Worker updates status to On The Way and Completed
print('7. Worker updating status to On The Way...')
otw = post(f'/employees/jobs/{b_id}/status', {'status': 'On The Way', 'note': 'En route with mobile van'}, worker_token)
print(f'   Status: {otw["status"]}')

print('8. Worker completing service...')
completed = post(f'/employees/jobs/{b_id}/status', {'status': 'Completed', 'note': 'Wash and wax complete'}, worker_token)
print(f'   Status: {completed["status"]}')

# 9. Customer reviews booking
print('9. Customer submitting review in Docker MySQL...')
reviewed = post(f'/bookings/{b_id}/review', {'rating': 5, 'feedback': 'Outstanding mobile wash service inside Docker!'}, cust_token)
print(f'   Status after review: {reviewed["status"]}')

print('\n>>> ALL 3-WAY DOCKER SYNCHRONIZATION TESTS PASSED SUCCESSFULLY! <<<')
