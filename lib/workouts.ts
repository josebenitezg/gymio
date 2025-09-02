import { db } from "@/lib/db";
import { type WorkoutWeek } from "@/lib/models/workout";
import path from "node:path";
import fs from "node:fs";
import { loadWeekFromCsv } from "@/lib/parsers/csv-plan";

export async function getCurrentWeekFromDb(userId: string): Promise<WorkoutWeek | null> {
  const user = await db.user.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId },
    update: {},
  });

  const week = await db.week.findFirst({
    where: { userId: user.id },
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


export async function seedCurrentWeekForUserFromCsv(userId: string): Promise<void> {
  const user = await db.user.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId },
    update: {},
  });

  const csvPath = path.join(process.cwd(), "rutina_planificada.csv");
  if (!fs.existsSync(csvPath)) return;
  const week = await loadWeekFromCsv(csvPath);

  const weekDate = new Date(week.weekStartDate + "T00:00:00");
  const created = await db.week.upsert({
    where: { userId_weekStartDate: { userId: user.id, weekStartDate: weekDate } },
    create: { weekStartDate: weekDate, userId: user.id },
    update: {},
  });

  await db.day.deleteMany({ where: { weekId: created.id } });
  for (const day of week.days) {
    const dayDate = new Date(day.date + "T00:00:00");
    const dayRow = await db.day.create({
      data: {
        date: dayDate,
        title: day.title,
        notes: day.notes ?? null,
        weekId: created.id,
      },
    });
    for (const ex of day.exercises) {
      const exercise = await db.exercise.create({
        data: {
          name: ex.name,
          slug: ex.id,
          imageUrl: ex.media.imageUrl ?? null,
          videoUrl: ex.media.videoUrl ?? null,
          breakSeconds: ex.breakSeconds,
          dayId: dayRow.id,
        },
      });
      await db.set.createMany({
        data: ex.sets.map((s) => ({
          exerciseId: exercise.id,
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
        })),
      });
    }
  }
}


