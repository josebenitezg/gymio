import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/nav/segmented";
import { Tabbar } from "@/components/nav/tabbar";

export const metadata: Metadata = {
  title: "App | Gymio",
  description: "Área protegida: semana y progreso",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-4">
      <Segmented />
      {children}
      <Tabbar />
    </div>
  );
}


