"""Tests for Workout Session logging and history."""
from datetime import datetime, timezone
import pytest


def test_create_and_list_workout_sessions(client, auth_headers):
    # Log session 1
    session_data = {
        "workout_date": datetime.now(timezone.utc).isoformat(),
        "workout_name": "Full Body Strength Circuit",
        "duration": 45,
        "completion_status": "completed",
        "notes": "Felt great, increased dumbbell weight on squats.",
        "calories_burned": 320,
    }
    create_resp = client.post("/api/workouts", json=session_data, headers=auth_headers)
    assert create_resp.status_code == 201
    created_id = create_resp.json()["id"]
    assert create_resp.json()["calories_burned"] == 320

    # List sessions
    list_resp = client.get("/api/workouts", headers=auth_headers)
    assert list_resp.status_code == 200
    sessions = list_resp.json()
    assert len(sessions) >= 1
    assert any(s["id"] == created_id for s in sessions)


def test_update_workout_session(client, auth_headers):
    session_data = {
        "workout_date": datetime.now(timezone.utc).isoformat(),
        "workout_name": "HIIT Cardio",
        "duration": 30,
        "completion_status": "in_progress",
    }
    create_resp = client.post("/api/workouts", json=session_data, headers=auth_headers)
    w_id = create_resp.json()["id"]

    # Update completion status and duration
    update_data = {
        "duration": 35,
        "completion_status": "completed",
        "notes": "Finished final round with burpees!",
    }
    upd_resp = client.put(f"/api/workouts/{w_id}", json=update_data, headers=auth_headers)
    assert upd_resp.status_code == 200
    data = upd_resp.json()
    assert data["duration"] == 35
    assert data["completion_status"] == "completed"
    assert data["notes"] == "Finished final round with burpees!"


def test_delete_workout_session(client, auth_headers):
    session_data = {
        "workout_date": datetime.now(timezone.utc).isoformat(),
        "workout_name": "Morning Walk",
        "duration": 25,
        "completion_status": "completed",
    }
    create_resp = client.post("/api/workouts", json=session_data, headers=auth_headers)
    w_id = create_resp.json()["id"]

    # Delete
    del_resp = client.delete(f"/api/workouts/{w_id}", headers=auth_headers)
    assert del_resp.status_code == 204


def test_workout_isolation(client, auth_headers, second_auth_headers):
    # User 1 creates workout
    session_data = {
        "workout_date": datetime.now(timezone.utc).isoformat(),
        "workout_name": "Private Workout",
        "duration": 40,
        "completion_status": "completed",
    }
    create_resp = client.post("/api/workouts", json=session_data, headers=auth_headers)
    w_id = create_resp.json()["id"]

    # User 2 tries to update -> 404
    upd_resp = client.put(
        f"/api/workouts/{w_id}",
        json={"notes": "Hacked"},
        headers=second_auth_headers,
    )
    assert upd_resp.status_code == 404

    # User 2 tries to delete -> 404
    del_resp = client.delete(f"/api/workouts/{w_id}", headers=second_auth_headers)
    assert del_resp.status_code == 404
