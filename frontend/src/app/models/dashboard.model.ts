import { UserProfile } from './profile.model';
import { NutritionGuidance, WorkoutPlan } from './fitness-plan.model';
import { WorkoutSession } from './workout.model';

export interface DashboardSummary {
  total_workouts: number;
  completed_workouts: number;
  total_minutes: number;
  estimated_calories: number;
  current_streak_days: number;
  active_plan?: WorkoutPlan | null;
  latest_nutrition?: NutritionGuidance | null;
  recent_sessions: WorkoutSession[];
  user_profile?: UserProfile | null;
}
