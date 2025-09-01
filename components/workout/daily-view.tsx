"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { type WorkoutDay } from "@/lib/models/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, ImageIcon, PlayCircle } from "lucide-react";
import { format } from "date-fns";

type Props = {
  days: WorkoutDay[];
  initialIndex?: number;
};

export function DailyView({ days, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const day = days[index];

  const title = useMemo(() => {
    // Interpret yyyy-mm-dd as local date to avoid UTC off-by-one
    const [y, m, d] = day.date.split("-").map(Number);
    const local = new Date(y, m - 1, d);
    return `${format(local, "EEEE")} • ${day.title}`;
  }, [day]);

  const canPrev = index > 0;
  const canNext = index < days.length - 1;

  return (
    <div className="w-full mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => canPrev && setIndex((i) => i - 1)}
          disabled={!canPrev}
          aria-label="Día anterior"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <h2 className="text-lg font-semibold text-center flex-1">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => canNext && setIndex((i) => i + 1)}
          disabled={!canNext}
          aria-label="Día siguiente"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {day.exercises.map((ex) => (
        <Card key={ex.id}>
          <CardHeader className="flex items-center gap-4">
            <div className="relative h-24 w-32 overflow-hidden rounded-md border border-white/10 bg-white/5">
              {ex.media.imageUrl ? (
                <Image
                  src={ex.media.imageUrl}
                  alt={ex.name}
                  fill
                  sizes="(max-width:768px) 128px, 160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-foreground/50">
                  <ImageIcon className="size-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {ex.name}
                {ex.media.videoUrl && (
                  <a
                    href={ex.media.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-normal text-foreground/70 hover:underline"
                  >
                    <PlayCircle className="size-4" /> Video
                  </a>
                )}
              </CardTitle>
              <p className="text-xs text-foreground/60">Descanso: {Math.round(ex.breakSeconds / 60)} min</p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Serie</TH>
                  <TH>Repeticiones</TH>
                  <TH>Peso (kg)</TH>
                </TR>
              </THead>
              <TBody>
                {ex.sets.map((s) => (
                  <TR key={s.setNumber}>
                    <TD>{s.setNumber}</TD>
                    <TD>{s.reps}</TD>
                    <TD>{s.weightKg}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


