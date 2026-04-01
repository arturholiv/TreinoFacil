"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppCard } from "@/components/app-card";
import { PageHeader } from "@/components/page-header";
import { DAY_OF_WEEK_KEYS, WEEKDAY_SELECT_OPTIONS } from "@/lib/constants/weekdays";
import type { DayOfWeekKey } from "@/lib/constants/weekdays";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { WorkoutRow } from "@/lib/types/workout-types";

export default function WorkoutsListPage() {
  const [rows, setRows] = useState<WorkoutRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingDayId, setUpdatingDayId] = useState<string | null>(null);
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
  async function handleDayChange(workoutId: string, nextDay: DayOfWeekKey) {
    const current: WorkoutRow | undefined = rows.find((r) => r.id === workoutId);
    if (!current || current.day_of_week === nextDay) {
      return;
    }
    setUpdatingDayId(workoutId);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("workouts")
      .update({ day_of_week: nextDay })
      .eq("id", workoutId);
    setUpdatingDayId(null);
    if (error) {
      console.error(error);
      window.alert("Não foi possível atualizar o dia. Tente de novo.");
      return;
    }
    setRows((prev) => {
      const nextRows: WorkoutRow[] = prev.map((r) =>
        r.id === workoutId ? { ...r, day_of_week: nextDay } : r,
      );
      return [...nextRows].sort((a, b) => {
        const ai: number = DAY_OF_WEEK_KEYS.indexOf(a.day_of_week as DayOfWeekKey);
        const bi: number = DAY_OF_WEEK_KEYS.indexOf(b.day_of_week as DayOfWeekKey);
        if (ai !== bi) {
          return ai - bi;
        }
        return a.name.localeCompare(b.name, "pt-BR");
      });
    });
  }
  return (
    <>
      <PageHeader
        title="Meus treinos"
        subtitle="Troque o dia da semana pelo menu abaixo, ou edite o treino completo."
      />
      <AppCard className="mb-4 !border-dashed !py-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">Sem ideia de treinos?</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A <strong>IA do Treino Fácil</strong> monta para você divisões <strong>ABC</strong>,{" "}
          <strong>ABCD</strong> ou <strong>ABCDE</strong> com dias da semana, exercícios e séries.
          Você pode editar tudo depois.
        </p>
        <Link
          href="/gerar-treinos"
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-[var(--accent)] bg-transparent px-3 text-center text-sm font-semibold leading-tight text-[var(--accent)]"
        >
          Gerar meus treinos com inteligência artificial
        </Link>
      </AppCard>
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
          <Link
            href="/gerar-treinos"
            className="mt-3 block text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Ou deixar a IA gerar (ABC, ABCD ou ABCDE)
          </Link>
        </AppCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((w) => {
            const dayKey = w.day_of_week as DayOfWeekKey;
            return (
              <li key={w.id}>
                <AppCard className="!py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold">{w.name}</h2>
                      <label className="mt-3 flex flex-col gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        Dia da semana
                        <select
                          value={dayKey}
                          disabled={updatingDayId === w.id}
                          onChange={(e) =>
                            void handleDayChange(w.id, e.target.value as DayOfWeekKey)
                          }
                          className="min-h-11 max-w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm font-normal text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60 sm:max-w-xs"
                        >
                          {WEEKDAY_SELECT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {updatingDayId === w.id ? (
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Salvando…</p>
                      ) : null}
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
