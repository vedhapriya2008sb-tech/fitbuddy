"""SQLAlchemy ORM models for FitBuddy AI."""
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    profile = relationship(
        "UserProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    workout_plans = relationship(
        "WorkoutPlan",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(WorkoutPlan.created_at)",
    )
    workout_sessions = relationship(
        "WorkoutSession",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(WorkoutSession.workout_date)",
    )
    nutrition_guidance = relationship(
        "NutritionGuidance",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(NutritionGuidance.created_at)",
    )


class UserProfile(Base):
    """User profile containing fitness characteristics and preferences."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Integer, nullable=True)
    fitness_experience = Column(
        String(50), nullable=True
    )  # beginner, intermediate, advanced
    activity_preferences = Column(
        JSON, nullable=True
    )  # e.g., ["strength", "cardio", "hiit", "yoga"]
    fitness_goals = Column(
        String(100), nullable=True
    )  # weight_loss, muscle_gain, endurance, etc.
    relevant_limitations = Column(
        Text, nullable=True
    )  # injuries, physical restrictions
    equipment_available = Column(
        String(100), nullable=True
    )  # gym, dumbbells, bodyweight
    target_workout_days_per_week = Column(Integer, default=3, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # Relationship
    user = relationship("User", back_populates="profile")


class WorkoutPlan(Base):
    """AI-generated workout plan."""
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    plan_title = Column(String(255), nullable=False)
    plan_description = Column(Text, nullable=False)
    fitness_goal_summary = Column(Text, nullable=True)
    workout_schedule = Column(
        JSON, nullable=False
    )  # structured weekly schedule
    rest_and_recovery = Column(Text, nullable=True)
    safety_reminders = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="workout_plans")
    sessions = relationship("WorkoutSession", back_populates="workout_plan")
    nutrition_guidance = relationship(
        "NutritionGuidance", back_populates="workout_plan"
    )


class WorkoutSession(Base):
    """Daily logged workout activity."""
    __tablename__ = "workout_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    workout_plan_id = Column(
        Integer,
        ForeignKey("workout_plans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    workout_date = Column(DateTime(timezone=True), nullable=False)
    workout_name = Column(String(255), nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    completion_status = Column(
        String(50), nullable=False, default="completed"
    )  # completed, in_progress, skipped
    notes = Column(Text, nullable=True)
    calories_burned = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="workout_sessions")
    workout_plan = relationship("WorkoutPlan", back_populates="sessions")


class NutritionGuidance(Base):
    """AI-generated general nutrition and hydration guidance."""
    __tablename__ = "nutrition_guidances"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    workout_plan_id = Column(
        Integer,
        ForeignKey("workout_plans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    guidance_title = Column(String(255), nullable=False)
    guidance_content = Column(
        JSON, nullable=False
    )  # structured hydration, macro advice, tips
    safety_disclaimer = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="nutrition_guidance")
    workout_plan = relationship(
        "WorkoutPlan", back_populates="nutrition_guidance"
    )
