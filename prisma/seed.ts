import { addDays, startOfWeek } from "date-fns";
import fs from "node:fs";
import path from "node:path";
import { db } from "../lib/db";
import { loadWeekFromCsv } from "../lib/parsers/csv-plan";

async function main() {
  const csvPath = path.join(process.cwd(), "rutina_planificada.csv");
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }

  const week = await loadWeekFromCsv(csvPath);

  // Upsert Week by weekStartDate
  const weekDate = new Date(week.weekStartDate + "T00:00:00");

  const created = await db.week.upsert({
    where: { weekStartDate: weekDate },
    create: { weekStartDate: weekDate },
    update: {},
  });

  // Clear existing days cascade by deleting and recreating for simplicity
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
      const slug = ex.id; // already slug-like from parser
      const exercise = await db.exercise.create({
        data: {
          name: ex.name,
          slug,
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

  console.log("Seed completed for week:", week.weekStartDate);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  // prisma client is extended and cached, nothing to disconnect explicitly
});


