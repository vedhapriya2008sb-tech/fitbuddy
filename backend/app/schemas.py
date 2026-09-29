"""Pydantic schemas for request validation and response serialization."""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------------------------------------------------
# Auth & User Schemas
# ---------------------------------------------------------
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    created_at: datetime
    has_profile: bool = False


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------------------------------------------------------
# User Profile Schemas
# ---------------------------------------------------------
class UserProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=120)
    gender: Optional[str] = Field(None, max_length=50)
    height_cm: Optional[int] = Field(None, ge=50, le=260)
    weight_kg: Optional[int] = Field(None, ge=20, le=350)
    fitness_experience: Optional[str] = Field(
        None, max_length=50
    )  # beginner, intermediate, advanced
    activity_preferences: Optional[List[str]] = Field(default_factory=list)
    fitness_goals: Optional[str] = Field(
        None, max_length=100
    )  # weight_loss, muscle_gain, etc.
    relevant_limitations: Optional[str] = Field(None, max_length=1000)
    equipment_available: Optional[str] = Field(None, max_length=100)
    target_workout_days_per_week: Optional[int] = Field(3, ge=1, le=7)


class UserProfileUpdate(UserProfileBase):
    pass


class UserProfileResponse(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    updated_at: datetime


# ---------------------------------------------------------
# Fitness Questionnaire & AI Generation Schemas
# ---------------------------------------------------------
class QuestionnaireInput(BaseModel):
    age: int = Field(..., ge=12, le=110, description="User's age in years")
    gender: Optional[str] = Field("prefer_not_to_say", max_length=50)
    fitness_experience: str = Field(
        "beginner", description="beginner, intermediate, or advanced"
    )
    activity_preferences: List[str] = Field(
        default=["strength", "cardio"],
        description="e.g. ['strength', 'hiit', 'yoga']",
    )
    fitness_goals: str = Field(
        ...,
        description="e.g. weight_loss, muscle_gain, endurance, flexibility, general_health",
    )
    relevant_limitations: Optional[str] = Field(
        None, description="e.g., knee pain, asthma, none"
    )
    equipment_available: str = Field(
        "bodyweight_only",
        description="bodyweight_only, dumbbells_only, full_gym",
    )
    target_workout_days_per_week: int = Field(3, ge=1, le=7)
    session_duration_minutes: Optional[int] = Field(45, ge=15, le=120)
    additional_notes: Optional[str] = Field(None, max_length=500)


class ExerciseSchema(BaseModel):
    name: str
    sets: Optional[int] = 3
    reps: Optional[str] = "10-12"
    rest_seconds: Optional[int] = 60
    notes: Optional[str] = None
    beginner_alternative: Optional[str] = None


class DayScheduleSchema(BaseModel):
    day: str  # e.g., "Day 1 - Push", "Day 2 - Active Recovery"
    focus: str  # e.g., "Upper Body Strength"
    warmup: Optional[str] = None
    exercises: List[ExerciseSchema] = Field(default_factory=list)
    cooldown: Optional[str] = None


# ---------------------------------------------------------
# Nutrition Guidance Schemas
# ---------------------------------------------------------
class NutritionGuidanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    guidance_title: str
    guidance_content: Dict[str, Any]
    safety_disclaimer: Optional[str] = None
    created_at: datetime


# ---------------------------------------------------------
# Workout Plan Schemas
# ---------------------------------------------------------
class WorkoutPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plan_title: str
    plan_description: str
    fitness_goal_summary: Optional[str] = None
    workout_schedule: Any  # JSON structure containing days & exercises
    rest_and_recovery: Optional[str] = None
    safety_reminders: Optional[str] = None
    is_active: bool
    created_at: datetime
    nutrition_guidance: Optional[List[NutritionGuidanceResponse]] = None


# ---------------------------------------------------------
# Workout Session Tracking Schemas
# ---------------------------------------------------------
class WorkoutSessionCreate(BaseModel):
    workout_plan_id: Optional[int] = None
    workout_date: datetime
    workout_name: str = Field(..., min_length=2, max_length=255)
    duration: int = Field(..., ge=1, le=600, description="Duration in minutes")
    completion_status: str = Field(
        "completed", description="completed, in_progress, skipped"
    )
    notes: Optional[str] = Field(None, max_length=1000)
    calories_burned: Optional[int] = Field(None, ge=0, le=5000)


class WorkoutSessionUpdate(BaseModel):
    workout_name: Optional[str] = Field(None, min_length=2, max_length=255)
    duration: Optional[int] = Field(None, ge=1, le=600)
    completion_status: Optional[str] = None
    notes: Optional[str] = None
    calories_burned: Optional[int] = None


class WorkoutSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    workout_plan_id: Optional[int] = None
    workout_date: datetime
    workout_name: str
    duration: int
    completion_status: str
    notes: Optional[str] = None
    calories_burned: Optional[int] = None
    created_at: datetime


# ---------------------------------------------------------
# Dashboard Schemas
# ---------------------------------------------------------
class DashboardSummary(BaseModel):
    total_workouts: int
    completed_workouts: int
    total_minutes: int
    estimated_calories: int
    current_streak_days: int
    active_plan: Optional[WorkoutPlanResponse] = None
    latest_nutrition: Optional[NutritionGuidanceResponse] = None
    recent_sessions: List[WorkoutSessionResponse] = Field(default_factory=list)
    user_profile: Optional[UserProfileResponse] = None
