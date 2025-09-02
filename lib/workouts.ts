import { db } from "@/lib/db";
import { type WorkoutWeek } from "@/lib/models/workout";

export async function getCurrentWeekFromDb(): Promise<WorkoutWeek | null> {
  // Use the latest week by weekStartDate
  const week = await db.week.findFirst({
    orderBy: { weekStartDate: "desc" },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          exercises: {
            orderBy: { createdAt: "asc" },
            include: { sets: { orderBy: { setNumber: "asc" } } },
          },
        },
      },
    },
  });

  if (!week) return null;

  const result: WorkoutWeek = {
    weekStartDate: week.weekStartDate.toISOString().slice(0, 10),
    days: week.days.map((d) => ({
      date: d.date.toISOString().slice(0, 10),
      title: d.title,
      notes: d.notes ?? undefined,
      exercises: d.exercises.map((ex) => ({
        id: ex.slug,
        name: ex.name,
        media: { imageUrl: ex.imageUrl ?? undefined, videoUrl: ex.videoUrl ?? undefined },
        breakSeconds: ex.breakSeconds,
        sets: ex.sets.map((s) => ({ setNumber: s.setNumber, reps: s.reps, weightKg: s.weightKg })),
      })),
    })),
  };

  return result;
}


