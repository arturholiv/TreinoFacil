import type { DayOfWeekKey } from "@/lib/constants/weekdays";
import { DAY_OF_WEEK_KEYS } from "@/lib/constants/weekdays";

export function getLocalDayOfWeekKey(): DayOfWeekKey {
  const index: number = new Date().getDay();
  return DAY_OF_WEEK_KEYS[index] as DayOfWeekKey;
}

export function getLocalDateYmd(): string {
  const d: Date = new Date();
  const y: number = d.getFullYear();
  const m: string = String(d.getMonth() + 1).padStart(2, "0");
  const day: string = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
