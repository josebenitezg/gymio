import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "App | Gymio",
  description: "Área protegida: semana y progreso",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-4">
      <nav className="mb-4 hidden items-center gap-2 text-sm text-foreground/70 sm:flex">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/progress">Progreso</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/week">Semana</Link>
        </Button>
      </nav>
      {children}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-5xl border-t border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40 sm:hidden">
        <div className="grid grid-cols-2 p-2">
          <Button asChild variant="ghost">
            <Link href="/app/progress">Progreso</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/app/week">Semana</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


