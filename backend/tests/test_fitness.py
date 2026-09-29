"""Tests for AI Fitness Plan generation and management."""
import pytest


def test_generate_fitness_plan(client, auth_headers):
    payload = {
        "age": 30,
        "gender": "male",
        "fitness_experience": "beginner",
        "activity_preferences": ["strength", "cardio"],
        "fitness_goals": "weight_loss",
        "relevant_limitations": "none",
        "equipment_available": "dumbbells_only",
        "target_workout_days_per_week": 3,
        "session_duration_minutes": 40,
        "additional_notes": "Looking to establish healthy habits",
    }
    response = client.post(
        "/api/fitness/generate-plan",
        json=payload,
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["is_active"] is True
    assert "workout_schedule" in data
    assert len(data["workout_schedule"]) == 3
    assert "safety_reminders" in data

    # Verify user profile was synced
    prof_resp = client.get("/api/users/profile", headers=auth_headers)
    assert prof_resp.status_code == 200
    assert prof_resp.json()["age"] == 30
    assert prof_resp.json()["fitness_goals"] == "weight_loss"


def test_list_and_get_plan(client, auth_headers):
    # Generate plan
    payload = {
        "age": 25,
        "fitness_experience": "intermediate",
        "fitness_goals": "muscle_gain",
        "equipment_available": "full_gym",
        "target_workout_days_per_week": 4,
    }
    create_resp = client.post(
        "/api/fitness/generate-plan",
        json=payload,
        headers=auth_headers,
    )
    plan_id = create_resp.json()["id"]

    # List plans
    list_resp = client.get("/api/fitness/plans", headers=auth_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # Get single plan
    get_resp = client.get(f"/api/fitness/plans/{plan_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == plan_id


def test_plan_user_access_restriction(client, auth_headers, second_auth_headers):
    # User 1 creates plan
    payload = {
        "age": 35,
        "fitness_experience": "advanced",
        "fitness_goals": "endurance",
        "equipment_available": "bodyweight_only",
        "target_workout_days_per_week": 3,
    }
    create_resp = client.post(
        "/api/fitness/generate-plan",
        json=payload,
        headers=auth_headers,
    )
    plan_id = create_resp.json()["id"]

    # User 2 tries to access User 1's plan -> 404
    resp = client.get(f"/api/fitness/plans/{plan_id}", headers=second_auth_headers)
    assert resp.status_code == 404


def test_activate_and_delete_plan(client, auth_headers):
    # Create two plans
    payload1 = {
        "age": 22,
        "fitness_experience": "beginner",
        "fitness_goals": "general_health",
        "equipment_available": "bodyweight_only",
        "target_workout_days_per_week": 2,
    }
    p1 = client.post("/api/fitness/generate-plan", json=payload1, headers=auth_headers).json()
    p2 = client.post("/api/fitness/generate-plan", json=payload1, headers=auth_headers).json()

    # p2 is active, p1 became inactive
    get_p1 = client.get(f"/api/fitness/plans/{p1['id']}", headers=auth_headers).json()
    assert get_p1["is_active"] is False

    # Activate p1
    act_resp = client.put(f"/api/fitness/plans/{p1['id']}/activate", headers=auth_headers)
    assert act_resp.status_code == 200
    assert act_resp.json()["is_active"] is True

    # Delete p2
    del_resp = client.delete(f"/api/fitness/plans/{p2['id']}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Ensure p2 is deleted
    assert client.get(f"/api/fitness/plans/{p2['id']}", headers=auth_headers).status_code == 404
