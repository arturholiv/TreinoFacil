import type { DayOfWeekKey } from "@/lib/constants/weekdays";

export type WorkoutRow = {
  id: string;
  user_id: string;
  name: string;
  /** Regras gerais da ficha; aplicam-se a todos os exercícios do treino. */
  notes: string;
  day_of_week: DayOfWeekKey;
  created_at: string;
};

export type ExerciseRow = {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes: string;
};

export type ExerciseLogRow = {
  id: string;
  user_id: string;
  exercise_id: string;
  log_date: string;
  completed: boolean;
};

export type ExerciseDraft = {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes: string;
};
