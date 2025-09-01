import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { loadWeekFromCsv } from "@/lib/parsers/csv-plan";
import { assertWorkoutWeek } from "@/lib/models/workout";
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

  // TODO: In the future, fetch user-specific plan by userId.
  const week = assertWorkoutWeek(await loadWeekFromCsv());

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Tu plan semanal</h1>
      <Suspense fallback={<div className="text-sm text-foreground/70">Cargando…</div>}>
        <DailyView days={week.days} />
      </Suspense>
    </main>
  );
}


