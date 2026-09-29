"""Fitness plan generation and retrieval router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import NutritionGuidance, User, UserProfile, WorkoutPlan
from app.schemas import QuestionnaireInput, WorkoutPlanResponse
from app.services.gemini_service import generate_fitness_plan_gemini

router = APIRouter(prefix="/fitness", tags=["Fitness Plans"])


@router.post(
    "/generate-plan",
    response_model=WorkoutPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI-powered fitness workout plan and nutrition guidance",
)
def generate_plan(
    questionnaire: QuestionnaireInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a customized fitness plan and nutrition guidance using Gemini AI,

    persisting the plan and updating the user's fitness profile.
    """
    # 1. Synchronize / update user profile with questionnaire answers
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        profile = UserProfile(
            user_id=current_user.id,
            age=questionnaire.age,
            gender=questionnaire.gender,
            fitness_experience=questionnaire.fitness_experience,
            activity_preferences=questionnaire.activity_preferences,
            fitness_goals=questionnaire.fitness_goals,
            relevant_limitations=questionnaire.relevant_limitations,
            equipment_available=questionnaire.equipment_available,
            target_workout_days_per_week=questionnaire.target_workout_days_per_week,
        )
        db.add(profile)
    else:
        profile.age = questionnaire.age
        profile.gender = questionnaire.gender
        profile.fitness_experience = questionnaire.fitness_experience
        profile.activity_preferences = questionnaire.activity_preferences
        profile.fitness_goals = questionnaire.fitness_goals
        profile.relevant_limitations = questionnaire.relevant_limitations
        profile.equipment_available = questionnaire.equipment_available
        profile.target_workout_days_per_week = (
            questionnaire.target_workout_days_per_week
        )

    # 2. Deactivate previous active plans for this user
    db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id, WorkoutPlan.is_active == True
    ).update({"is_active": False})

    # 3. Call AI Service
    ai_result = generate_fitness_plan_gemini(questionnaire)

    # 4. Save WorkoutPlan
    new_plan = WorkoutPlan(
        user_id=current_user.id,
        plan_title=ai_result.get("plan_title", "Custom AI Fitness Routine"),
        plan_description=ai_result.get(
            "plan_description", "Personalized fitness program"
        ),
        fitness_goal_summary=ai_result.get("fitness_goal_summary"),
        workout_schedule=ai_result.get("workout_schedule", []),
        rest_and_recovery=ai_result.get("rest_and_recovery"),
        safety_reminders=ai_result.get("safety_reminders"),
        is_active=True,
    )
    db.add(new_plan)
    db.flush()  # get new_plan.id

    # 5. Save NutritionGuidance
    nutrition_data = ai_result.get("nutrition_guidance", {})
    if nutrition_data:
        nutrition = NutritionGuidance(
            user_id=current_user.id,
            workout_plan_id=new_plan.id,
            guidance_title=nutrition_data.get(
                "title", "Personalized Nutrition Guide"
            ),
            guidance_content=nutrition_data,
            safety_disclaimer=nutrition_data.get(
                "safety_disclaimer",
                "FitBuddy AI nutrition is not medical advice.",
            ),
        )
        db.add(nutrition)

    db.commit()
    db.refresh(new_plan)

    return new_plan


@router.get(
    "/plans",
    response_model=List[WorkoutPlanResponse],
    status_code=status.HTTP_200_OK,
    summary="List all workout plans for the current user",
)
def get_user_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all saved fitness plans belonging to the current user."""
    plans = (
        db.query(WorkoutPlan)
        .filter(WorkoutPlan.user_id == current_user.id)
        .order_by(WorkoutPlan.created_at.desc())
        .all()
    )
    return plans


@router.get(
    "/plans/{plan_id}",
    response_model=WorkoutPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Get details of a specific workout plan",
)
def get_plan_by_id(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve a single workout plan by ID ensuring user ownership."""
    plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id, WorkoutPlan.user_id == current_user.id
        )
        .first()
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found or access denied.",
        )
    return plan


@router.put(
    "/plans/{plan_id}/activate",
    response_model=WorkoutPlanResponse,
    status_code=status.HTTP_200_OK,
    summary="Set a plan as the current active plan",
)
def activate_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Set the specified plan as active and deactivate all other plans."""
    plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id, WorkoutPlan.user_id == current_user.id
        )
        .first()
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found.",
        )

    # Deactivate others
    db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id
    ).update({"is_active": False})

    plan.is_active = True
    db.commit()
    db.refresh(plan)
    return plan


@router.delete(
    "/plans/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a workout plan",
)
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a workout plan owned by the current user."""
    plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id, WorkoutPlan.user_id == current_user.id
        )
        .first()
    )
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found.",
        )
    db.delete(plan)
    db.commit()
    return None
