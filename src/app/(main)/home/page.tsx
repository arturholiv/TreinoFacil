"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppCard } from "@/components/app-card";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { WEEKDAY_LABELS_PT } from "@/lib/constants/weekdays";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { WorkoutRow } from "@/lib/types/workout-types";
import { getLocalDayOfWeekKey } from "@/lib/utils/local-date";

export default function HomePage() {
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const todayKey = getLocalDayOfWeekKey();
  const todayLabel: string = WEEKDAY_LABELS_PT[todayKey];
  const loadToday = useCallback(async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("workouts")
      .select("id,user_id,name,day_of_week,created_at")
      .eq("user_id", user.id)
      .eq("day_of_week", todayKey)
      .maybeSingle();
    if (error) {
      console.error(error);
      setWorkout(null);
    } else {
      setWorkout(data as WorkoutRow | null);
    }
    setIsLoading(false);
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
    router.replace("/login");
    router.refresh();
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
      {isLoading ? (
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
