import { type WorkoutWeek } from "@/lib/models/workout";

// Seed plan derived from the provided .docx structure (approximate placeholders)
export const demoWeek: WorkoutWeek = {
  weekStartDate: "2025-01-13",
  days: [
    {
      date: "2025-01-13",
      title: "Chest & Triceps",
      exercises: [
        {
          id: "bench-press",
          name: "Barbell Bench Press",
          media: { imageUrl: "https://placehold.co/400x260.png" },
          breakSeconds: 120,
          sets: [
            { setNumber: 1, reps: 12, weightKg: 80 },
            { setNumber: 2, reps: 10, weightKg: 90 },
            { setNumber: 3, reps: 8, weightKg: 100 },
            { setNumber: 4, reps: 6, weightKg: 110 },
          ],
        },
      ],
    },
    {
      date: "2025-01-14",
      title: "Back & Biceps",
      exercises: [
        {
          id: "deadlift",
          name: "Romanian Deadlift",
          media: { videoUrl: "https://example.com/video.mp4" },
          breakSeconds: 120,
          sets: [
            { setNumber: 1, reps: 12, weightKg: 60 },
            { setNumber: 2, reps: 10, weightKg: 70 },
            { setNumber: 3, reps: 8, weightKg: 80 },
          ],
        },
      ],
    },
    {
      date: "2025-01-15",
      title: "Legs",
      exercises: [
        {
          id: "squat",
          name: "Back Squat",
          media: { imageUrl: "https://placehold.co/400x260.png" },
          breakSeconds: 150,
          sets: [
            { setNumber: 1, reps: 10, weightKg: 80 },
            { setNumber: 2, reps: 8, weightKg: 100 },
            { setNumber: 3, reps: 6, weightKg: 110 },
          ],
        },
      ],
    },
  ],
};



