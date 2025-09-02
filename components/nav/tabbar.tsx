"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function Tabbar() {
  const pathname = usePathname();
  const items = [
    { href: "/app/progress", label: "Progreso", icon: Activity },
    { href: "/app/week", label: "Semana", icon: CalendarDays },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-5xl border-t border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40 sm:hidden">
      <nav className="grid grid-cols-2 p-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-12 flex-col items-center justify-center gap-0.5 rounded-md",
                active ? "text-foreground" : "text-foreground/70 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px]">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}


