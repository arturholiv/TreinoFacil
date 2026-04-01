"use client";

import { useMemo, useState } from "react";
import {
  buildMonthCalendarCells,
  canGoToNextMonth,
  canGoToPrevMonth,
  WEEKDAY_LABELS_MON_FIRST,
} from "@/lib/utils/checkin-heatmap";

type CheckinMonthCalendarProps = {
  checkinYmdSet: ReadonlySet<string>;
  minCalendarYear: number;
};

export function CheckinMonthCalendar({
  checkinYmdSet,
  minCalendarYear,
}: CheckinMonthCalendarProps) {
  const today: Date = useMemo(() => {
    const d: Date = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewYear, setViewYear] = useState<number>(() => today.getFullYear());
  const [viewMonthIndex, setViewMonthIndex] = useState<number>(() => today.getMonth());
  const cells = useMemo(
    () => buildMonthCalendarCells(viewYear, viewMonthIndex, today),
    [viewYear, viewMonthIndex, today],
  );
  const monthTitle: string = useMemo(() => {
    const raw: string = new Date(viewYear, viewMonthIndex, 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return raw.length > 0 ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  }, [viewYear, viewMonthIndex]);
  const canNext: boolean = canGoToNextMonth(viewYear, viewMonthIndex, today);
  const canPrev: boolean = canGoToPrevMonth(viewYear, viewMonthIndex, minCalendarYear);
  function goPrevMonth() {
    if (!canPrev) {
      return;
    }
    if (viewMonthIndex === 0) {
      setViewYear((y) => y - 1);
      setViewMonthIndex(11);
    } else {
      setViewMonthIndex((m) => m - 1);
    }
  }
  function goNextMonth() {
    if (!canNext) {
      return;
    }
    if (viewMonthIndex === 11) {
      setViewYear((y) => y + 1);
      setViewMonthIndex(0);
    } else {
      setViewMonthIndex((m) => m + 1);
    }
  }
  function goToThisMonth() {
    setViewYear(today.getFullYear());
    setViewMonthIndex(today.getMonth());
  }
  const isViewingCurrentMonth: boolean =
    viewYear === today.getFullYear() && viewMonthIndex === today.getMonth();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-1">
          <button
            type="button"
            aria-label="Mês anterior"
            disabled={!canPrev}
            onClick={goPrevMonth}
            className="flex size-10 items-center justify-center rounded-lg text-lg font-medium text-[var(--foreground)] transition enabled:hover:bg-[var(--card)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Próximo mês"
            disabled={!canNext}
            onClick={goNextMonth}
            className="flex size-10 items-center justify-center rounded-lg text-lg font-medium text-[var(--foreground)] transition enabled:hover:bg-[var(--card)] disabled:cursor-not-allowed disabled:opacity-35"
          >
            ›
          </button>
        </div>
        <h3 className="min-w-0 text-center text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-lg">
          {monthTitle}
        </h3>
        <div className="flex min-w-[4.5rem] justify-end sm:min-w-[5rem]">
          {!isViewingCurrentMonth ? (
            <button
              type="button"
              onClick={goToThisMonth}
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--muted)]/60"
            >
              Hoje
            </button>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {WEEKDAY_LABELS_MON_FIRST.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
          >
            {label}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.kind === "pad") {
            return <div key={`p-${i}`} className="aspect-square min-h-10" aria-hidden />;
          }
          const hasCheckin: boolean = checkinYmdSet.has(cell.ymd);
          const labelLong: string = cell.date.toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const title: string = cell.isFuture
            ? `${labelLong} — ainda não chegou`
            : hasCheckin
              ? `${labelLong} — check-in feito`
              : `${labelLong} — sem check-in`;
          return (
            <div
              key={cell.ymd}
              title={title}
              className={`flex aspect-square min-h-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                cell.isFuture
                  ? "cursor-default text-[var(--muted-foreground)]/35"
                  : hasCheckin
                    ? "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "bg-[var(--muted)]/55 text-[var(--foreground)]"
              } ${cell.isToday ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--card)]" : ""}`}
            >
              {cell.date.getDate()}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-[var(--muted-foreground)]">
        Azul = check-in · contorno = hoje
      </p>
    </div>
  );
}
