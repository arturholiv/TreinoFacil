"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const exercisesRef = useRef<ExerciseWithDone[]>([]);
  const logDate: string = getLocalDateYmd();
  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);
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
      .select("id,workout_id,name,sets,reps,weight,notes")
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
      exerciseRows.map((row) => {
        const base = row as ExerciseRow & { weight?: string; notes?: string };
        return {
          id: base.id,
          workout_id: base.workout_id,
          name: base.name,
          sets: base.sets,
          reps: base.reps,
          weight: base.weight ?? "",
          notes: base.notes ?? "",
          isCompleted: Boolean(doneMap[base.id]),
        };
      }),
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
  function updateExerciseMeta(
    exerciseId: string,
    patch: Partial<Pick<ExerciseRow, "notes" | "weight">>,
  ) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, ...patch } : ex)),
    );
  }
  async function persistExerciseMeta(exerciseId: string) {
    const row: ExerciseWithDone | undefined = exercisesRef.current.find(
      (e) => e.id === exerciseId,
    );
    if (!row) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("exercises")
      .update({ notes: row.notes, weight: row.weight })
      .eq("id", exerciseId);
    if (error) {
      console.error(error);
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
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={ex.isCompleted}
                    onChange={(e) => void toggleExercise(ex.id, e.target.checked)}
                    aria-label={`Concluído: ${ex.name}`}
                    className="mt-1 size-6 shrink-0 rounded-md border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-base font-medium ${ex.isCompleted ? "text-[var(--muted-foreground)] line-through" : ""}`}
                    >
                      {ex.name}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                      {ex.sets}×{ex.reps}
                    </span>
                    <label className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                      Peso
                      <input
                        value={ex.weight}
                        onChange={(e) => updateExerciseMeta(ex.id, { weight: e.target.value })}
                        onBlur={() => void persistExerciseMeta(ex.id)}
                        placeholder="Ex.: 22,5 kg"
                        className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm font-normal text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
                      />
                    </label>
                    <label className="mt-3 flex flex-col gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                      Notas
                      <textarea
                        value={ex.notes}
                        onChange={(e) => updateExerciseMeta(ex.id, { notes: e.target.value })}
                        onBlur={() => void persistExerciseMeta(ex.id)}
                        placeholder="Anotações (salvam ao sair do campo)"
                        rows={3}
                        className="resize-y rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-normal text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
                      />
                    </label>
                  </div>
                </div>
              </AppCard>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
