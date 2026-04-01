"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppCard } from "@/components/app-card";
import { PageHeader } from "@/components/page-header";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ExerciseRow, WorkoutRow } from "@/lib/types/workout-types";
import { getLocalDateYmd } from "@/lib/utils/local-date";

type ExerciseWithDone = ExerciseRow & { isCompleted: boolean };

export default function WorkoutDetailPage() {
  const params = useParams();
  const idParam = params["id"];
  const workoutId: string = typeof idParam === "string" ? idParam : "";
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithDone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const logDate: string = getLocalDateYmd();
  const loadData = useCallback(async () => {
    if (!workoutId) {
      return;
    }
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    const { data: workoutRow, error: workoutError } = await supabase
      .from("workouts")
      .select("id,user_id,name,day_of_week,created_at")
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (workoutError || !workoutRow) {
      setWorkout(null);
      setExercises([]);
      setIsLoading(false);
      return;
    }
    setWorkout(workoutRow as WorkoutRow);
    const { data: exerciseRows, error: exError } = await supabase
      .from("exercises")
      .select("id,workout_id,name,sets,reps")
      .eq("workout_id", workoutId)
      .order("id", { ascending: true });
    if (exError) {
      setExercises([]);
      setIsLoading(false);
      return;
    }
    if (!exerciseRows?.length) {
      setExercises([]);
      setIsLoading(false);
      return;
    }
    const ids: string[] = exerciseRows.map((e) => (e as ExerciseRow).id);
    const { data: logs } = await supabase
      .from("exercise_logs")
      .select("exercise_id,completed")
      .eq("user_id", user.id)
      .eq("log_date", logDate)
      .in("exercise_id", ids);
    const doneMap: Record<string, boolean> = {};
    (logs ?? []).forEach((row: { exercise_id: string; completed: boolean }) => {
      doneMap[row.exercise_id] = row.completed;
    });
    setExercises(
      exerciseRows.map((row) => ({
        ...(row as ExerciseRow),
        isCompleted: Boolean(doneMap[(row as ExerciseRow).id]),
      })),
    );
    setIsLoading(false);
  }, [workoutId, logDate]);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);
  async function toggleExercise(exerciseId: string, nextCompleted: boolean) {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, isCompleted: nextCompleted } : ex)),
    );
    if (nextCompleted) {
      const { error: delErr } = await supabase
        .from("exercise_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId)
        .eq("log_date", logDate);
      if (delErr) {
        console.error(delErr);
      }
      const { error } = await supabase.from("exercise_logs").insert({
        user_id: user.id,
        exercise_id: exerciseId,
        log_date: logDate,
        completed: true,
      });
      if (error) {
        console.error(error);
        void loadData();
      }
    } else {
      const { error } = await supabase
        .from("exercise_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_id", exerciseId)
        .eq("log_date", logDate);
      if (error) {
        console.error(error);
        void loadData();
      }
    }
  }
  if (isLoading) {
    return (
      <>
        <PageHeader title="Treino" subtitle="Carregando…" />
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Carregando…</p>
        </AppCard>
      </>
    );
  }
  if (!workout) {
    return (
      <>
        <PageHeader title="Treino" />
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Treino não encontrado.</p>
          <Link
            href="/workouts"
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]"
          >
            Voltar aos treinos
          </Link>
        </AppCard>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title={workout.name}
        subtitle={`${exercises.length} exercício(s)`}
      />
      {exercises.length === 0 ? (
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Nenhum exercício neste treino.</p>
          <Link
            href={`/edit-workout/${workout.id}`}
            className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]"
          >
            Adicionar exercícios
          </Link>
        </AppCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => (
            <li key={ex.id}>
              <AppCard className="!py-4">
                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    type="checkbox"
                    checked={ex.isCompleted}
                    onChange={(e) => void toggleExercise(ex.id, e.target.checked)}
                    className="mt-1 size-6 shrink-0 rounded-md border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-base font-medium ${ex.isCompleted ? "text-[var(--muted-foreground)] line-through" : ""}`}
                    >
                      {ex.name}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                      {ex.sets}×{ex.reps}
                    </span>
                  </span>
                </label>
              </AppCard>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
