import { assertWorkoutWeek } from "@/lib/models/workout";
import { loadWeekFromCsv } from "@/lib/parsers/csv-plan";
import { DailyView } from "@/components/workout/daily-view";

export const revalidate = 3600;

export default async function Home() {
  const week = assertWorkoutWeek(await loadWeekFromCsv());
  return (
    <main className="px-4 py-8">
      <DailyView days={week.days} />
    </main>
  );
}
