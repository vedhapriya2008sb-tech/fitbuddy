"""Seed script to populate initial demo data for FitBuddy AI."""
from datetime import datetime, timedelta, timezone
from app.database import SessionLocal, init_db
from app.core.security import hash_password
from app.models import User, UserProfile, WorkoutPlan, WorkoutSession, NutritionGuidance

def seed_database():
    print("Initializing database...")
    init_db()
    db = SessionLocal()

    try:
        # Check if demo user exists
        demo_email = "demo@fitbuddy.ai"
        user = db.query(User).filter(User.email == demo_email).first()

        if not user:
            print(f"Creating demo user: {demo_email}")
            user = User(
                name="Jordan Flex",
                email=demo_email,
                hashed_password=hash_password("DemoPass123!"),
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            # Create User Profile
            profile = UserProfile(
                user_id=user.id,
                age=27,
                gender="Non-binary",
                height_cm=175,
                weight_kg=72,
                fitness_experience="intermediate",
                activity_preferences=["strength", "hiit", "mobility"],
                fitness_goals="muscle_gain",
                relevant_limitations="none",
                equipment_available="full_gym",
                target_workout_days_per_week=4
            )
            db.add(profile)

            # Create Workout Plan
            plan = WorkoutPlan(
                user_id=user.id,
                plan_title="4-Day Hypertrophy & Functional Conditioning",
                plan_description="Balanced aesthetic physique development with cardiovascular stamina.",
                fitness_goal_summary="Muscle growth with lean body composition retention.",
                workout_schedule=[
                    {
                        "day": "Day 1 - Push Focus",
                        "focus": "Chest, Shoulders & Triceps",
                        "warmup": "Arm circles, band pull-aparts, light pushups (5 mins)",
                        "exercises": [
                            {"name": "Barbell Bench Press", "sets": 4, "reps": "8-10", "rest_seconds": 90, "notes": "Control tempo, 2s descent", "beginner_alternative": "Dumbbell Floor Press"},
                            {"name": "Incline Dumbbell Press", "sets": 3, "reps": "10-12", "rest_seconds": 75, "notes": "Focus on upper chest squeeze", "beginner_alternative": "Push-ups"},
                            {"name": "Overhead Dumbbell Press", "sets": 3, "reps": "10-12", "rest_seconds": 60, "notes": "Core braced", "beginner_alternative": "Machine Shoulder Press"},
                            {"name": "Cable Tricep Pushdown", "sets": 3, "reps": "12-15", "rest_seconds": 45, "notes": "Lock elbows at sides", "beginner_alternative": "Bench Dips"}
                        ],
                        "cooldown": "Chest doorway stretch and tricep overhead stretch (5 mins)"
                    },
                    {
                        "day": "Day 2 - Pull Focus",
                        "focus": "Back, Biceps & Rear Delts",
                        "warmup": "Cat-cow stretches, thoracic rotations, lat activation (5 mins)",
                        "exercises": [
                            {"name": "Lat Pulldown or Pull-ups", "sets": 4, "reps": "8-10", "rest_seconds": 90, "notes": "Full scapular depression", "beginner_alternative": "Band Assisted Pull-ups"},
                            {"name": "Seated Cable Row", "sets": 3, "reps": "10-12", "rest_seconds": 75, "notes": "Pull to lower ribs", "beginner_alternative": "Dumbbell Bent-over Row"},
                            {"name": "Face Pulls", "sets": 3, "reps": "15", "rest_seconds": 45, "notes": "External rotation focus", "beginner_alternative": "Band Pull-aparts"},
                            {"name": "Incline Dumbbell Bicep Curl", "sets": 3, "reps": "12", "rest_seconds": 45, "notes": "Full stretch at bottom", "beginner_alternative": "Standing Hammer Curls"}
                        ],
                        "cooldown": "Child's pose and lat stretch against a post"
                    },
                    {
                        "day": "Day 3 - Legs & Core",
                        "focus": "Quadriceps, Hamstrings & Calves",
                        "warmup": "Leg swings, bodyweight squats, hip openers (5 mins)",
                        "exercises": [
                            {"name": "Barbell Back Squat", "sets": 4, "reps": "8-10", "rest_seconds": 120, "notes": "Depth at parallel or below", "beginner_alternative": "Goblet Squat"},
                            {"name": "Romanian Deadlift", "sets": 3, "reps": "10-12", "rest_seconds": 90, "notes": "Hinge hips back, feel hamstrings", "beginner_alternative": "Glute Bridges"},
                            {"name": "Walking Lunges", "sets": 3, "reps": "12/leg", "rest_seconds": 60, "notes": "Upright torso", "beginner_alternative": "Static Split Squats"},
                            {"name": "Hanging Knee Raises", "sets": 3, "reps": "15", "rest_seconds": 45, "notes": "Avoid swinging", "beginner_alternative": "Lying Leg Raises"}
                        ],
                        "cooldown": "Hamstring and quad stretches"
                    },
                    {
                        "day": "Day 4 - Full Body Conditioning",
                        "focus": "Metabolic Conditioning & Functional Core",
                        "warmup": "Jumping jacks, high knees, inchworms (5 mins)",
                        "exercises": [
                            {"name": "Kettlebell Swings", "sets": 4, "reps": "15-20", "rest_seconds": 60, "notes": "Explosive hip hinge", "beginner_alternative": "Dumbbell Swings"},
                            {"name": "Dumbbell Thrusters", "sets": 3, "reps": "10-12", "rest_seconds": 60, "notes": "Smooth transition from squat to press", "beginner_alternative": "Squat to Overhead Reach"},
                            {"name": "Plank with Shoulder Taps", "sets": 3, "reps": "20 taps", "rest_seconds": 45, "notes": "Keep hips stable", "beginner_alternative": "Kneeling Plank"}
                        ],
                        "cooldown": "Full body yoga flow"
                    }
                ],
                rest_and_recovery="Prioritize 7-8 hours of sleep. Stay hydrated with 2.5-3.5L of water daily. Active recovery walk on off days.",
                safety_reminders="Perform warm-ups before load. Never sacrifice form for heavier weights. Consult a physician before starting any new regimen.",
                is_active=True
            )
            db.add(plan)
            db.flush()

            # Create Nutrition Guidance
            nutrition = NutritionGuidance(
                user_id=user.id,
                workout_plan_id=plan.id,
                guidance_title="High-Protein Athletic Fueling Guide",
                guidance_content={
                    "title": "Lean Muscle & Recovery Protocol",
                    "daily_calories_focus": "Target ~2,400 to 2,600 kcal for lean muscle synthesis.",
                    "macronutrient_distribution": "Protein: 1.8g-2.0g per kg bodyweight (~140g), Carbohydrates: 45-50%, Healthy Fats: 25-30%.",
                    "hydration_guidelines": "Drink 3.0 Liters of water daily, adding electrolytes during intense summer sessions.",
                    "pre_workout_fuel": "Complex carb snack 60-90 mins prior (e.g., oatmeal with banana or rice cakes with peanut butter).",
                    "post_workout_recovery": "Whey or plant protein shake + fast digesting carbohydrate within 45 mins of training.",
                    "key_habits": [
                        "Distribute protein evenly across 4 meals per day.",
                        "Incorporate colorful vegetables with lunch and dinner for micronutrients.",
                        "Limit ultra-processed sugary snacks to preserve metabolic flexibility."
                    ]
                },
                safety_disclaimer="FitBuddy AI nutrition recommendations are for educational and informational purposes only."
            )
            db.add(nutrition)

            # Create Workout Sessions for the last 3 days to establish a streak
            now = datetime.now(timezone.utc)
            sessions = [
                WorkoutSession(
                    user_id=user.id,
                    workout_plan_id=plan.id,
                    workout_date=now - timedelta(days=2),
                    workout_name="Push Focus - Chest & Delts",
                    duration=50,
                    completion_status="completed",
                    calories_burned=390,
                    notes="Solid session, hit all bench press targets."
                ),
                WorkoutSession(
                    user_id=user.id,
                    workout_plan_id=plan.id,
                    workout_date=now - timedelta(days=1),
                    workout_name="Pull Focus - Back & Biceps",
                    duration=48,
                    completion_status="completed",
                    calories_burned=360,
                    notes="Felt good on weighted pull-ups."
                ),
                WorkoutSession(
                    user_id=user.id,
                    workout_plan_id=plan.id,
                    workout_date=now,
                    workout_name="Legs & Core Power",
                    duration=55,
                    completion_status="completed",
                    calories_burned=430,
                    notes="Heavy back squats felt smooth."
                )
            ]
            for s in sessions:
                db.add(s)

            db.commit()
            print("Demo seed completed successfully!")
            print(f"Credentials -> Email: {demo_email} | Password: DemoPass123!")
        else:
            print("Demo user already exists.")

    except Exception as exc:
        db.rollback()
        print(f"Error seeding database: {exc}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
