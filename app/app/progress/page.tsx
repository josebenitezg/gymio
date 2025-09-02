import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { KpiCard } from "@/components/ui/kpi-card";

export const metadata: Metadata = {
  title: "Progreso",
  description: "Resumen semanal de progreso",
};

export const revalidate = 0;

export default async function ProgressPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Compute simple aggregates from planned data for ahora (placeholder hasta agregar performance real)
  const user = await db.user.upsert({ where: { clerkUserId: userId }, create: { clerkUserId: userId }, update: {} });
  const week = await db.week.findFirst({
    where: { userId: user.id },
    orderBy: { weekStartDate: "desc" },
    include: {
      days: {
        orderBy: { date: "asc" },
        include: {
          exercises: { include: { sets: true }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  if (!week) {
    return <div className="text-sm text-foreground/70">Aún no tenés una semana planificada.</div>;
  }

  const plannedSets = week.days.reduce((acc, d) => acc + d.exercises.reduce((a, e) => a + e.sets.length, 0), 0);
  const plannedVolume = week.days.reduce((acc, d) => acc + d.exercises.reduce((a, e) => a + e.sets.reduce((s, st) => s + st.reps * st.weightKg, 0), 0), 0);

  // Find today's day index comparing YYYY-MM-DD to avoid timezone shifts
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  function fromWeekToIndex(w: { days: { date: Date }[] }) {
    const found = w.days.findIndex((d) => d.date.toISOString().slice(0, 10) === todayStr);
    return found >= 0 ? found : undefined;
  }
  const idx = fromWeekToIndex(week);
  const href = `/app/week${idx !== undefined ? `?index=${idx}` : ""}`;

  // Siguiente ejercicio del día actual (o primero del primero día si no hay hoy)
  const dayForNext = typeof idx === "number" ? week.days[idx] : week.days[0];
  const nextExercise = dayForNext?.exercises?.[0];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tu semana</h1>
        <Link href={href} className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:opacity-90">
          Continuar
        </Link>
      </div>

      {nextExercise && (
        <Link href={href} className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="relative h-16 w-20 overflow-hidden rounded-md border border-white/10 bg-white/5">
            {nextExercise.imageUrl ? (
              <Image src={nextExercise.imageUrl ?? ""} alt={nextExercise.name} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-foreground/50">IMG</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-medium">Siguiente: {nextExercise.name}</div>
            <div className="text-xs text-foreground/60">{nextExercise.sets.length} series • Descanso ~ {Math.round((nextExercise as any).breakSeconds / 60)} min</div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard title="Series planificadas" value={plannedSets} />
        <KpiCard title="Volumen planificado" value={Math.round(plannedVolume)} />
        <KpiCard title="Adherencia" value={<span>—</span>} subtitle="Próximamente" progressRatio={0} />
      </div>
    </div>
  );
}


