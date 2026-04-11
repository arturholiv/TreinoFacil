"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { AppCard } from "@/components/app-card";
import { ExerciseIllustration } from "@/components/exercise-illustration";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ExerciseRow, WorkoutRow } from "@/lib/types/workout-types";
import { getLocalDateYmd } from "@/lib/utils/local-date";

type ExerciseWithDone = ExerciseRow & { isCompleted: boolean };

function isMissingWorkoutNotesColumnError(err: { message?: string } | null): boolean {
  const m: string = err?.message?.toLowerCase() ?? "";
  if (m.length === 0) {
    return false;
  }
  return (
    (m.includes("notes") && m.includes("workout")) ||
    (m.includes("schema cache") && m.includes("notes"))
  );
}

function IconCheckCircle(props: { className?: string }): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconChevronDown(props: { className?: string }): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconChevronUp(props: { className?: string }): ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params["id"];
  const workoutId: string =
    typeof idParam === "string" ? idParam : Array.isArray(idParam) ? (idParam[0] ?? "") : "";
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [exercises, setExercises] = useState<ExerciseWithDone[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authMissing, setAuthMissing] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Concluídos ficam compactos por padrão; true = usuário abriu para ver peso/notas. */
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
    setLoadError(null);
    setAuthMissing(false);
    if (!workoutId) {
      setWorkout(null);
      setExercises([]);
      setIsLoading(false);
      return;
    }
    if (lastResetSessionForWorkoutIdRef.current !== workoutId) {
      lastResetSessionForWorkoutIdRef.current = workoutId;
      setSessionFinished(false);
      setFinishMessage("");
      setExpandedCompletedIds({});
    }
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    let user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      const sessionUser = (await supabase.auth.getSession()).data.session?.user;
      user = sessionUser ?? null;
    }
    if (!user) {
      setWorkout(null);
      setExercises([]);
      setAuthMissing(true);
      setIsLoading(false);
      return;
    }
    let workoutRes = await supabase
      .from("workouts")
      .select("id,user_id,name,notes,day_of_week,created_at")
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (workoutRes.error && isMissingWorkoutNotesColumnError(workoutRes.error)) {
      workoutRes = await supabase
        .from("workouts")
        .select("id,user_id,name,day_of_week,created_at")
        .eq("id", workoutId)
        .eq("user_id", user.id)
        .maybeSingle();
    }
    const workoutRow = workoutRes.data;
    const workoutError = workoutRes.error;
    if (workoutError) {
      setWorkout(null);
      setExercises([]);
      setLoadError(workoutError.message);
      setIsLoading(false);
      return;
    }
    if (!workoutRow) {
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
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadData();
    });
    return () => subscription.unsubscribe();
  }, [loadData]);
  function expandCompletedExercise(exerciseId: string) {
    setExpandedCompletedIds((prev) => ({ ...prev, [exerciseId]: true }));
  }
  function contractCompletedExercise(exerciseId: string) {
    setExpandedCompletedIds((prev) => {
      const next: Record<string, boolean> = { ...prev };
      delete next[exerciseId];
      return next;
    });
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
    contractCompletedExercise(exerciseId);
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
  const progressRatio: number = totalCount > 0 ? doneCount / totalCount : 0;
  const showStickyFinish: boolean = exercises.length > 0 && !sessionFinished;
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
  if (!workoutId) {
    return (
      <>
        <PageHeader title="Treino" />
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Link do treino inválido.</p>
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
  if (authMissing) {
    return (
      <>
        <PageHeader title="Treino" subtitle="Sessão" />
        <AppCard>
          <p className="text-[var(--muted-foreground)]">
            Entre na sua conta para carregar este treino. Se acabou de fazer login, aguarde um
            instante ou atualize a página.
          </p>
          <Link
            href={`/login?next=/workout/${encodeURIComponent(workoutId)}`}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)]"
          >
            Ir para login
          </Link>
          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-3 w-full rounded-xl border border-[var(--border)] py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Tentar de novo
          </button>
        </AppCard>
      </>
    );
  }
  if (!workout) {
    return (
      <>
        <PageHeader title="Treino" />
        <AppCard>
          <p className="text-[var(--muted-foreground)]">
            Treino não encontrado ou você não tem permissão para vê-lo.
          </p>
          {loadError ? (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400" role="status">
              Detalhe: {loadError}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Se você criou treinos antes de atualizar o banco, confira se a migração{" "}
            <code className="rounded bg-[var(--muted)] px-1">004_workout_notes.sql</code> foi
            aplicada no Supabase (ou rode o SQL da coluna <code className="rounded bg-[var(--muted)] px-1">notes</code> em{" "}
            <code className="rounded bg-[var(--muted)] px-1">workouts</code>).
          </p>
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
            : `${doneCount} de ${totalCount} exercícios nesta sessão`
        }
      />
      {workout.notes.trim().length > 0 ? (
        <details
          open
          className="group mb-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm transition-shadow hover:shadow-sm"
        >
          <summary className="cursor-pointer list-none font-semibold text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Regras da ficha (geral)
              <IconChevronDown className="size-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180" />
            </span>
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
        <div className={showStickyFinish ? "pb-36" : ""}>
          <div
            className="mb-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"
            role="status"
            aria-label={`Progresso: ${doneCount} de ${totalCount}`}
          >
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)]">
              <span>Progresso da sessão</span>
              <span className="tabular-nums text-[var(--foreground)]">
                {doneCount}/{totalCount}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
          </div>
          <ul className="flex flex-col gap-4">
            {exercises.map((ex) => {
              const isCompact: boolean = ex.isCompleted && !expandedCompletedIds[ex.id];
              if (isCompact) {
                return (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => expandCompletedExercise(ex.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5 text-left shadow-sm transition active:scale-[0.99] active:bg-[var(--muted)]"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <IconCheckCircle className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--foreground)] line-through decoration-[var(--muted-foreground)]/50">
                          {ex.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {ex.sets}×{ex.reps} · toque para ver peso e notas
                        </span>
                      </div>
                      <IconChevronDown className="size-5 shrink-0 text-[var(--accent)]" />
                    </button>
                  </li>
                );
              }
              return (
                <li key={ex.id}>
                  <AppCard
                    className={`!py-4 transition-[box-shadow,border-color] duration-200 ${
                      ex.isCompleted
                        ? "border-emerald-500/35 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
                      <ExerciseIllustration
                        exerciseName={ex.name}
                        variant="list"
                        className="mx-auto sm:mx-0"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className={`block text-base font-semibold leading-snug ${
                                ex.isCompleted
                                  ? "text-[var(--muted-foreground)] line-through decoration-[var(--muted-foreground)]/40"
                                  : "text-[var(--foreground)]"
                              }`}
                            >
                              {ex.name}
                            </span>
                            <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                              {ex.sets}×{ex.reps}
                            </span>
                          </div>
                          {ex.isCompleted ? (
                            <button
                              type="button"
                              onClick={() => contractCompletedExercise(ex.id)}
                              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                              aria-label="Minimizar exercício"
                            >
                              <IconChevronUp className="size-5" />
                            </button>
                          ) : null}
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
                        <div className="pt-1">
                          {ex.isCompleted ? (
                            <button
                              type="button"
                              onClick={() => void toggleExercise(ex.id, false)}
                              className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-500/15 dark:text-emerald-200"
                            >
                              <IconCheckCircle className="size-5 shrink-0" />
                              Feito — toque para desfazer
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void toggleExercise(ex.id, true)}
                              className="w-full min-h-12 rounded-xl bg-[var(--accent)] px-4 text-base font-semibold text-[var(--accent-foreground)] shadow-sm transition hover:opacity-95 active:scale-[0.99]"
                            >
                              Marcar como feito
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </AppCard>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-center text-[10px] leading-snug text-[var(--muted-foreground)]">
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
        </div>
      )}
      {showStickyFinish ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:shadow-[0_-8px_30px_rgba(0,0,0,0.35)]">
            <p className="text-center text-xs leading-snug text-[var(--muted-foreground)]">
              Quando terminar a sessão, use o botão abaixo para salvar o treino de hoje e registrar o
              check-in em <strong className="text-[var(--foreground)]">Hábito</strong>.
            </p>
            <PrimaryButton
              type="button"
              className="mt-3 min-h-[3.25rem] text-[1.05rem]"
              disabled={isFinishing}
              onClick={() => void handleFinishWorkout()}
            >
              {isFinishing ? "Salvando…" : "Concluir treino de hoje"}
            </PrimaryButton>
            {finishMessage ? (
              <p className="mt-2 text-center text-xs text-amber-700 dark:text-amber-400" role="status">
                {finishMessage}
              </p>
            ) : null}
          </div>
        </div>
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
            className="mt-4 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
          >
            Voltar à lista do treino
          </button>
        </AppCard>
      ) : null}
    </>
  );
}
