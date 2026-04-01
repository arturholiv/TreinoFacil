"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppCard } from "@/components/app-card";
import { PageHeader } from "@/components/page-header";
import {
  DAY_OF_WEEK_KEYS,
  WEEKDAY_LABELS_PT,
} from "@/lib/constants/weekdays";
import type { DayOfWeekKey } from "@/lib/constants/weekdays";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { WorkoutRow } from "@/lib/types/workout-types";

export default function WorkoutsListPage() {
  const [rows, setRows] = useState<WorkoutRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const loadList = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRows([]);
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("workouts")
      .select("id,user_id,name,day_of_week,created_at")
      .eq("user_id", user.id)
      .order("day_of_week", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      console.error(error);
      setRows([]);
    } else {
      const list: WorkoutRow[] = (data ?? []) as WorkoutRow[];
      const sorted: WorkoutRow[] = [...list].sort((a, b) => {
        const ai: number = DAY_OF_WEEK_KEYS.indexOf(a.day_of_week as DayOfWeekKey);
        const bi: number = DAY_OF_WEEK_KEYS.indexOf(b.day_of_week as DayOfWeekKey);
        if (ai !== bi) {
          return ai - bi;
        }
        return a.name.localeCompare(b.name, "pt-BR");
      });
      setRows(sorted);
    }
    setIsLoading(false);
  }, []);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {
      void loadList();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadList]);
  async function handleDelete(workoutId: string) {
    const confirmed: boolean = window.confirm("Excluir este treino e todos os exercícios?");
    if (!confirmed) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("workouts").delete().eq("id", workoutId);
    if (error) {
      console.error(error);
      return;
    }
    void loadList();
  }
  return (
    <>
      <PageHeader title="Meus treinos" subtitle="Edite, exclua ou abra o treino do dia na home." />
      {isLoading ? (
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Carregando…</p>
        </AppCard>
      ) : rows.length === 0 ? (
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Nenhum treino ainda.</p>
          <Link
            href="/create-workout"
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]"
          >
            Criar primeiro treino
          </Link>
        </AppCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((w) => {
            const dayKey = w.day_of_week as DayOfWeekKey;
            const dayLabel: string = WEEKDAY_LABELS_PT[dayKey];
            return (
              <li key={w.id}>
                <AppCard className="!py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold">{w.name}</h2>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{dayLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/workout/${w.id}`}
                        className="inline-flex min-h-11 min-w-[5rem] items-center justify-center rounded-xl bg-[var(--muted)] px-4 text-sm font-semibold"
                      >
                        Abrir
                      </Link>
                      <Link
                        href={`/edit-workout/${w.id}`}
                        className="inline-flex min-h-11 min-w-[5rem] items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(w.id)}
                        className="inline-flex min-h-11 min-w-[5rem] items-center justify-center rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:text-red-400"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </AppCard>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
