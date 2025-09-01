import { z } from "zod";

// Core domain types for workouts. These are DB-ready and validated end-to-end.

export const workoutSetSchema = z.object({
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive(),
  weightKg: z.number().nonnegative(),
});

export type WorkoutSet = z.infer<typeof workoutSetSchema>;

export const workoutExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  media: z.object({
    imageUrl: z.string().url().optional(),
    videoUrl: z.string().url().optional(),
  }),
  breakSeconds: z.number().int().nonnegative().default(0),
  sets: z.array(workoutSetSchema).min(1),
});

export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>;

export const workoutDaySchema = z.object({
  date: z.string().min(1), // ISO date (yyyy-mm-dd)
  title: z.string().min(1),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema).min(1),
});

export type WorkoutDay = z.infer<typeof workoutDaySchema>;

export const workoutWeekSchema = z.object({
  weekStartDate: z.string().min(1), // Monday ISO date
  days: z.array(workoutDaySchema).min(1),
});

export type WorkoutWeek = z.infer<typeof workoutWeekSchema>;

// Utilities to help with UI and eventual DB adapters
export function assertWorkoutWeek(input: unknown): WorkoutWeek {
  return workoutWeekSchema.parse(input);
}

export function formatBreak(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0 && secs > 0) return `${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m`;
  return `${secs}s`;
}



