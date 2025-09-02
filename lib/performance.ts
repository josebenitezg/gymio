import { db } from "@/lib/db";
import { startOfWeek, addDays } from "date-fns";

export async function getOrCreateSession(userId: string, dateISO: string) {
  const date = new Date(dateISO + "T00:00:00");
  return db.workoutSession.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date },
    update: {},
  });
}

export function getWeekRangeFromStart(startISO: string) {
  const start = new Date(startISO + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export async function resolveExerciseIdForUser(userId: string, dateISO: string, exerciseSlug: string) {
  const date = new Date(dateISO + "T00:00:00");
  const day = await db.day.findFirst({ where: { date, week: { userId } } });
  if (!day) return null;
  const ex = await db.exercise.findFirst({ where: { dayId: day.id, slug: exerciseSlug } });
  return ex?.id ?? null;
}


