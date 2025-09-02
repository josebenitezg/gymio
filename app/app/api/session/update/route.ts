import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { resolveExerciseIdForUser } from "@/lib/performance";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, exerciseSlug, setNumber, reps, weightKg } = body as { date: string; exerciseSlug: string; setNumber: number; reps: number; weightKg: number };
  if (!date || !exerciseSlug || !setNumber) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const user = await db.user.upsert({ where: { clerkUserId: userId }, create: { clerkUserId: userId }, update: {} });
  const d = new Date(date + "T00:00:00");
  const session = await db.workoutSession.upsert({ where: { userId_date: { userId: user.id, date: d } }, create: { userId: user.id, date: d }, update: {} });
  const exerciseId = await resolveExerciseIdForUser(user.id, date, exerciseSlug);
  if (!exerciseId) return NextResponse.json({ error: "exercise_not_found" }, { status: 404 });

  const perf = await db.setPerformance.upsert({
    where: { sessionId_exerciseId_setNumber: { sessionId: session.id, exerciseId, setNumber } },
    create: { sessionId: session.id, exerciseId, setNumber, completed: false, reps: reps ?? 0, weightKg: weightKg ?? 0 },
    update: { reps: reps ?? 0, weightKg: weightKg ?? 0 },
  });
  return NextResponse.json({ ok: true, perf });
}


