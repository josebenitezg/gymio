import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { assertWorkoutWeek } from "@/lib/models/workout";
import { getCurrentWeekFromDb, seedCurrentWeekForUserFromCsv } from "@/lib/workouts";
import { DailyView } from "@/components/workout/daily-view";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Perfil y plan de entrenamiento",
};

export const revalidate = 0; // dynamic per user

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // TODO: In the future, scope by userId.
  let fromDb = await getCurrentWeekFromDb(userId);
  if (!fromDb) {
    await seedCurrentWeekForUserFromCsv(userId);
    fromDb = await getCurrentWeekFromDb(userId);
  }
  if (!fromDb) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold">Tu plan semanal</h1>
        <div className="text-sm text-foreground/70">No hay plan cargado todavía.</div>
      </main>
    );
  }
  const week = assertWorkoutWeek(fromDb);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Tu plan semanal</h1>
      <Suspense fallback={<div className="text-sm text-foreground/70">Cargando…</div>}>
        <DailyView days={week.days} />
      </Suspense>
    </main>
  );
}


