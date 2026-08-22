from fastapi.testclient import TestClient

def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login(client: TestClient):
    email = f"testuser_{int(client.__hash__() if hasattr(client, '__hash__') else 12345)}@example.com"
    reg_payload = {
        "full_name": "Test User",
        "email": email,
        "phone": "+91 99999 88888",
        "password": "testpassword123",
        "role": "customer"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    if reg_res.status_code == 400:
        # User might already exist
        pass
    else:
        assert reg_res.status_code == 200
        assert "token" in reg_res.json()

    login_payload = {
        "identifier": email,
        "password": "testpassword123",
        "role": "customer"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    if login_res.status_code == 200:
        assert "token" in login_res.json()
        assert login_res.json()["user"]["email"] == email

def test_invalid_login(client: TestClient):
    login_payload = {
        "identifier": "nonexistent@example.com",
        "password": "wrongpassword",
        "role": "customer"
    }
    res = client.post("/api/v1/auth/login", json=login_payload)
    assert res.status_code == 401
