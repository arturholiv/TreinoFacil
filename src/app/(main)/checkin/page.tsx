"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppCard } from "@/components/app-card";
import { CheckinHeatmap } from "@/components/checkin-heatmap";
import { CheckinMonthCalendar } from "@/components/checkin-month-calendar";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { computeStreak, countCheckinsInYear, dateToYmd } from "@/lib/utils/checkin-heatmap";
import { getLocalDateYmd } from "@/lib/utils/local-date";

const HEATMAP_WEEKS = 48;
/** Jan 1 of (current year − 1) so month view + heatmap have dados suficientes. */
function getCheckinLoadStartYmd(end: Date): string {
  const y: number = end.getFullYear() - 1;
  const start: Date = new Date(y, 0, 1);
  start.setHours(0, 0, 0, 0);
  return dateToYmd(start);
}

export default function CheckinPage() {
  const [checkinSet, setCheckinSet] = useState<Set<string>>(new Set());
  const [todayYmd, setTodayYmd] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [calendarMode, setCalendarMode] = useState<"month" | "year">("month");
  const loadCheckins = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    setTodayYmd(getLocalDateYmd());
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCheckinSet(new Set());
      setIsLoading(false);
      return;
    }
    const end: Date = new Date();
    end.setHours(0, 0, 0, 0);
    const startYmd: string = getCheckinLoadStartYmd(end);
    const { data, error } = await supabase
      .from("daily_checkins")
      .select("checkin_date")
      .eq("user_id", user.id)
      .gte("checkin_date", startYmd)
      .order("checkin_date", { ascending: true });
    if (error) {
      const missing: boolean =
        error.code === "PGRST205" ||
        (typeof error.message === "string" && error.message.includes("schema cache"));
      setTableMissing(missing);
      if (!missing) {
        console.error(error);
        setErrorMessage(error.message);
      }
      setCheckinSet(new Set());
      setIsLoading(false);
      return;
    }
    setTableMissing(false);
    const next: Set<string> = new Set(
      (data ?? []).map((r: { checkin_date: string }) => r.checkin_date as string),
    );
    setCheckinSet(next);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {
      void loadCheckins();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCheckins]);
  const hasToday: boolean = Boolean(todayYmd && checkinSet.has(todayYmd));
  const streak: number = todayYmd ? computeStreak(checkinSet, todayYmd) : 0;
  const yearCount: number = todayYmd
    ? countCheckinsInYear(checkinSet, new Date().getFullYear())
    : 0;
  const totalCount: number = checkinSet.size;
  async function handleCheckin() {
    if (!todayYmd || hasToday) {
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setIsSaving(false);
      return;
    }
    const { error } = await supabase.from("daily_checkins").insert({
      user_id: user.id,
      checkin_date: todayYmd,
    });
    setIsSaving(false);
    if (error) {
      if (error.code === "23505") {
        setCheckinSet((prev) => new Set(prev).add(todayYmd));
        return;
      }
      setErrorMessage(error.message);
      return;
    }
    setCheckinSet((prev) => new Set(prev).add(todayYmd));
  }
  async function handleUndoToday() {
    if (!todayYmd || !hasToday) {
      return;
    }
    const confirmed: boolean = window.confirm("Remover o check-in de hoje?");
    if (!confirmed) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    const { error } = await supabase
      .from("daily_checkins")
      .delete()
      .eq("user_id", user.id)
      .eq("checkin_date", todayYmd);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setCheckinSet((prev) => {
      const n = new Set(prev);
      n.delete(todayYmd);
      return n;
    });
  }
  const minCalendarYear: number = new Date().getFullYear() - 1;
  return (
    <>
      <PageHeader
        title="Check-in diário"
        subtitle="Um registro por dia. Seu calendário de hábitos."
        action={
          <Link
            href="/home"
            className="text-sm font-medium text-[var(--muted-foreground)] underline-offset-2 hover:underline"
          >
            Início
          </Link>
        }
      />
      {tableMissing ? (
        <AppCard>
          <p className="text-sm text-[var(--muted-foreground)]">
            A tabela <code className="text-xs">daily_checkins</code> ainda não existe. Rode no
            Supabase SQL Editor o arquivo{" "}
            <code className="text-xs">supabase/migrations/003_daily_checkins.sql</code> (ou o
            trecho final de <code className="text-xs">supabase/schema.sql</code>).
          </p>
        </AppCard>
      ) : null}
      <AppCard className="mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{streak}</p>
            <p className="text-xs text-[var(--muted-foreground)]">sequência</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{yearCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">dias em {new Date().getFullYear()}</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[var(--foreground)]">{totalCount}</p>
            <p className="text-xs text-[var(--muted-foreground)]">no histórico</p>
          </div>
        </div>
        {hasToday ? (
          <div className="mt-4 rounded-xl bg-[var(--muted)]/60 px-4 py-3 text-center text-sm font-medium text-[var(--foreground)]">
            Check-in de hoje registrado
          </div>
        ) : (
          <PrimaryButton
            type="button"
            className="mt-4"
            disabled={isSaving || isLoading}
            onClick={() => void handleCheckin()}
          >
            {isSaving ? "Salvando…" : "Fiz check-in hoje"}
          </PrimaryButton>
        )}
        {hasToday ? (
          <button
            type="button"
            onClick={() => void handleUndoToday()}
            className="mt-3 w-full text-center text-xs text-[var(--muted-foreground)] underline-offset-2 hover:underline"
          >
            Desfazer check-in de hoje
          </button>
        ) : null}
        {errorMessage ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </AppCard>
      <AppCard>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Seu calendário</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {calendarMode === "month"
                ? "Navegue mês a mês — dias em destaque são os com check-in."
                : "Visão compacta do ano — deslize para trás nas semanas."}
            </p>
          </div>
          <div
            className="mt-3 flex shrink-0 rounded-xl border border-[var(--border)] bg-[var(--muted)]/35 p-1 sm:mt-0"
            role="tablist"
            aria-label="Modo do calendário"
          >
            <button
              type="button"
              role="tab"
              aria-selected={calendarMode === "month"}
              onClick={() => setCalendarMode("month")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                calendarMode === "month"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              Por mês
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={calendarMode === "year"}
              onClick={() => setCalendarMode("year")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                calendarMode === "year"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)]"
              }`}
            >
              Visão anual
            </button>
          </div>
        </div>
        {isLoading ? (
          <p className="mt-6 text-sm text-[var(--muted-foreground)]">Carregando…</p>
        ) : (
          <div className="mt-6">
            {calendarMode === "month" ? (
              <CheckinMonthCalendar
                checkinYmdSet={checkinSet}
                minCalendarYear={minCalendarYear}
              />
            ) : (
              <CheckinHeatmap
                checkinYmdSet={checkinSet}
                weekCount={HEATMAP_WEEKS}
                showScrollHint
              />
            )}
          </div>
        )}
      </AppCard>
    </>
  );
}
