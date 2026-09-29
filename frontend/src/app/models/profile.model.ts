export interface UserProfile {
  id?: number;
  user_id?: number;
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  fitness_experience?: string | null; // 'beginner' | 'intermediate' | 'advanced'
  activity_preferences?: string[];
  fitness_goals?: string | null; // 'weight_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'general_health'
  relevant_limitations?: string | null;
  equipment_available?: string | null; // 'bodyweight_only' | 'dumbbells_only' | 'full_gym'
  target_workout_days_per_week?: number;
  updated_at?: string;
}
