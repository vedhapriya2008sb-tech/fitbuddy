"""Gemini AI Fitness Plan and Nutrition Guidance Generation Service."""
import json
import logging
import re
from typing import Any, Dict
from app.core.config import settings
from app.schemas import QuestionnaireInput

logger = logging.getLogger(__name__)


def generate_fallback_plan(q: QuestionnaireInput) -> Dict[str, Any]:
    """Generate a high-quality, scientifically structured fitness and nutrition plan

    used when the Gemini API key is unset or external API is unavailable.
    """
    goal_labels = {
        "weight_loss": "Fat Loss & Conditioning",
        "muscle_gain": "Hypertrophy & Strength Building",
        "endurance": "Cardiovascular Endurance & Stamina",
        "flexibility": "Mobility, Balance & Flexibility",
        "general_health": "Holistic Longevity & Functional Fitness",
    }
    goal_name = goal_labels.get(q.fitness_goals, q.fitness_goals.replace("_", " ").title())

    limitations_text = (
        f"Customized with safety modifications for: {q.relevant_limitations}"
        if q.relevant_limitations and q.relevant_limitations.lower() not in ("none", "no", "n/a")
        else "No physical limitations reported."
    )

    days_count = max(1, min(7, q.target_workout_days_per_week))
    duration = q.session_duration_minutes or 45

    # Base exercise pools according to equipment
    equipment_mode = q.equipment_available.lower()

    if "gym" in equipment_mode:
        upper_exercises = [
            {
                "name": "Dumbbell or Barbell Bench Press",
                "sets": 3,
                "reps": "8-12",
                "rest_seconds": 90,
                "notes": "Keep shoulders retracted and feet planted firmly.",
                "beginner_alternative": "Machine Chest Press or Dumbbell Floor Press",
            },
            {
                "name": "Lat Pulldown or Seated Cable Row",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 60,
                "notes": "Drive elbows down towards hips; engage lats.",
                "beginner_alternative": "Resistance Band Lat Pulldown",
            },
            {
                "name": "Dumbbell Overhead Shoulder Press",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 60,
                "notes": "Brace core; avoid arching the lower back.",
                "beginner_alternative": "Seated Dumbbell Press with light weights",
            },
            {
                "name": "Dumbbell Bicep Curls & Tricep Rope Pushdowns",
                "sets": 3,
                "reps": "12-15",
                "rest_seconds": 45,
                "notes": "Superset with controlled tempo (2 sec eccentric).",
                "beginner_alternative": "Light dumbbell hammer curls",
            },
        ]
        lower_exercises = [
            {
                "name": "Goblet Squats or Barbell Back Squat",
                "sets": 3,
                "reps": "8-12",
                "rest_seconds": 90,
                "notes": "Hips back, chest tall, knees tracking over toes.",
                "beginner_alternative": "Bodyweight Box Squat",
            },
            {
                "name": "Romanian Deadlifts (Dumbbell or Barbell)",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 75,
                "notes": "Hinge at the hips with flat spine; feel hamstring stretch.",
                "beginner_alternative": "Glute Bridges from the floor",
            },
            {
                "name": "Walking Lunges or Bulgarian Split Squats",
                "sets": 3,
                "reps": "10 reps per leg",
                "rest_seconds": 60,
                "notes": "Maintain balance; step comfortably deep.",
                "beginner_alternative": "Static Split Squats holding a wall",
            },
            {
                "name": "Plank & Hanging Knee Raises",
                "sets": 3,
                "reps": "30-45s / 12 reps",
                "rest_seconds": 45,
                "notes": "Full core brace; avoid sagging hips.",
                "beginner_alternative": "Kneeling Plank or Dead Bug",
            },
        ]
    elif "dumbbell" in equipment_mode:
        upper_exercises = [
            {
                "name": "Dumbbell Floor Press",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 60,
                "notes": "Safe on shoulders, excellent chest and tricep stimulus.",
                "beginner_alternative": "Incline Push-ups on sturdy table/counter",
            },
            {
                "name": "Dumbbell Bent-Over Rows",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 60,
                "notes": "Flat spine, squeeze shoulder blades together at top.",
                "beginner_alternative": "Single-Arm Supported Row on couch/bench",
            },
            {
                "name": "Dumbbell Lateral & Front Raises",
                "sets": 3,
                "reps": "12-15",
                "rest_seconds": 45,
                "notes": "Control the descent; do not use momentum.",
                "beginner_alternative": "Bodyweight arm circles and isometric hold",
            },
            {
                "name": "Overhead Dumbbell Tricep Extension",
                "sets": 3,
                "reps": "12-15",
                "rest_seconds": 45,
                "notes": "Keep elbows pointing forward.",
                "beginner_alternative": "Chair or bench tricep dips",
            },
        ]
        lower_exercises = [
            {
                "name": "Dumbbell Goblet Squats",
                "sets": 3,
                "reps": "10-15",
                "rest_seconds": 60,
                "notes": "Hold weight close to sternum, sink into deep squat.",
                "beginner_alternative": "Bodyweight air squats",
            },
            {
                "name": "Dumbbell Romanian Deadlift",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 60,
                "notes": "Push hips back like closing a door behind you.",
                "beginner_alternative": "Good mornings without weight",
            },
            {
                "name": "Dumbbell Reverse Lunges",
                "sets": 3,
                "reps": "10 each side",
                "rest_seconds": 60,
                "notes": "Gentle on knees compared to forward lunges.",
                "beginner_alternative": "Step-ups onto a low sturdy step",
            },
            {
                "name": "Plank with Shoulder Taps",
                "sets": 3,
                "reps": "16 total taps",
                "rest_seconds": 45,
                "notes": "Minimize hip rocking while tapping shoulders.",
                "beginner_alternative": "Kneeling plank",
            },
        ]
    else:  # Bodyweight only
        upper_exercises = [
            {
                "name": "Standard or Incline Push-ups",
                "sets": 3,
                "reps": "8-15",
                "rest_seconds": 60,
                "notes": "Maintain rigid plank line from head to heels.",
                "beginner_alternative": "Wall push-ups or Knee push-ups",
            },
            {
                "name": "Doorframe Rows / Towel Isometric Rows",
                "sets": 3,
                "reps": "12-15",
                "rest_seconds": 60,
                "notes": "Grip doorframe securely; squeeze back muscles.",
                "beginner_alternative": "Floor Prone Cobras (back extensions)",
            },
            {
                "name": "Pike Push-ups (Shoulder Focus)",
                "sets": 3,
                "reps": "8-10",
                "rest_seconds": 60,
                "notes": "Elevate hips high in an inverted V shape.",
                "beginner_alternative": "High Plank Hold (30-45 seconds)",
            },
            {
                "name": "Chair or Sturdy Bench Dips",
                "sets": 3,
                "reps": "10-12",
                "rest_seconds": 45,
                "notes": "Keep back close to the bench; 90 degree elbow bend.",
                "beginner_alternative": "Overhead reaches and diamond hold",
            },
        ]
        lower_exercises = [
            {
                "name": "Bodyweight Squats with 2s Pause",
                "sets": 3,
                "reps": "15-20",
                "rest_seconds": 60,
                "notes": "Pause at the bottom to build endurance and form.",
                "beginner_alternative": "Chair Sit-to-Stands",
            },
            {
                "name": "Single-Leg Glute Bridges",
                "sets": 3,
                "reps": "10-12 each leg",
                "rest_seconds": 45,
                "notes": "Drive through the heel; squeeze glutes at peak.",
                "beginner_alternative": "Standard Double-Leg Glute Bridge",
            },
            {
                "name": "Alternating Reverse Lunges",
                "sets": 3,
                "reps": "12 each leg",
                "rest_seconds": 60,
                "notes": "Controlled movement; keep chest proud.",
                "beginner_alternative": "Wall-supported split squat",
            },
            {
                "name": "Bicycle Crunches & Bird-Dogs",
                "sets": 3,
                "reps": "15 reps / 10 each side",
                "rest_seconds": 45,
                "notes": "Focus on slow, rotational control rather than speed.",
                "beginner_alternative": "Dead Bug exercise with slow reach",
            },
        ]

    cardio_core_exercises = [
        {
            "name": "Low-Impact Jumping Jacks or Step Jacks",
            "sets": 3,
            "reps": "45 seconds",
            "rest_seconds": 30,
            "notes": "Soft landing on the balls of your feet.",
            "beginner_alternative": "Side-to-side step touches with arm raises",
        },
        {
            "name": "Mountain Climbers (Paced)",
            "sets": 3,
            "reps": "30-40 seconds",
            "rest_seconds": 45,
            "notes": "Drive knees smoothly towards chest; maintain solid plank.",
            "beginner_alternative": "Elevated mountain climbers on bench",
        },
        {
            "name": "Bodyweight Skater Hops or Lateral Steps",
            "sets": 3,
            "reps": "40 seconds",
            "rest_seconds": 45,
            "notes": "Great for lateral stability and heart rate elevation.",
            "beginner_alternative": "Lateral side-step lunges",
        },
        {
            "name": "Forearm Plank Hold",
            "sets": 3,
            "reps": "30-60 seconds",
            "rest_seconds": 45,
            "notes": "Draw belly button inward; steady breathing.",
            "beginner_alternative": "Kneeling forearm plank",
        },
    ]

    weekly_schedule = []
    day_titles = [
        f"Day {i+1}" for i in range(days_count)
    ]

    for i in range(days_count):
        if i % 3 == 0:
            weekly_schedule.append({
                "day": f"{day_titles[i]} - Upper Body & Core Strength",
                "focus": "Upper body push/pull mechanics, posture and core activation",
                "warmup": "5-8 min: Arm circles, cat-cow stretch, thoracic spine rotations, light jumping or marching in place.",
                "exercises": upper_exercises,
                "cooldown": "5 min: Chest stretch in doorway, child's pose, and overhead tricep stretch.",
            })
        elif i % 3 == 1:
            weekly_schedule.append({
                "day": f"{day_titles[i]} - Lower Body & Stability Focus",
                "focus": "Leg strength, hip mobility, glute activation and balance",
                "warmup": "5-8 min: Leg swings, hip openers, bodyweight glute bridges, light ankle mobility drills.",
                "exercises": lower_exercises,
                "cooldown": "5 min: Seated hamstring stretch, quad stretch against wall, figure-four hip opener.",
            })
        else:
            weekly_schedule.append({
                "day": f"{day_titles[i]} - Conditioning, Core & Active Mobility",
                "focus": "Aerobic conditioning, dynamic core strength and full-body mobility",
                "warmup": "5 min: High knees march, gentle torso twists, shoulder shrugs.",
                "exercises": cardio_core_exercises,
                "cooldown": "5 min: Cobra stretch, butterfly seated stretch, deep diaphragmatic breathing.",
            })

    # Age and goal adaptation for calorie and macro guidance
    calorie_strategy = (
        "Moderate caloric deficit (approx. 300-500 kcal below maintenance) prioritizing whole foods."
        if q.fitness_goals == "weight_loss"
        else "Slight caloric surplus (approx. 200-300 kcal above maintenance) with ample protein."
        if q.fitness_goals == "muscle_gain"
        else "Maintenance energy intake tailored for sustained vitality and steady energy levels."
    )

    protein_target = (
        "1.6 - 2.0g per kg of bodyweight"
        if q.fitness_goals in ("muscle_gain", "weight_loss")
        else "1.2 - 1.6g per kg of bodyweight"
    )

    return {
        "plan_title": f"Personalized {goal_name} Routine ({days_count} Days/Week)",
        "plan_description": (
            f"Scientifically structured for a {q.age}-year-old with {q.fitness_experience} experience, "
            f"utilizing {q.equipment_available.replace('_', ' ')}. "
            f"Designed for {duration}-minute sessions targeting {goal_name.lower()}. {limitations_text}"
        ),
        "fitness_goal_summary": (
            f"Primary focus is {goal_name}. Workouts emphasize safe progressive overload, "
            f"functional joint stability, and aerobic conditioning tailored to your current fitness level."
        ),
        "workout_schedule": weekly_schedule,
        "rest_and_recovery": (
            "Take at least 1-2 full rest days per week. Prioritize 7-9 hours of uninterrupted sleep for "
            "tissue repair and nervous system recovery. Engage in light walking or gentle mobility on off days."
        ),
        "safety_reminders": (
            "Always warm up prior to lifting or high-intensity intervals. If any movement produces sharp or pinching pain, "
            "cease immediately and substitute the recommended beginner/low-impact alternative. "
            "Stay well hydrated throughout every session. This plan is not a substitute for clinical medical evaluation."
        ),
        "nutrition_guidance": {
            "title": f"Fueling Guide for {goal_name}",
            "daily_calories_focus": calorie_strategy,
            "macronutrient_distribution": (
                f"Protein: {protein_target} to support recovery. Carbohydrates: 40-50% from complex sources (oats, brown rice, sweet potatoes). "
                "Healthy Fats: 25-30% from olive oil, avocados, nuts, and seeds."
            ),
            "hydration_guidelines": (
                f"Consume approximately 2.5 to 3.5 liters (80-120 oz) of fresh water daily, increasing intake by 500ml "
                f"on days you complete your {duration}-minute training session."
            ),
            "pre_workout_fuel": (
                "60-90 minutes prior to training: a balanced snack containing easily digestible carbohydrates and light protein "
                "(e.g., banana with a spoon of peanut butter, or oatmeal with Greek yogurt)."
            ),
            "post_workout_recovery": (
                "Within 45-60 minutes following exercise: prioritize 20-30g of quality protein combined with complex carbs "
                "to replenish muscle glycogen and initiate muscle protein synthesis."
            ),
            "key_habits": [
                "Aim for a consistent daily meal schedule to regulate blood sugar.",
                "Include a portion of colorful vegetables or leafy greens with lunch and dinner.",
                "Limit sugary beverages, refined flours, and ultra-processed snacks.",
                "Listen to internal satiety cues—eat until 80% satisfied.",
            ],
            "safety_disclaimer": (
                "Disclaimer: FitBuddy AI general nutrition information is intended for educational purposes only. "
                "Always consult a registered dietitian, physician, or qualified healthcare professional before "
                "undertaking significant dietary alterations or if you have specific metabolic conditions."
            ),
        },
    }


def clean_gemini_json(raw_text: str) -> str:
    """Clean markdown code block wrappers from Gemini output."""
    cleaned = raw_text.strip()
    # Strip ```json ... ``` or ``` ... ```
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def generate_fitness_plan_gemini(questionnaire: QuestionnaireInput) -> Dict[str, Any]:
    """Call Google Gemini API using the official SDK to generate a custom fitness plan

    and nutrition guidance, falling back cleanly to the built-in generator if the API is unavailable.
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    if not api_key:
        logger.info(
            "GEMINI_API_KEY not configured. Using high-quality built-in FitBuddy AI generation engine."
        )
        return generate_fallback_plan(questionnaire)

    prompt = f"""
Act as an expert certified personal trainer, sports physiologist, and sports nutritionist.
Create a comprehensive, age-appropriate, realistic, and safe fitness workout plan and general nutrition guidance for the following individual:

User Profile:
- Age: {questionnaire.age}
- Gender: {questionnaire.gender or 'Not specified'}
- Experience Level: {questionnaire.fitness_experience}
- Primary Goal: {questionnaire.fitness_goals}
- Activity Preferences: {", ".join(questionnaire.activity_preferences) if questionnaire.activity_preferences else "General"}
- Equipment Available: {questionnaire.equipment_available}
- Workout Days Per Week: {questionnaire.target_workout_days_per_week}
- Target Session Duration: {questionnaire.session_duration_minutes or 45} minutes
- Limitations / Health Precautions: {questionnaire.relevant_limitations or 'None reported'}
- Additional Notes: {questionnaire.additional_notes or 'None'}

CRITICAL GUIDELINES:
1. Tailor the workout schedule specifically for {questionnaire.target_workout_days_per_week} days per week.
2. Match exercises precisely with available equipment ({questionnaire.equipment_available}).
3. For every exercise, include sets, reps (or duration), rest time in seconds, form notes, and a beginner/safe alternative.
4. Adapt intensity for a {questionnaire.age}-year-old with {questionnaire.fitness_experience} experience.
5. Provide actionable hydration and nutritional guidance (not medical prescriptions). Avoid extreme diets or unverified supplements.
6. Provide clear safety reminders and state that this is not medical advice.

You MUST respond strictly with valid JSON conforming to the following structure with no extra conversational text:
{{
  "plan_title": "string",
  "plan_description": "string",
  "fitness_goal_summary": "string",
  "rest_and_recovery": "string",
  "safety_reminders": "string",
  "workout_schedule": [
    {{
      "day": "Day 1 - Focus Name",
      "focus": "Specific muscle groups or endurance focus",
      "warmup": "Warmup routine instructions",
      "exercises": [
        {{
          "name": "Exercise Name",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "notes": "Coaching cues and form tips",
          "beginner_alternative": "Easier variation"
        }}
      ],
      "cooldown": "Cooldown and mobility stretches"
    }}
  ],
  "nutrition_guidance": {{
    "title": "Nutrition title",
    "daily_calories_focus": "General caloric balance advice",
    "macronutrient_distribution": "Protein, carbs, healthy fats guidance",
    "hydration_guidelines": "Hydration advice in liters/oz",
    "pre_workout_fuel": "Pre-workout meal/snack guidance",
    "post_workout_recovery": "Post-workout recovery guidance",
    "key_habits": [
      "Habit 1",
      "Habit 2",
      "Habit 3"
    ],
    "safety_disclaimer": "Informational disclaimer"
  }}
}}
"""

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7,
            ),
        )

        response_text = response.text or ""
        cleaned_json = clean_gemini_json(response_text)
        data = json.loads(cleaned_json)

        # Validate minimum expected structure
        if "workout_schedule" not in data or "nutrition_guidance" not in data:
            raise ValueError("Incomplete JSON schema returned from Gemini model")

        return data

    except Exception as exc:
        logger.warning(
            f"Gemini API request failed or timed out ({type(exc).__name__}: {exc}). "
            "Falling back to built-in generator."
        )
        fallback = generate_fallback_plan(questionnaire)
        fallback["plan_title"] += " (FitBuddy Engine)"
        return fallback
