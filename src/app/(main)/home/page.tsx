"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppCard } from "@/components/app-card";
import { HomeLanding } from "@/components/home-landing";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { WEEKDAY_LABELS_PT } from "@/lib/constants/weekdays";
import { ExerciseIllustration } from "@/components/exercise-illustration";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ExerciseRow, WorkoutRow } from "@/lib/types/workout-types";
import { getLocalDateYmd, getLocalDayOfWeekKey } from "@/lib/utils/local-date";

type CheckinHomeState = "idle" | "hidden" | { hasCheckin: boolean };

export default function HomePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [todayExercises, setTodayExercises] = useState<
    Pick<ExerciseRow, "id" | "name" | "sets" | "reps">[]
  >([]);
  const [workoutLoading, setWorkoutLoading] = useState<boolean>(false);
  const [dbMissingTables, setDbMissingTables] = useState<boolean>(false);
  const [checkinHome, setCheckinHome] = useState<CheckinHomeState>("idle");
  const [checkinSaving, setCheckinSaving] = useState<boolean>(false);
  const todayKey = getLocalDayOfWeekKey();
  const todayLabel: string = WEEKDAY_LABELS_PT[todayKey];
  const loadToday = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthUser(null);
      setWorkout(null);
      setTodayExercises([]);
      setDbMissingTables(false);
      setWorkoutLoading(false);
      setCheckinHome("hidden");
      return;
    }
    setAuthUser(user);
    setWorkoutLoading(true);
    setDbMissingTables(false);
    const { data, error } = await supabase
      .from("workouts")
      .select("id,user_id,name,notes,day_of_week,created_at")
      .eq("user_id", user.id)
      .eq("day_of_week", todayKey)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      const isMissingTable: boolean =
        error.code === "PGRST205" ||
        (typeof error.message === "string" &&
          error.message.includes("schema cache"));
      setDbMissingTables(isMissingTable);
      if (!isMissingTable) {
        console.error(error);
      }
      setWorkout(null);
      setTodayExercises([]);
    } else {
      const raw = data as (WorkoutRow & { notes?: string }) | null;
      const w: WorkoutRow | null = raw
        ? { ...raw, notes: String(raw.notes ?? "") }
        : null;
      setWorkout(w);
      if (w) {
        const { data: exRows, error: exError } = await supabase
          .from("exercises")
          .select("id,name,sets,reps")
          .eq("workout_id", w.id)
          .order("id", { ascending: true });
        if (exError) {
          console.error(exError);
          setTodayExercises([]);
        } else {
          setTodayExercises((exRows ?? []) as Pick<ExerciseRow, "id" | "name" | "sets" | "reps">[]);
        }
      } else {
        setTodayExercises([]);
      }
    }
    setWorkoutLoading(false);
    const todayYmd: string = getLocalDateYmd();
    const { data: cinRow, error: cinError } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("user_id", user.id)
      .eq("checkin_date", todayYmd)
      .maybeSingle();
    if (cinError) {
      const missingCheckinTable: boolean =
        cinError.code === "PGRST205" ||
        (typeof cinError.message === "string" &&
          (cinError.message.includes("schema cache") ||
            cinError.message.includes("daily_checkins")));
      setCheckinHome(missingCheckinTable ? "hidden" : { hasCheckin: false });
    } else {
      setCheckinHome({ hasCheckin: Boolean(cinRow) });
    }
  }, [todayKey]);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {
      void loadToday();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadToday]);
  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setAuthUser(null);
    setWorkout(null);
    setCheckinHome("hidden");
    router.replace("/home");
    router.refresh();
  }
  async function handleQuickCheckin() {
    if (typeof checkinHome === "object" && checkinHome.hasCheckin) {
      return;
    }
    setCheckinSaving(true);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCheckinSaving(false);
      return;
    }
    const todayYmd: string = getLocalDateYmd();
    const { error } = await supabase.from("daily_checkins").insert({
      user_id: user.id,
      checkin_date: todayYmd,
    });
    setCheckinSaving(false);
    if (!error || error.code === "23505") {
      setCheckinHome({ hasCheckin: true });
    }
  }
  if (authUser === undefined) {
    return (
      <>
        <PageHeader title="Treino Fácil" subtitle="Carregando…" />
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Carregando…</p>
        </AppCard>
      </>
    );
  }
  if (authUser === null) {
    return (
      <>
        <PageHeader title="Bem-vindo" subtitle="Treinos simples no celular" />
        <AppCard>
          <HomeLanding />
        </AppCard>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Hoje"
        subtitle={todayLabel}
        action={
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm font-medium text-[var(--muted-foreground)] underline-offset-2 hover:underline"
          >
            Sair
          </button>
        }
      />
      {checkinHome !== "idle" && checkinHome !== "hidden" ? (
        <AppCard className="mb-4 !py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">Check-in de hoje</p>
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                Registro diário — veja o calendário em Hábito.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {checkinHome.hasCheckin ? (
                <span className="text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 sm:text-right">
                  Feito hoje
                </span>
              ) : (
                <PrimaryButton
                  type="button"
                  disabled={checkinSaving}
                  className="!min-h-11 sm:w-auto sm:min-w-[9rem]"
                  onClick={() => void handleQuickCheckin()}
                >
                  {checkinSaving ? "Salvando…" : "Fazer check-in"}
                </PrimaryButton>
              )}
              <Link
                href="/checkin"
                className="text-center text-xs font-semibold text-[var(--accent)] underline-offset-2 hover:underline sm:text-right"
              >
                Abrir calendário
              </Link>
            </div>
          </div>
        </AppCard>
      ) : null}
      {dbMissingTables ? (
        <AppCard>
          <h2 className="text-lg font-semibold">Banco ainda não configurado</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            O projeto Supabase ainda não tem as tabelas do app (erro PGRST205). No painel do
            Supabase, abra <strong>SQL Editor</strong>, cole o conteúdo do arquivo{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">supabase/schema.sql</code>{" "}
            do repositório e execute. Se o banco já existia antes, rode também{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">
              supabase/migrations/002_exercise_weight_notes.sql
            </code>{" "}
            e, para check-in diário,{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">
              supabase/migrations/003_daily_checkins.sql
            </code>{" "}
            e{" "}
            <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">
              supabase/migrations/004_workout_notes.sql
            </code>{" "}
            (notas gerais por treino). Depois atualize esta página.
          </p>
        </AppCard>
      ) : workoutLoading ? (
        <AppCard>
          <p className="text-[var(--muted-foreground)]">Carregando…</p>
        </AppCard>
      ) : workout ? (
        <AppCard>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Treino do dia
          </p>
          <h2 className="mt-2 text-xl font-semibold">{workout.name}</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Programado para {todayLabel}.
          </p>
          {workout.notes.trim().length > 0 ? (
            <details className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--input-bg)]/40 p-3 text-sm">
              <summary className="cursor-pointer font-semibold text-[var(--foreground)]">
                Regras da ficha (geral)
              </summary>
              <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed text-[var(--muted-foreground)]">
                {workout.notes}
              </p>
            </details>
          ) : null}
          {todayExercises.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs font-semibold text-[var(--foreground)]">Lista de exercícios</p>
              <ul className="mt-3 flex flex-col gap-3">
                {todayExercises.map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)]/50 p-3"
                  >
                    <ExerciseIllustration exerciseName={ex.name} variant="list" />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{ex.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {ex.sets}×{ex.reps}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <PrimaryButton
            type="button"
            className="mt-6"
            onClick={() => router.push(`/workout/${workout.id}`)}
          >
            Abrir treino completo
          </PrimaryButton>
          <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href="/workouts"
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Trocar o dia deste treino
            </Link>
          </p>
        </AppCard>
      ) : (
        <AppCard>
          <h2 className="text-lg font-semibold">Nenhum treino programado hoje</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Associe um treino a este dia da semana em &quot;Treinos&quot; ou crie um novo.
          </p>
          <PrimaryButton
            type="button"
            className="mt-6"
            onClick={() => router.push("/create-workout")}
          >
            Criar treino
          </PrimaryButton>
          <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href="/gerar-treinos"
              className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Sem ideia? Gerar treinos com IA
            </Link>
          </p>
        </AppCard>
      )}
    </>
  );
}
