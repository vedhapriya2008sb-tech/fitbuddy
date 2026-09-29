export interface WorkoutSession {
  id?: number;
  user_id?: number;
  workout_plan_id?: number | null;
  workout_date: string;
  workout_name: string;
  duration: number; // in minutes
  completion_status: 'completed' | 'in_progress' | 'skipped' | string;
  notes?: string | null;
  calories_burned?: number | null;
  created_at?: string;
}

export interface WorkoutSessionCreate {
  workout_plan_id?: number | null;
  workout_date: string;
  workout_name: string;
  duration: number;
  completion_status: string;
  notes?: string | null;
  calories_burned?: number | null;
}

export interface WorkoutSessionUpdate {
  workout_name?: string;
  duration?: number;
  completion_status?: string;
  notes?: string | null;
  calories_burned?: number | null;
}
