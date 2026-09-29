"""Tests for Authentication endpoints."""
import pytest


def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Jane Doe",
            "email": "jane@example.com",
            "password": "securepassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["name"] == "Jane Doe"
    assert "password" not in data["user"]


def test_register_duplicate_email_fails(client, user_credentials):
    # First registration
    client.post("/api/auth/register", json=user_credentials)
    # Duplicate registration
    response = client.post("/api/auth/register", json=user_credentials)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_register_invalid_input(client):
    # Password too short (< 6 chars)
    response = client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "bob@example.com", "password": "123"},
    )
    assert response.status_code == 422

    # Invalid email
    response = client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "not-an-email", "password": "validpassword"},
    )
    assert response.status_code == 422


def test_login_success(client, user_credentials):
    client.post("/api/auth/register", json=user_credentials)
    response = client.post(
        "/api/auth/login",
        json={
            "email": user_credentials["email"],
            "password": user_credentials["password"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == user_credentials["email"]


def test_login_invalid_credentials(client, user_credentials):
    client.post("/api/auth/register", json=user_credentials)
    response = client.post(
        "/api/auth/login",
        json={"email": user_credentials["email"], "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_get_me_authenticated(client, auth_headers, user_credentials):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_credentials["email"]
    assert data["name"] == user_credentials["name"]


def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
