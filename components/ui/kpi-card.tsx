import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  progressRatio?: number; // 0..1
  className?: string;
};

export function KpiCard({ title, value, subtitle, progressRatio, className }: Props) {
  const ratio = typeof progressRatio === "number" ? Math.max(0, Math.min(1, progressRatio)) : undefined;
  return (
    <div className={cn("rounded-lg border border-white/10 p-4", className)}>
      <div className="text-xs text-foreground/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {typeof ratio === "number" && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.round(ratio * 100)}%` }}
            aria-hidden
          />
        </div>
      )}
      {subtitle && <div className="mt-1 text-[11px] text-foreground/50">{subtitle}</div>}
    </div>
  );
}


