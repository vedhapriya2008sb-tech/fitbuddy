"""Dashboard router providing aggregated fitness metrics and summaries."""
from datetime import date, datetime, timedelta, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import NutritionGuidance, User, UserProfile, WorkoutPlan, WorkoutSession
from app.schemas import (
    DashboardSummary,
    NutritionGuidanceResponse,
    UserProfileResponse,
    WorkoutPlanResponse,
    WorkoutSessionResponse,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def calculate_streak(sessions: list) -> int:
    """Calculate consecutive day workout streak."""
    if not sessions:
        return 0

    # Get distinct workout dates in descending order
    dates = sorted(
        {s.workout_date.date() for s in sessions if s.workout_date},
        reverse=True,
    )
    if not dates:
        return 0

    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)

    # Streak is active if the most recent workout was today or yesterday
    if dates[0] not in (today, yesterday):
        return 0

    streak = 1
    current = dates[0]
    for next_date in dates[1:]:
        if next_date == current - timedelta(days=1):
            streak += 1
            current = next_date
        elif next_date == current:
            continue
        else:
            break

    return streak


@router.get(
    "",
    response_model=DashboardSummary,
    status_code=status.HTTP_200_OK,
    summary="Get user dashboard summary metrics and active plan",
)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve comprehensive dashboard overview for the logged-in user."""
    # 1. Total & completed workouts
    all_sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.workout_date.desc())
        .all()
    )

    total_workouts = len(all_sessions)
    completed_workouts = sum(
        1 for s in all_sessions if s.completion_status == "completed"
    )
    total_minutes = sum(s.duration or 0 for s in all_sessions)
    estimated_calories = sum(s.calories_burned or 0 for s in all_sessions)
    current_streak = calculate_streak(all_sessions)

    # 2. Active plan (or most recent)
    active_plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id, WorkoutPlan.is_active == True
        )
        .first()
    )
    if not active_plan:
        active_plan = (
            db.query(WorkoutPlan)
            .filter(WorkoutPlan.user_id == current_user.id)
            .order_by(WorkoutPlan.created_at.desc())
            .first()
        )

    # 3. Latest nutrition guidance
    latest_nutrition = (
        db.query(NutritionGuidance)
        .filter(NutritionGuidance.user_id == current_user.id)
        .order_by(NutritionGuidance.created_at.desc())
        .first()
    )

    # 4. Recent sessions (top 5)
    recent_sessions = all_sessions[:5]

    # 5. User profile
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )

    return DashboardSummary(
        total_workouts=total_workouts,
        completed_workouts=completed_workouts,
        total_minutes=total_minutes,
        estimated_calories=estimated_calories,
        current_streak_days=current_streak,
        active_plan=active_plan,
        latest_nutrition=latest_nutrition,
        recent_sessions=recent_sessions,
        user_profile=profile,
    )
