import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { assertWorkoutWeek } from "@/lib/models/workout";
import { getCurrentWeekFromDb, seedCurrentWeekForUserFromCsv } from "@/lib/workouts";
import { DailyView } from "@/components/workout/daily-view";

export const metadata: Metadata = {
  title: "Semana",
  description: "Tu plan semanal",
};

export const revalidate = 0;

function parseISODateLocal(input: string): Date {
  const [y, m, d] = input.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export default async function WeekPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  let fromDb = await getCurrentWeekFromDb(userId);
  if (!fromDb) {
    await seedCurrentWeekForUserFromCsv(userId);
    fromDb = await getCurrentWeekFromDb(userId);
  }

  if (!fromDb) {
    return (
      <div className="text-sm text-foreground/70">No hay plan cargado todavía.</div>
    );
  }
  const week = assertWorkoutWeek(fromDb);

  // Determine initial day index
  let initialIndex = 0;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const exactIdx = week.days.findIndex((d) => d.date === todayStr);
  if (exactIdx >= 0) initialIndex = exactIdx;

  const qp = (await searchParams) ?? {};
  const fromQuery = typeof qp["index"] === "string" ? Number(qp["index"]) : undefined;
  if (typeof fromQuery === "number" && Number.isFinite(fromQuery) && fromQuery >= 0 && fromQuery < week.days.length) {
    initialIndex = fromQuery;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Tu plan semanal</h1>
      <Suspense fallback={<div className="text-sm text-foreground/70">Cargando…</div>}>
        <DailyView days={week.days} initialIndex={initialIndex} />
      </Suspense>
    </div>
  );
}


