"use client";

import {
  buildHeatmapColumns,
  dateToYmd,
  heatmapRowLabel,
} from "@/lib/utils/checkin-heatmap";

type CheckinHeatmapProps = {
  checkinYmdSet: ReadonlySet<string>;
  weekCount?: number;
  showScrollHint?: boolean;
};

const DEFAULT_WEEKS = 40;

export function CheckinHeatmap({
  checkinYmdSet,
  weekCount = DEFAULT_WEEKS,
  showScrollHint = true,
}: CheckinHeatmapProps) {
  const columns: (Date | null)[][] = buildHeatmapColumns(weekCount);
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--muted)]/25 px-2 py-3 [-webkit-overflow-scrolling:touch]">
      <div className="inline-flex min-w-min gap-1">
        <div className="flex flex-col justify-between pt-6 pr-0.5 text-[10px] font-medium leading-none text-[var(--muted-foreground)]">
          {Array.from({ length: 7 }, (_, r) => (
            <span key={r} className="flex h-[13px] items-center">
              {r % 2 === 1 ? heatmapRowLabel(r) : ""}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((cell, ri) => {
                if (!cell) {
                  return (
                    <span
                      key={`e-${ci}-${ri}`}
                      className="size-[13px] shrink-0 rounded-[3px] bg-transparent sm:size-[14px]"
                      aria-hidden
                    />
                  );
                }
                const ymd: string = dateToYmd(cell);
                const has: boolean = checkinYmdSet.has(ymd);
                const label: string = cell.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                return (
                  <span
                    key={ymd}
                    title={`${label}${has ? " — check-in feito" : ""}`}
                    className={`size-[13px] shrink-0 rounded-[3px] border border-[var(--border)]/80 sm:size-[14px] ${
                      has
                        ? "bg-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
                        : "bg-[var(--card)]"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {showScrollHint ? (
        <p className="mt-3 text-center text-[10px] text-[var(--muted-foreground)]">
          Deslize para ver semanas anteriores · hoje à direita
        </p>
      ) : null}
    </div>
  );
}
