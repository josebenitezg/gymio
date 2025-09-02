"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type WorkoutDay } from "@/lib/models/workout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, ImageIcon, PlayCircle, Timer, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

type Props = {
  days: WorkoutDay[];
  initialIndex?: number;
};

export function DailyView({ days, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const day = days[index];

  // Track completed sets per exercise id
  const [completedSets, setCompletedSets] = useState<Record<string, Set<number>>>({});
  const [collapsedExercises, setCollapsedExercises] = useState<Record<string, boolean>>({});

  // Local editable reps/weight per set (not persisted yet)
  type SetKey = { reps: number; weightKg: number };
  const [setValues, setSetValues] = useState<Record<string, Record<number, SetKey>>>({});

  // Initialize editable values when day changes
  useEffect(() => {
    const initial: Record<string, Record<number, SetKey>> = {};
    for (const ex of day.exercises) {
      initial[ex.id] = {};
      for (const s of ex.sets) {
        initial[ex.id][s.setNumber] = { reps: s.reps, weightKg: s.weightKg };
      }
    }
    setSetValues(initial);
    setCompletedSets({});
    setCollapsedExercises({});
  }, [day]);

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

      // Haptics
      try {
        const navAny = (typeof navigator !== "undefined" ? (navigator as unknown as { vibrate?: (p: number | number[]) => boolean }) : undefined);
        if (navAny?.vibrate) {
          if (current.has(setNumber)) {
            navAny.vibrate([10]);
          }
        }
      } catch {}
      return next;
    });
  }

  function isExerciseComplete(exerciseId: string, totalSets: number): boolean {
    return (completedSets[exerciseId]?.size ?? 0) >= totalSets && totalSets > 0;
  }

  // Auto-colapse when exercise reaches 100% and no explicit user choice yet
  useEffect(() => {
    for (const ex of day.exercises) {
      const complete = isExerciseComplete(ex.id, ex.sets.length);
      if (complete && collapsedExercises[ex.id] === undefined) {
        setCollapsedExercises((prev) => ({ ...prev, [ex.id]: true }));
      }
      if (!complete && collapsedExercises[ex.id]) {
        // If user un-completes a set, expand back
        setCollapsedExercises((prev) => ({ ...prev, [ex.id]: false }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSets, day.exercises]);

  function toggleExerciseCollapsed(exerciseId: string) {
    setCollapsedExercises((prev) => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
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
      {/* Day chips */}
      <div className="-mx-4 overflow-x-auto px-4">
        <div className="mb-1 flex gap-2">
          {days.map((d, i) => {
            const active = i === index;
            return (
              <button
                key={d.date}
                onClick={() => setIndex(i)}
                className={
                  active
                    ? "inline-flex min-w-14 items-center justify-center rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                    : "inline-flex min-w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-foreground/80"
                }
                aria-pressed={active}
              >
                {format(new Date(d.date + "T00:00:00"), "EE").toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
      <div className="sticky top-2 z-10 mb-2 flex items-center justify-between rounded-lg bg-black/40 px-1 py-1 backdrop-blur supports-[backdrop-filter]:bg-black/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => canPrev && setIndex((i) => i - 1)}
          disabled={!canPrev}
          aria-label="Día anterior"
        >
          <ChevronLeft className="size-6" />
        </Button>
        <h2 className="flex-1 text-center text-base font-semibold sm:text-lg">
          {title}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => canNext && setIndex((i) => i + 1)}
          disabled={!canNext}
          aria-label="Día siguiente"
        >
          <ChevronRight className="size-6" />
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
                  <Link href={ex.media.videoUrl} target="_blank" className="inline-flex items-center gap-1 text-xs font-normal text-foreground/70 hover:underline">
                    <PlayCircle className="size-4" /> Video
                  </Link>
                )}
              </CardTitle>
              <p className="text-xs text-foreground/60">Descanso: {Math.round(ex.breakSeconds / 60)} min</p>

              {/* Exercise progress bar */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                {(() => {
                  const done = completedSets[ex.id]?.size ?? 0;
                  const ratio = Math.max(0, Math.min(1, done / ex.sets.length));
                  return (
                    <div className="h-1.5 rounded-full bg-emerald-500 transition-[width]" style={{ width: `${Math.round(ratio * 100)}%` }} aria-hidden />
                  );
                })()}
              </div>
            </div>
            {isExerciseComplete(ex.id, ex.sets.length) && (
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={!(collapsedExercises[ex.id] ?? false)}
                  aria-controls={`exercise-${ex.id}-content`}
                  onClick={() => toggleExerciseCollapsed(ex.id)}
                >
                  {(collapsedExercises[ex.id] ?? true) ? (
                    <span className="inline-flex items-center gap-1 text-xs"><ChevronDown className="size-4" /> Ver</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs"><ChevronUp className="size-4" /> Ocultar</span>
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          {!(isExerciseComplete(ex.id, ex.sets.length) && (collapsedExercises[ex.id] ?? true)) && (
          <CardContent id={`exercise-${ex.id}-content`}>
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
                  const current = setValues[ex.id]?.[s.setNumber] ?? { reps: s.reps, weightKg: s.weightKg };
                  return (
                    <TR key={s.setNumber} className={done ? "text-foreground/40" : undefined}>
                      <TD>{s.setNumber}</TD>
                      <TD className={done ? "line-through" : undefined}>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label="Reducir repeticiones"
                            onClick={() => setSetValues((prev) => ({
                              ...prev,
                              [ex.id]: {
                                ...(prev[ex.id] ?? {}),
                                [s.setNumber]: { reps: Math.max(0, (current.reps ?? 0) - 1), weightKg: current.weightKg },
                              },
                            }))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center tabular-nums">{current.reps}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label="Aumentar repeticiones"
                            onClick={() => setSetValues((prev) => ({
                              ...prev,
                              [ex.id]: {
                                ...(prev[ex.id] ?? {}),
                                [s.setNumber]: { reps: (current.reps ?? 0) + 1, weightKg: current.weightKg },
                              },
                            }))}
                          >
                            +
                          </Button>
                        </div>
                      </TD>
                      <TD className={done ? "line-through" : undefined}>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label="Reducir peso"
                            onClick={() => setSetValues((prev) => ({
                              ...prev,
                              [ex.id]: {
                                ...(prev[ex.id] ?? {}),
                                [s.setNumber]: { reps: current.reps, weightKg: Math.max(0, Number((current.weightKg ?? 0) - 2.5)) },
                              },
                            }))}
                          >
                            -
                          </Button>
                          <span className="w-10 text-center tabular-nums">{current.weightKg}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label="Aumentar peso"
                            onClick={() => setSetValues((prev) => ({
                              ...prev,
                              [ex.id]: {
                                ...(prev[ex.id] ?? {}),
                                [s.setNumber]: { reps: current.reps, weightKg: Number((current.weightKg ?? 0) + 2.5) },
                              },
                            }))}
                          >
                            +
                          </Button>
                        </div>
                      </TD>
                      <TD className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          aria-pressed={done}
                          aria-label={done ? "Desmarcar serie" : "Marcar serie como hecha"}
                          onClick={() => toggleSetCompleted(ex.id, s.setNumber)}
                        >
                          {done ? (
                            <CheckCircle2 className="size-6 text-emerald-400" />
                          ) : (
                            <Circle className="size-6 text-foreground/40" />
                          )}
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardContent>
          )}
        </Card>
      ))}

      {/* Floating rest timer button */}
      <div className="fixed bottom-20 right-4 z-50 sm:bottom-4">
        <Button
          type="button"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
          onClick={() => setTimerOpen(true)}
          aria-label="Abrir temporizador de descanso"
        >
          <Timer className="size-6" />
        </Button>
      </div>

      <Dialog open={timerOpen} onOpenChange={setTimerOpen}>
        <DialogContent aria-label="Temporizador de descanso">
          <DialogHeader>
            <DialogTitle>Temporizador de descanso</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" aria-label="Cerrar">Cerrar</Button>
            </DialogClose>
          </DialogHeader>
          <div className="mb-4 flex flex-col items-center justify-center gap-2">
            <div className="relative h-24 w-24">
              {(() => {
                const radius = 44;
                const circumference = 2 * Math.PI * radius;
                const ratio = timerDuration > 0 ? remaining / timerDuration : 0;
                const offset = circumference * (1 - Math.max(0, Math.min(1, ratio)));
                return (
                  <svg viewBox="0 0 100 100" className="h-24 w-24">
                    <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-primary transition-[stroke-dashoffset]"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                    <text x="50" y="54" textAnchor="middle" className="fill-current text-xl font-semibold">
                      {formatSeconds(remaining)}
                    </text>
                  </svg>
                );
              })()}
            </div>
            <p className="text-xs text-foreground/60">Duración: {Math.round(timerDuration / 60)} min</p>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}


