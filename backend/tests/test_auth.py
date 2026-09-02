def test_register_creates_user_and_returns_token(client):
    response = client.post(
        "/auth/register",
        json={"name": "Ashhad", "email": "ashhad@example.com", "password": "supersecret1"},
    )
    assert response.status_code == 201
    assert "access_token" in response.json()


def test_register_duplicate_email_fails(client):
    payload = {"name": "Ashhad", "email": "dup@example.com", "password": "supersecret1"}
    client.post("/auth/register", json=payload)
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409


def test_login_with_correct_credentials(client):
    client.post(
        "/auth/register",
        json={"name": "Ashhad", "email": "login@example.com", "password": "supersecret1"},
    )
    response = client.post("/auth/login", json={"email": "login@example.com", "password": "supersecret1"})
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_with_wrong_password_fails(client):
    client.post(
        "/auth/register",
        json={"name": "Ashhad", "email": "wrongpw@example.com", "password": "supersecret1"},
    )
    response = client.post("/auth/login", json={"email": "wrongpw@example.com", "password": "nope"})
    assert response.status_code == 401


def test_protected_route_requires_token(client):
    response = client.get("/auth/me")
    assert response.status_code in (401, 403)


def test_me_returns_current_user(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
