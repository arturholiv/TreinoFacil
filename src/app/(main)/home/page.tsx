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
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { WorkoutRow } from "@/lib/types/workout-types";
import { getLocalDayOfWeekKey } from "@/lib/utils/local-date";

export default function HomePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [workoutLoading, setWorkoutLoading] = useState<boolean>(false);
  const [dbMissingTables, setDbMissingTables] = useState<boolean>(false);
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
      setDbMissingTables(false);
      setWorkoutLoading(false);
      return;
    }
    setAuthUser(user);
    setWorkoutLoading(true);
    setDbMissingTables(false);
    const { data, error } = await supabase
      .from("workouts")
      .select("id,user_id,name,day_of_week,created_at")
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
    } else {
      setWorkout(data as WorkoutRow | null);
    }
    setWorkoutLoading(false);
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
    router.replace("/home");
    router.refresh();
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
            </code>
            . Depois atualize esta página.
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
          <PrimaryButton
            type="button"
            className="mt-6"
            onClick={() => router.push(`/workout/${workout.id}`)}
          >
            Ver treino
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
        </AppCard>
      )}
    </>
  );
}
