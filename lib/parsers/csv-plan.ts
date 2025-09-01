import fs from "node:fs";
import path from "node:path";
import { startOfWeek, addDays } from "date-fns";
import { type WorkoutDay, type WorkoutWeek } from "@/lib/models/workout";

type CsvRow = {
  Dia: string;
  Ejercicio: string;
  Series?: string;
  Repeticiones?: string;
  Descanso?: string;
  Imagen?: string;
  Videos?: string;
};

function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split(",").map((s) => s.trim());
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw) continue;
    // Handle quoted fields with commas
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let j = 0; j < raw.length; j++) {
      const ch = raw[j];
      if (ch === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (ch === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key] = (cells[idx] ?? "").trim();
    });
    rows.push({
      Dia: obj["Día"] ?? obj["Dia"] ?? "",
      Ejercicio: obj["Ejercicio"],
      Series: obj["Series"],
      Repeticiones: obj["Repeticiones"],
      Descanso: obj["Descanso"],
      Imagen: obj["Imagen"],
      Videos: obj["Videos"],
    });
  }
  return rows;
}

function parseRepsList(value?: string): number[] {
  if (!value) return [0];
  const cleaned = value.replace(/\(.*?\)/g, "");
  const nums = cleaned
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((n) => Number(n));
  return nums.length ? nums : [0];
}

function parseRestToSeconds(value?: string): number {
  if (!value) return 0;
  const lower = value.toLowerCase();
  // Examples: "2 minutos", "3-4 minutos", "1.5 minutos", "15 min"
  const range = lower.match(/([0-9]+(?:\.[0-9]+)?)\s*-\s*([0-9]+(?:\.[0-9]+)?)/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    return Math.round(((a + b) / 2) * 60);
  }
  const single = lower.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (single) {
    return Math.round(Number(single[1]) * 60);
  }
  return 0;
}

const dayIndex: Record<string, number> = {
  lunes: 0,
  martes: 1,
  miércoles: 2,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
};

export async function loadWeekFromCsv(filePath?: string): Promise<WorkoutWeek> {
  const p = filePath ?? path.join(process.cwd(), "rutina_planificada.csv");
  const csv = fs.readFileSync(p, "utf8");
  const rows = parseCsv(csv);

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  const grouped: Record<string, WorkoutDay> = {};

  for (const r of rows) {
    const key = r.Dia.toLowerCase();
    if (!(key in dayIndex)) {
      continue; // skip weekends/empty
    }
    const offset = dayIndex[key];
    const date = addDays(monday, offset);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    if (!grouped[key]) {
      grouped[key] = {
        date: dateStr,
        title: key.charAt(0).toUpperCase() + key.slice(1),
        exercises: [],
      };
    }

    const reps = parseRepsList(r.Repeticiones);
    const breakSeconds = parseRestToSeconds(r.Descanso);

    const imageUrl = (r.Imagen && r.Imagen.trim()) || "https://placehold.co/400x260.png";
    const videoUrl = r.Videos && r.Videos.trim() ? r.Videos.trim() : undefined;

    grouped[key].exercises.push({
      id: `${key}-${r.Ejercicio.replace(/\s+/g, "-").toLowerCase()}`,
      name: r.Ejercicio,
      media: {
        imageUrl,
        ...(videoUrl ? { videoUrl } : {}),
      },
      breakSeconds,
      sets: reps.map((rep, idx) => ({ setNumber: idx + 1, reps: rep, weightKg: 0 })),
    });
  }

  const days = Object.keys(dayIndex)
    .map((k) => grouped[k])
    .filter(Boolean) as WorkoutDay[];

  return {
    weekStartDate: `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`,
    days,
  };
}



