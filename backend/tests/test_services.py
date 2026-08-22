from fastapi.testclient import TestClient

def test_get_services(client: TestClient):
    res = client.get("/api/v1/services")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_get_addons(client: TestClient):
    res = client.get("/api/v1/services/addons")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_validate_coupon(client: TestClient):
    payload = {
        "code": "FIRSTWASH",
        "amount": 500.0
    }
    res = client.post("/api/v1/offers/validate", json=payload)
    assert res.status_code == 200
    assert res.json()["valid"] == True
    assert res.json()["discount"] == 150.0
