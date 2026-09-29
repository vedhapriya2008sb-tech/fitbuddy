"""Workout tracking and logging router."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, WorkoutPlan, WorkoutSession
from app.schemas import (
    WorkoutSessionCreate,
    WorkoutSessionResponse,
    WorkoutSessionUpdate,
)

router = APIRouter(prefix="/workouts", tags=["Workout Tracking"])


@router.post(
    "",
    response_model=WorkoutSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log a workout session",
)
def create_workout_session(
    session_data: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a new completed or in-progress workout session."""
    # If workout_plan_id provided, verify ownership
    if session_data.workout_plan_id:
        plan = (
            db.query(WorkoutPlan)
            .filter(
                WorkoutPlan.id == session_data.workout_plan_id,
                WorkoutPlan.user_id == current_user.id,
            )
            .first()
        )
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referenced workout plan does not exist or does not belong to you.",
            )

    # Estimate calories if not provided (~7 kcal per minute of moderate exercise)
    calories = session_data.calories_burned
    if calories is None:
        calories = int(session_data.duration * 7.5)

    new_session = WorkoutSession(
        user_id=current_user.id,
        workout_plan_id=session_data.workout_plan_id,
        workout_date=session_data.workout_date,
        workout_name=session_data.workout_name.strip(),
        duration=session_data.duration,
        completion_status=session_data.completion_status,
        notes=session_data.notes,
        calories_burned=calories,
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.get(
    "",
    response_model=List[WorkoutSessionResponse],
    status_code=status.HTTP_200_OK,
    summary="List workout session history",
)
def get_workout_sessions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve logged workout sessions for the current user."""
    query = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    )

    if status_filter:
        query = query.filter(WorkoutSession.completion_status == status_filter)

    sessions = (
        query.order_by(WorkoutSession.workout_date.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return sessions


@router.put(
    "/{workout_id}",
    response_model=WorkoutSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a logged workout session",
)
def update_workout_session(
    workout_id: int,
    update_data: WorkoutSessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update details of an existing workout session."""
    session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == workout_id,
            WorkoutSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found.",
        )

    data_dict = update_data.model_dump(exclude_unset=True)
    for key, value in data_dict.items():
        setattr(session, key, value)

    db.commit()
    db.refresh(session)
    return session


@router.delete(
    "/{workout_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a logged workout session",
)
def delete_workout_session(
    workout_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a workout session owned by the current user."""
    session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.id == workout_id,
            WorkoutSession.user_id == current_user.id,
        )
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found.",
        )

    db.delete(session)
    db.commit()
    return None
