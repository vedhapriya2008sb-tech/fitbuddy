"""Tests for User Profile endpoints."""
import pytest


def test_get_profile_not_found(client, auth_headers):
    response = client.get("/api/users/profile", headers=auth_headers)
    assert response.status_code == 404


def test_create_and_update_profile(client, auth_headers):
    # 1. Create/upsert profile
    profile_payload = {
        "age": 28,
        "gender": "female",
        "height_cm": 168,
        "weight_kg": 62,
        "fitness_experience": "intermediate",
        "activity_preferences": ["strength", "yoga"],
        "fitness_goals": "muscle_gain",
        "relevant_limitations": "mild wrist tendonitis",
        "equipment_available": "dumbbells_only",
        "target_workout_days_per_week": 4,
    }
    response = client.put(
        "/api/users/profile",
        json=profile_payload,
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["age"] == 28
    assert data["fitness_goals"] == "muscle_gain"
    assert data["target_workout_days_per_week"] == 4

    # 2. Get profile
    get_resp = client.get("/api/users/profile", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["age"] == 28
    assert get_resp.json()["fitness_experience"] == "intermediate"

    # 3. Partial update
    update_payload = {"age": 29, "target_workout_days_per_week": 5}
    upd_resp = client.put(
        "/api/users/profile",
        json=update_payload,
        headers=auth_headers,
    )
    assert upd_resp.status_code == 200
    assert upd_resp.json()["age"] == 29
    assert upd_resp.json()["target_workout_days_per_week"] == 5
    # Previous values preserved
    assert upd_resp.json()["fitness_goals"] == "muscle_gain"


def test_profile_unauthorized(client):
    response = client.get("/api/users/profile")
    assert response.status_code == 401
