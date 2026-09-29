"""Tests for Dashboard summary and metrics endpoint."""
from datetime import datetime, timezone
import pytest


def test_dashboard_empty_initial(client, auth_headers):
    response = client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_workouts"] == 0
    assert data["completed_workouts"] == 0
    assert data["total_minutes"] == 0
    assert data["current_streak_days"] == 0
    assert data["active_plan"] is None
    assert data["latest_nutrition"] is None
    assert data["recent_sessions"] == []


def test_dashboard_with_activity(client, auth_headers):
    # 1. Generate a plan
    plan_payload = {
        "age": 27,
        "fitness_experience": "beginner",
        "fitness_goals": "weight_loss",
        "equipment_available": "bodyweight_only",
        "target_workout_days_per_week": 3,
    }
    client.post("/api/fitness/generate-plan", json=plan_payload, headers=auth_headers)

    # 2. Log workout sessions
    now = datetime.now(timezone.utc)
    s1 = {
        "workout_date": now.isoformat(),
        "workout_name": "Bodyweight Day 1",
        "duration": 30,
        "completion_status": "completed",
        "calories_burned": 220,
    }
    client.post("/api/workouts", json=s1, headers=auth_headers)

    # 3. Check dashboard
    response = client.get("/api/dashboard", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_workouts"] == 1
    assert data["completed_workouts"] == 1
    assert data["total_minutes"] == 30
    assert data["estimated_calories"] == 220
    assert data["current_streak_days"] == 1
    assert data["active_plan"] is not None
    assert data["latest_nutrition"] is not None
    assert len(data["recent_sessions"]) == 1
    assert data["user_profile"] is not None
