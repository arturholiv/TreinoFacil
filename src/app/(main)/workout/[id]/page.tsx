"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppCard } from "@/components/app-card";
import { ExerciseIllustration } from "@/components/exercise-illustration";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ExerciseRow, WorkoutRow } from "@/lib/types/workout-types";
import { getLocalDateYmd } from "@/lib/utils/local-date";

type ExerciseWithDone = ExerciseRow & { isCompleted: boolean };

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params["id"];
  const workoutId: string = typeof idParam === "string" ? idParam : "";
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithDone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedCompletedIds, setExpandedCompletedIds] = useState<Record<string, boolean>>({});
  const [sessionFinished, setSessionFinished] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [finishMessage, setFinishMessage] = useState<string>("");
  const exercisesRef = useRef<ExerciseWithDone[]>([]);
  const lastResetSessionForWorkoutIdRef = useRef<string | null>(null);
  const logDate: string = getLocalDateYmd();
  useEffect(() => {
    exercisesRef.current = exercises;
  }, [exercises]);
  const loadData = useCallback(async () => {
    if (!workoutId) {
      return;
    }
    if (lastResetSessionForWorkoutIdRef.current !== workoutId) {
      lastResetSessionForWorkoutIdRef.current = workoutId;
      setSessionFinished(false);
      setFinishMessage("");
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
      .select("id,user_id,name,notes,day_of_week,created_at")
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (workoutError || !workoutRow) {
      setWorkout(null);
      setExercises([]);
      setIsLoading(false);
      return;
    }
    const loaded: WorkoutRow = {
      ...(workoutRow as WorkoutRow),
      notes: String((workoutRow as { notes?: string }).notes ?? ""),
    };
    setWorkout(loaded);
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
  function setCompletedExpanded(exerciseId: string, expanded: boolean) {
    setExpandedCompletedIds((prev) => ({ ...prev, [exerciseId]: expanded }));
  }
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
      setCompletedExpanded(exerciseId, false);
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
      setCompletedExpanded(exerciseId, true);
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
  async function handleFinishWorkout() {
    setFinishMessage("");
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    setIsFinishing(true);
    const snapshot: ExerciseWithDone[] = exercisesRef.current;
    const incomplete: ExerciseWithDone[] = snapshot.filter((e) => !e.isCompleted);
    for (const ex of incomplete) {
      await supabase
        .from("exercise_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("exercise_id", ex.id)
        .eq("log_date", logDate);
      const { error } = await supabase.from("exercise_logs").insert({
        user_id: user.id,
        exercise_id: ex.id,
        log_date: logDate,
        completed: true,
      });
      if (error) {
        console.error(error);
        setFinishMessage(error.message ?? "Não foi possível salvar todos os exercícios.");
        setIsFinishing(false);
        void loadData();
        return;
      }
    }
    setExercises((prev) => prev.map((e) => ({ ...e, isCompleted: true })));
    setExpandedCompletedIds({});
    const { error: checkinError } = await supabase.from("daily_checkins").insert({
      user_id: user.id,
      checkin_date: logDate,
    });
    if (checkinError) {
      if (checkinError.code === "23505") {
        setFinishMessage("");
      } else if (
        checkinError.code === "PGRST205" ||
        (typeof checkinError.message === "string" && checkinError.message.includes("schema cache"))
      ) {
        setFinishMessage(
          "Treino marcado como feito. Check-in diário não está disponível (configure daily_checkins no Supabase).",
        );
      } else {
        setFinishMessage(
          `Treino salvo. Check-in: ${checkinError.message ?? "erro ao registrar hábito."}`,
        );
      }
    }
    setIsFinishing(false);
    setSessionFinished(true);
    router.refresh();
  }
  const doneCount: number = exercises.filter((e) => e.isCompleted).length;
  const totalCount: number = exercises.length;
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
        subtitle={
          sessionFinished
            ? "Treino concluído hoje"
            : `${doneCount}/${totalCount} exercício(s) feitos hoje`
        }
      />
      {workout.notes.trim().length > 0 ? (
        <details
          open
          className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm"
        >
          <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
            Regras da ficha (geral)
          </summary>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--muted-foreground)]">
            {workout.notes}
          </p>
        </details>
      ) : null}
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
      ) : sessionFinished ? null : (
        <ul className="flex flex-col gap-3">
          {exercises.map((ex) => {
            const showFullCard: boolean = !ex.isCompleted || expandedCompletedIds[ex.id];
            if (!showFullCard) {
              return (
                <li key={ex.id}>
                  <AppCard className="!py-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={ex.isCompleted}
                        onChange={(e) => void toggleExercise(ex.id, e.target.checked)}
                        aria-label={`Concluído: ${ex.name}`}
                        className="size-6 shrink-0 rounded-md border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--muted-foreground)] line-through">
                          {ex.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {ex.sets}×{ex.reps}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCompletedExpanded(ex.id, true)}
                        className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-xs font-semibold text-[var(--accent)]"
                      >
                        Detalhes
                      </button>
                    </div>
                  </AppCard>
                </li>
              );
            }
            return (
              <li key={ex.id}>
                <AppCard className="!py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
                    <ExerciseIllustration
                      exerciseName={ex.name}
                      variant="list"
                      className="mx-auto sm:mx-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={ex.isCompleted}
                          onChange={(e) => void toggleExercise(ex.id, e.target.checked)}
                          aria-label={`Concluído: ${ex.name}`}
                          className="mt-1 size-6 shrink-0 rounded-md border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span
                              className={`block text-base font-medium ${ex.isCompleted ? "text-[var(--muted-foreground)] line-through" : ""}`}
                            >
                              {ex.name}
                            </span>
                            {ex.isCompleted ? (
                              <button
                                type="button"
                                onClick={() => setCompletedExpanded(ex.id, false)}
                                className="text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
                              >
                                Ocultar
                              </button>
                            ) : null}
                          </div>
                          <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                            {ex.sets}×{ex.reps}
                          </span>
                        </div>
                      </div>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        Peso
                        <input
                          value={ex.weight}
                          onChange={(e) => updateExerciseMeta(ex.id, { weight: e.target.value })}
                          onBlur={() => void persistExerciseMeta(ex.id)}
                          placeholder="Ex.: 22,5 kg"
                          className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm font-normal text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
                        Notas
                        <textarea
                          value={ex.notes}
                          onChange={(e) => updateExerciseMeta(ex.id, { notes: e.target.value })}
                          onBlur={() => void persistExerciseMeta(ex.id)}
                          placeholder="Anotações"
                          rows={3}
                          className="resize-y rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm font-normal text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
                        />
                      </label>
                    </div>
                  </div>
                </AppCard>
              </li>
            );
          })}
        </ul>
      )}
      {exercises.length > 0 && !sessionFinished ? (
        <AppCard className="mt-4">
          <p className="text-sm text-[var(--foreground)]">
            Ao finalizar, os exercícios que faltam são marcados para hoje e o{" "}
            <strong>check-in diário</strong> (aba Hábito) é registrado automaticamente.
          </p>
          <PrimaryButton
            type="button"
            className="mt-4"
            disabled={isFinishing}
            onClick={() => void handleFinishWorkout()}
          >
            {isFinishing ? "Salvando…" : "Finalizar treino e registrar check-in"}
          </PrimaryButton>
          {finishMessage ? (
            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400" role="status">
              {finishMessage}
            </p>
          ) : null}
        </AppCard>
      ) : null}
      {sessionFinished ? (
        <AppCard className="mt-4 border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
            Treino fechado
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-800/90 dark:text-emerald-200/90">
            {totalCount} exercício(s) registrados para hoje.
          </p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {finishMessage ||
              "Seu check-in diário foi registrado no calendário de hábitos (aba Hábito)."}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/home"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-center text-sm font-semibold text-[var(--accent-foreground)]"
            >
              Ir ao início
            </Link>
            <Link
              href="/workouts"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-center text-sm font-semibold text-[var(--foreground)]"
            >
              Meus treinos
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setSessionFinished(false)}
            className="mt-4 w-full text-center text-xs font-semibold text-[var(--muted-foreground)] underline-offset-2 hover:underline"
          >
            Mostrar lista de exercícios de novo
          </button>
        </AppCard>
      ) : null}
      {exercises.length > 0 && !sessionFinished ? (
        <p className="mt-4 text-center text-[10px] leading-snug text-[var(--muted-foreground)]">
          Imagens de referência (quando aparecem) vêm do{" "}
          <a
            href="https://wger.de"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            wger.de
          </a>
          , licença CC BY-SA.
        </p>
      ) : null}
    </>
  );
}
