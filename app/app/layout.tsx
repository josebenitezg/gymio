import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/nav/segmented";
import { Tabbar } from "@/components/nav/tabbar";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "App | Gymio",
  description: "Área protegida: semana y progreso",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  let hasToday = false;
  try {
    if (userId) {
      const user = await db.user.upsert({ where: { clerkUserId: userId }, create: { clerkUserId: userId }, update: {} });
      const week = await db.week.findFirst({
        where: { userId: user.id },
        orderBy: { weekStartDate: "desc" },
        include: { days: true },
      });
      if (week) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        hasToday = week.days.some((d) => d.date.toISOString().slice(0, 10) === todayStr);
      }
    }
  } catch {}
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-4">
      <Segmented />
      {children}
      <Tabbar hasToday={hasToday} />
    </div>
  );
}


