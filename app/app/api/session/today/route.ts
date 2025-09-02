import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.upsert({ where: { clerkUserId: userId }, create: { clerkUserId: userId }, update: {} });

  const today = new Date();
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const session = await db.workoutSession.upsert({ where: { userId_date: { userId: user.id, date } }, create: { userId: user.id, date }, update: {} });

  const perfs = await db.setPerformance.findMany({ where: { sessionId: session.id }, include: { exercise: true } });
  const map: Record<string, Record<number, { completed: boolean; reps: number; weightKg: number }>> = {};
  for (const p of perfs) {
    const slug = p.exercise.slug;
    map[slug] ??= {};
    map[slug][p.setNumber] = { completed: p.completed, reps: p.reps, weightKg: p.weightKg };
  }
  return NextResponse.json({ sessionId: session.id, perfs: map });
}


