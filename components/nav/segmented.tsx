"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Segmented() {
  const pathname = usePathname();

  const items = [
    { href: "/app/progress", label: "Progreso" },
    { href: "/app/week", label: "Semana" },
  ];

  return (
    <div className="mx-auto mb-4 hidden max-w-5xl items-center justify-center sm:flex">
      <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-w-24 items-center justify-center rounded-full px-3 py-1.5",
                active ? "bg-white/10 text-foreground" : "text-foreground/80 hover:text-foreground"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}


