"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type WorkoutDay } from "@/lib/models/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, ImageIcon, PlayCircle, Timer } from "lucide-react";
import { format } from "date-fns";

type Props = {
  days: WorkoutDay[];
  initialIndex?: number;
};

export function DailyView({ days, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const day = days[index];

  // Track completed sets per exercise id
  const [completedSets, setCompletedSets] = useState<Record<string, Set<number>>>({});

  function toggleSetCompleted(exerciseId: string, setNumber: number) {
    setCompletedSets((prev) => {
      const next: Record<string, Set<number>> = { ...prev };
      const current = new Set(next[exerciseId] ?? []);
      if (current.has(setNumber)) {
        current.delete(setNumber);
      } else {
        current.add(setNumber);
      }
      next[exerciseId] = current;
      return next;
    });
  }

  function isExerciseComplete(exerciseId: string, totalSets: number): boolean {
    return (completedSets[exerciseId]?.size ?? 0) >= totalSets && totalSets > 0;
  }

  const title = useMemo(() => {
    // Interpret yyyy-mm-dd as local date to avoid UTC off-by-one
    const [y, m, d] = day.date.split("-").map(Number);
    const local = new Date(y, m - 1, d);
    return `${format(local, "EEEE")} • ${day.title}`;
  }, [day]);

  const canPrev = index > 0;
  const canNext = index < days.length - 1;

  // Floating rest timer state
  const defaultBreak = useMemo(() => day.exercises[0]?.breakSeconds ?? 60, [day]);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number>(defaultBreak);
  const [remaining, setRemaining] = useState<number>(defaultBreak);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // When day changes, reset timer to new default
    setTimerDuration(defaultBreak);
    setRemaining(defaultBreak);
    setRunning(false);
  }, [defaultBreak]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setTimerOpen(false);
    }
    if (timerOpen) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [timerOpen]);

  function startTimer(duration?: number) {
    const d = duration ?? timerDuration;
    setTimerDuration(d);
    setRemaining(d);
    setRunning(true);
  }

  function pauseTimer() {
    setRunning(false);
  }

  function resetTimer() {
    setRunning(false);
    setRemaining(timerDuration);
  }

  function formatSeconds(total: number): string {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(total % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

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
                {isExerciseComplete(ex.id, ex.sets.length) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    <CheckCircle2 className="size-3" /> Completado
                  </span>
                )}
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
                  <TH className="w-16 text-center">Hecho</TH>
                </TR>
              </THead>
              <TBody>
                {ex.sets.map((s) => {
                  const done = completedSets[ex.id]?.has(s.setNumber) ?? false;
                  return (
                    <TR key={s.setNumber} className={done ? "text-foreground/40" : undefined}>
                      <TD>{s.setNumber}</TD>
                      <TD className={done ? "line-through" : undefined}>{s.reps}</TD>
                      <TD className={done ? "line-through" : undefined}>{s.weightKg}</TD>
                      <TD className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-pressed={done}
                          aria-label={done ? "Desmarcar serie" : "Marcar serie como hecha"}
                          onClick={() => toggleSetCompleted(ex.id, s.setNumber)}
                        >
                          {done ? (
                            <CheckCircle2 className="size-5 text-emerald-400" />
                          ) : (
                            <Circle className="size-5 text-foreground/40" />
                          )}
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Floating rest timer button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          type="button"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => setTimerOpen(true)}
          aria-label="Abrir temporizador de descanso"
        >
          <Timer className="size-5" />
        </Button>
      </div>

      {/* Modal overlay for rest timer */}
      {timerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          aria-label="Temporizador de descanso"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setTimerOpen(false)} />
          <div className="relative z-10 w-[92vw] max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-4 text-foreground shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Temporizador de descanso</h3>
              <Button variant="ghost" size="sm" onClick={() => setTimerOpen(false)} aria-label="Cerrar">
                Cerrar
              </Button>
            </div>
            <div className="mb-4 text-center">
              <div className="text-4xl font-semibold tabular-nums tracking-widest">
                {formatSeconds(remaining)}
              </div>
              <p className="mt-1 text-xs text-foreground/60">
                Duración: {Math.round(timerDuration / 60)} min
              </p>
            </div>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {[30, 60, 90, 120].map((sec) => (
                <Button key={sec} variant={timerDuration === sec ? "default" : "outline"} onClick={() => { setTimerDuration(sec); setRemaining(sec); }}>
                  {sec}s
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              {running ? (
                <Button onClick={pauseTimer} variant="outline">Pausar</Button>
              ) : (
                <Button onClick={() => startTimer()} disabled={remaining === 0}>Iniciar</Button>
              )}
              <Button onClick={resetTimer} variant="ghost">Reiniciar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


