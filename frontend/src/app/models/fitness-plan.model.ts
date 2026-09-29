export interface QuestionnaireInput {
  age: number;
  gender?: string;
  fitness_experience: string;
  activity_preferences: string[];
  fitness_goals: string;
  relevant_limitations?: string;
  equipment_available: string;
  target_workout_days_per_week: number;
  session_duration_minutes?: number;
  additional_notes?: string;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  rest_seconds?: number;
  notes?: string;
  beginner_alternative?: string;
}

export interface DaySchedule {
  day: string;
  focus: string;
  warmup?: string;
  exercises: Exercise[];
  cooldown?: string;
}

export interface NutritionGuidanceContent {
  title?: string;
  daily_calories_focus?: string;
  macronutrient_distribution?: string;
  hydration_guidelines?: string;
  pre_workout_fuel?: string;
  post_workout_recovery?: string;
  key_habits?: string[];
  safety_disclaimer?: string;
}

export interface NutritionGuidance {
  id: number;
  guidance_title: string;
  guidance_content: NutritionGuidanceContent;
  safety_disclaimer?: string;
  created_at: string;
}

export interface WorkoutPlan {
  id: number;
  user_id: number;
  plan_title: string;
  plan_description: string;
  fitness_goal_summary?: string;
  workout_schedule: DaySchedule[];
  rest_and_recovery?: string;
  safety_reminders?: string;
  is_active: boolean;
  created_at: string;
  nutrition_guidance?: NutritionGuidance[];
}
