const MS_PER_DAY = 86_400_000;

export function dateToYmd(d: Date): string {
  const y: number = d.getFullYear();
  const m: string = String(d.getMonth() + 1).padStart(2, "0");
  const day: string = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Colunas = semanas (domingo → sábado, de cima para baixo), da mais antiga à esquerda até a atual à direita.
 */
export function buildHeatmapColumns(weekCount: number): (Date | null)[][] {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek: number = today.getDay();
  const thisWeekSunday: Date = new Date(today.getTime() - dayOfWeek * MS_PER_DAY);
  const columns: (Date | null)[][] = [];
  for (let c = 0; c < weekCount; c++) {
    const weekSunday: Date = new Date(
      thisWeekSunday.getTime() - (weekCount - 1 - c) * 7 * MS_PER_DAY,
    );
    const col: (Date | null)[] = [];
    for (let r = 0; r < 7; r++) {
      const cell: Date = new Date(weekSunday.getTime() + r * MS_PER_DAY);
      if (cell.getTime() > today.getTime()) {
        col.push(null);
      } else {
        col.push(cell);
      }
    }
    columns.push(col);
  }
  return columns;
}

const ROW_LABELS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function heatmapRowLabel(rowIndex: number): string {
  return ROW_LABELS_SHORT[rowIndex] ?? "";
}

/**
 * Sequência encerrando em hoje ou ontem (se ainda não fez hoje).
 */
export function computeStreak(checkinYmdSet: ReadonlySet<string>, todayYmd: string): number {
  let cursor: Date = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!checkinYmdSet.has(todayYmd)) {
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }
  let streak = 0;
  for (let i = 0; i < 730; i++) {
    const ymd: string = dateToYmd(cursor);
    if (checkinYmdSet.has(ymd)) {
      streak += 1;
      cursor = new Date(cursor.getTime() - MS_PER_DAY);
    } else {
      break;
    }
  }
  return streak;
}

export function countCheckinsInYear(checkinYmdSet: ReadonlySet<string>, year: number): number {
  const prefix: string = `${year}-`;
  let n = 0;
  checkinYmdSet.forEach((ymd) => {
    if (ymd.startsWith(prefix)) {
      n += 1;
    }
  });
  return n;
}

export type MonthCalendarDayCell = {
  readonly kind: "day";
  readonly date: Date;
  readonly ymd: string;
  readonly isToday: boolean;
  readonly isFuture: boolean;
};

export type MonthCalendarPadCell = {
  readonly kind: "pad";
};

export type MonthCalendarCell = MonthCalendarDayCell | MonthCalendarPadCell;

/** Week grid Monday → Sunday (pt-BR). */
export const WEEKDAY_LABELS_MON_FIRST: readonly string[] = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
  "Dom",
];

/**
 * Flat list of cells for one month: leading/trailing padding + days. Monday-first rows.
 */
export function buildMonthCalendarCells(
  year: number,
  monthIndex: number,
  todayStart: Date,
): MonthCalendarCell[] {
  const todayTime: number = todayStart.getTime();
  const first: Date = new Date(year, monthIndex, 1);
  first.setHours(0, 0, 0, 0);
  const jsDay: number = first.getDay();
  const leadingPad: number = jsDay === 0 ? 6 : jsDay - 1;
  const lastDay: number = new Date(year, monthIndex + 1, 0).getDate();
  const cells: MonthCalendarCell[] = [];
  for (let i = 0; i < leadingPad; i++) {
    cells.push({ kind: "pad" });
  }
  for (let d = 1; d <= lastDay; d++) {
    const date: Date = new Date(year, monthIndex, d);
    date.setHours(0, 0, 0, 0);
    const t: number = date.getTime();
    const isFuture: boolean = t > todayTime;
    const isToday: boolean = t === todayTime;
    cells.push({
      kind: "day",
      date,
      ymd: dateToYmd(date),
      isToday,
      isFuture,
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ kind: "pad" });
  }
  return cells;
}

export function canGoToNextMonth(
  viewYear: number,
  viewMonthIndex: number,
  today: Date,
): boolean {
  if (viewYear < today.getFullYear()) {
    return true;
  }
  if (viewYear === today.getFullYear() && viewMonthIndex < today.getMonth()) {
    return true;
  }
  return false;
}

export function canGoToPrevMonth(viewYear: number, viewMonthIndex: number, minYear: number): boolean {
  if (viewYear > minYear) {
    return true;
  }
  if (viewYear === minYear && viewMonthIndex > 0) {
    return true;
  }
  return false;
}
