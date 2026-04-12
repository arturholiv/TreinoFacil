"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppCard } from "@/components/app-card";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import {
  compareYmd,
  evaluateSixtyDayChallenge,
  getSixtyDayChallengeDayIndex,
  getSixtyDayChallengeEndYmd,
  SIXTY_DAY_CHALLENGE_TOTAL_DAYS,
  SIXTY_DAY_PENALTY_BAD_DIET_REAIS,
  SIXTY_DAY_PENALTY_NO_CARDIO_REAIS,
  SIXTY_DAY_PENALTY_NO_WORKOUT_REAIS,
  SIXTY_DAY_STAKE_DEFAULT_REAIS,
  type SixtyDayChallengeDayRow,
  type SixtyDayChallengeStatus,
  type SixtyDayEvaluation,
} from "@/lib/utils/sixty-day-challenge";
import { getLocalDateYmd } from "@/lib/utils/local-date";

type ChallengeRow = {
  id: string;
  start_date: string;
  stake_reais: number;
  status: SixtyDayChallengeStatus;
  stopped_cardio: boolean;
};

function formatBrl(reais: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(reais);
}

type PillarToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled: boolean;
};

type DayPillarsFormProps = {
  selectedYmd: string;
  existingRow: SixtyDayChallengeDayRow | undefined;
  canEdit: boolean;
  isSaving: boolean;
  onSave: (row: SixtyDayChallengeDayRow) => Promise<void>;
};

function DayPillarsForm({
  selectedYmd,
  existingRow,
  canEdit,
  isSaving,
  onSave,
}: DayPillarsFormProps) {
  const [workoutOk, setWorkoutOk] = useState<boolean>(() => existingRow?.workout_ok ?? true);
  const [cardioOk, setCardioOk] = useState<boolean>(() => existingRow?.cardio_ok ?? true);
  const [dietOk, setDietOk] = useState<boolean>(() => existingRow?.diet_ok ?? true);
  const [sleepOk, setSleepOk] = useState<boolean>(() => existingRow?.sleep_ok ?? true);
  const todayPenaltyPreview: number = useMemo(() => {
    let p = 0;
    if (!workoutOk) {
      p += SIXTY_DAY_PENALTY_NO_WORKOUT_REAIS;
    }
    if (!cardioOk) {
      p += SIXTY_DAY_PENALTY_NO_CARDIO_REAIS;
    }
    if (!dietOk) {
      p += SIXTY_DAY_PENALTY_BAD_DIET_REAIS;
    }
    return p;
  }, [workoutOk, cardioOk, dietOk]);
  const isPerfectPreview: boolean = workoutOk && cardioOk && dietOk && sleepOk;
  return (
    <>
      <div className="mt-2">
        <PillarToggleRow
          label="Treino"
          description="Treinou como combinado?"
          value={workoutOk}
          onChange={setWorkoutOk}
          disabled={!canEdit || isSaving}
        />
        <PillarToggleRow
          label="Cardio"
          description="Cardio do dia feito?"
          value={cardioOk}
          onChange={setCardioOk}
          disabled={!canEdit || isSaving}
        />
        <PillarToggleRow
          label="Dieta"
          description="Dieta no plano (OK) ou fora (Não)?"
          value={dietOk}
          onChange={setDietOk}
          disabled={!canEdit || isSaving}
        />
        <PillarToggleRow
          label="Sono"
          description="Sono adequado?"
          value={sleepOk}
          onChange={setSleepOk}
          disabled={!canEdit || isSaving}
        />
      </div>
      {!canEdit ? (
        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
          Escolha uma data entre o início do desafio e hoje (ou o último dia do desafio, se já passou).
        </p>
      ) : null}
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        Prévia de multas deste registro:{" "}
        <span className="font-semibold text-[var(--foreground)]">{formatBrl(todayPenaltyPreview)}</span>
        {isPerfectPreview ? (
          <span className="text-emerald-600 dark:text-emerald-400"> · dia perfeito 4/4</span>
        ) : null}
      </p>
      <PrimaryButton
        type="button"
        className="mt-4"
        disabled={!canEdit || isSaving}
        onClick={() =>
          void onSave({
            log_date: selectedYmd,
            workout_ok: workoutOk,
            cardio_ok: cardioOk,
            diet_ok: dietOk,
            sleep_ok: sleepOk,
          })
        }
      >
        {isSaving ? "Salvando…" : "Salvar dia"}
      </PrimaryButton>
    </>
  );
}

function PillarToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: PillarToggleRowProps) {
  return (
    <div className="border-b border-[var(--border)] py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{description}</p>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 p-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(true)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              value
                ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "text-[var(--muted-foreground)]"
            } disabled:opacity-50`}
          >
            OK
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(false)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              !value
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted-foreground)]"
            } disabled:opacity-50`}
          >
            Não
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Desafio60Page() {
  const [todayYmd, setTodayYmd] = useState<string>("");
  const [challenge, setChallenge] = useState<ChallengeRow | null>(null);
  const [dayRows, setDayRows] = useState<SixtyDayChallengeDayRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [stakeInput, setStakeInput] = useState<string>(String(SIXTY_DAY_STAKE_DEFAULT_REAIS));
  const [selectedYmd, setSelectedYmd] = useState<string>(() => getLocalDateYmd());
  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    const ymd: string = getLocalDateYmd();
    setTodayYmd(ymd);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setChallenge(null);
      setDayRows([]);
      setSelectedYmd(getLocalDateYmd());
      setIsLoading(false);
      return;
    }
    const { data: chData, error: chError } = await supabase
      .from("sixty_day_challenges")
      .select("id, start_date, stake_reais, status, stopped_cardio")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (chError) {
      const missing: boolean =
        chError.code === "PGRST205" ||
        (typeof chError.message === "string" && chError.message.includes("schema cache"));
      setTableMissing(missing);
      if (!missing) {
        console.error(chError);
        setErrorMessage(chError.message);
      }
      setChallenge(null);
      setDayRows([]);
      setSelectedYmd(getLocalDateYmd());
      setIsLoading(false);
      return;
    }
    setTableMissing(false);
    if (!chData) {
      setChallenge(null);
      setDayRows([]);
      setSelectedYmd(getLocalDateYmd());
      setIsLoading(false);
      return;
    }
    const nextChallenge: ChallengeRow = {
      id: chData.id as string,
      start_date: chData.start_date as string,
      stake_reais: Number(chData.stake_reais),
      status: chData.status as SixtyDayChallengeStatus,
      stopped_cardio: Boolean(chData.stopped_cardio),
    };
    const { data: daysData, error: daysError } = await supabase
      .from("sixty_day_challenge_days")
      .select("log_date, workout_ok, cardio_ok, diet_ok, sleep_ok")
      .eq("challenge_id", nextChallenge.id)
      .order("log_date", { ascending: true });
    if (daysError) {
      console.error(daysError);
      setErrorMessage(daysError.message);
      setChallenge(null);
      setDayRows([]);
      setSelectedYmd(getLocalDateYmd());
      setIsLoading(false);
      return;
    }
    const rows: SixtyDayChallengeDayRow[] = (daysData ?? []).map(
      (r: {
        log_date: string;
        workout_ok: boolean;
        cardio_ok: boolean;
        diet_ok: boolean;
        sleep_ok: boolean;
      }) => ({
        log_date: r.log_date,
        workout_ok: r.workout_ok,
        cardio_ok: r.cardio_ok,
        diet_ok: r.diet_ok,
        sleep_ok: r.sleep_ok,
      }),
    );
    const windowEnd: string = getSixtyDayChallengeEndYmd(nextChallenge.start_date);
    const today: string = getLocalDateYmd();
    let clampedDate: string = today;
    if (compareYmd(today, nextChallenge.start_date) < 0) {
      clampedDate = nextChallenge.start_date;
    } else if (compareYmd(today, windowEnd) > 0) {
      clampedDate = windowEnd;
    }
    setSelectedYmd(clampedDate);
    setChallenge(nextChallenge);
    setDayRows(rows);
    setIsLoading(false);
  }, []);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {
      void loadAll();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAll]);
  const endYmd: string | null = challenge ? getSixtyDayChallengeEndYmd(challenge.start_date) : null;
  const evaluation: SixtyDayEvaluation | null = useMemo(() => {
    if (!challenge || !todayYmd) {
      return null;
    }
    return evaluateSixtyDayChallenge({
      status: challenge.status,
      startYmd: challenge.start_date,
      stakeReais: challenge.stake_reais,
      stoppedCardio: challenge.stopped_cardio,
      todayYmd,
      dayRows,
    });
  }, [challenge, dayRows, todayYmd]);
  useEffect(() => {
    if (!challenge || challenge.status !== "active" || !evaluation) {
      return;
    }
    if (evaluation.outcome !== "won" && evaluation.outcome !== "lost") {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      const { error } = await supabase
        .from("sixty_day_challenges")
        .update({ status: evaluation.outcome })
        .eq("id", challenge.id)
        .eq("status", "active");
      if (error) {
        console.error(error);
        return;
      }
      setChallenge((prev) =>
        prev ? { ...prev, status: evaluation.outcome as SixtyDayChallengeStatus } : prev,
      );
    })();
  }, [challenge, evaluation]);
  const minLogYmd: string | null = challenge ? challenge.start_date : null;
  const maxLogYmd: string | null =
    challenge && endYmd && todayYmd ? (compareYmd(endYmd, todayYmd) < 0 ? endYmd : todayYmd) : null;
  const canEditSelected: boolean = Boolean(
    challenge &&
      challenge.status === "active" &&
      minLogYmd &&
      maxLogYmd &&
      compareYmd(selectedYmd, minLogYmd) >= 0 &&
      compareYmd(selectedYmd, maxLogYmd) <= 0,
  );
  async function handleStartChallenge() {
    setErrorMessage("");
    const parsed: number = Number.parseFloat(stakeInput.replace(",", "."));
    const stake: number = Number.isFinite(parsed) && parsed > 0 ? parsed : SIXTY_DAY_STAKE_DEFAULT_REAIS;
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Entre na sua conta para iniciar o desafio.");
      return;
    }
    setIsSaving(true);
    const startYmd: string = getLocalDateYmd();
    const { error } = await supabase.from("sixty_day_challenges").insert({
      user_id: user.id,
      start_date: startYmd,
      stake_reais: stake,
      status: "active",
      stopped_cardio: false,
    });
    setIsSaving(false);
    if (error) {
      if (error.code === "23505") {
        setErrorMessage("Já existe um desafio ativo. Finalize-o antes de criar outro.");
      } else {
        setErrorMessage(error.message);
      }
      return;
    }
    void loadAll();
  }
  async function handleSaveDay(row: SixtyDayChallengeDayRow) {
    if (!challenge || !canEditSelected) {
      return;
    }
    setIsSaving(true);
    setErrorMessage("");
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("sixty_day_challenge_days").upsert(
      {
        challenge_id: challenge.id,
        log_date: row.log_date,
        workout_ok: row.workout_ok,
        cardio_ok: row.cardio_ok,
        diet_ok: row.diet_ok,
        sleep_ok: row.sleep_ok,
      },
      { onConflict: "challenge_id,log_date" },
    );
    setIsSaving(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setDayRows((prev: SixtyDayChallengeDayRow[]) => {
      const next: SixtyDayChallengeDayRow[] = prev.filter(
        (r: SixtyDayChallengeDayRow) => r.log_date !== row.log_date,
      );
      next.push(row);
      return next.sort((a: SixtyDayChallengeDayRow, b: SixtyDayChallengeDayRow) =>
        compareYmd(a.log_date, b.log_date),
      );
    });
  }
  async function handleAbandon() {
    if (!challenge || challenge.status !== "active") {
      return;
    }
    const ok: boolean = window.confirm("Abandonar o desafio conta como derrota. Continuar?");
    if (!ok) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("sixty_day_challenges")
      .update({ status: "abandoned" })
      .eq("id", challenge.id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setChallenge((prev) => (prev ? { ...prev, status: "abandoned" } : prev));
  }
  async function handleStopCardio() {
    if (!challenge || challenge.status !== "active") {
      return;
    }
    const ok: boolean = window.confirm(
      "Declarar que parou o cardio encerra o desafio como derrota. Confirmar?",
    );
    if (!ok) {
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("sixty_day_challenges")
      .update({ stopped_cardio: true, status: "lost" })
      .eq("id", challenge.id);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setChallenge((prev) =>
      prev ? { ...prev, stopped_cardio: true, status: "lost" } : prev,
    );
  }
  const dayIndex: number =
    challenge && todayYmd
      ? getSixtyDayChallengeDayIndex(challenge.start_date, todayYmd)
      : 0;
  const existingRowForSelected: SixtyDayChallengeDayRow | undefined = challenge
    ? dayRows.find((r: SixtyDayChallengeDayRow) => r.log_date === selectedYmd)
    : undefined;
  return (
    <>
      <PageHeader
        title="Desafio 60 dias"
        subtitle="Contrato com você mesmo: tracking diário, metas e pote."
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
        <AppCard className="mb-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            As tabelas do desafio ainda não existem. Rode no Supabase SQL Editor o arquivo{" "}
            <code className="text-xs">supabase/migrations/005_sixty_day_challenge.sql</code> (ou o trecho
            correspondente em <code className="text-xs">supabase/schema.sql</code>).
          </p>
        </AppCard>
      ) : null}
      {!isLoading && !challenge ? (
        <AppCard className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Iniciar contrato</h2>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Separe o valor na vida real; aqui você só registra o compromisso e o acompanhamento. Valor
            padrão: {formatBrl(SIXTY_DAY_STAKE_DEFAULT_REAIS)}.
          </p>
          <label className="mt-4 block text-xs font-medium text-[var(--foreground)]">
            Valor do pote (R$)
            <input
              type="text"
              inputMode="decimal"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
          <PrimaryButton
            type="button"
            className="mt-4"
            disabled={isSaving}
            onClick={() => void handleStartChallenge()}
          >
            {isSaving ? "Salvando…" : `Começar ${SIXTY_DAY_CHALLENGE_TOTAL_DAYS} dias`}
          </PrimaryButton>
        </AppCard>
      ) : null}
      {challenge && evaluation ? (
        <AppCard className="mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Status</h2>
            <span className="text-xs text-[var(--muted-foreground)]">
              Dia {dayIndex}/{SIXTY_DAY_CHALLENGE_TOTAL_DAYS} · até {endYmd}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-[var(--muted)]/50 px-3 py-3">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                {formatBrl(evaluation.remainingStakeReais)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">saldo do pote (após multas)</p>
            </div>
            <div className="rounded-xl bg-[var(--muted)]/50 px-3 py-3">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                {formatBrl(evaluation.totalPenaltiesReais)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">total de multas registradas</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Sequência perfeita (4/4): <span className="font-semibold text-[var(--foreground)]">{evaluation.perfectStreak}</span>{" "}
            dia(s). {evaluation.combo7Unlocked ? "Combo 7+ ativo — recompensa leve liberada. " : ""}
            {evaluation.combo14Unlocked ? "Combo 14+ — recompensa pequena liberada." : ""}
          </p>
          {challenge.status === "active" ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Treinos OK no período: {evaluation.workoutOkInWindow} · Marcados &quot;não treinei&quot;:{" "}
              {evaluation.explicitWorkoutFails} · Dias dieta ruim: {evaluation.badDietDays}
            </p>
          ) : null}
          {challenge.status !== "active" ? (
            <p className="mt-3 rounded-xl bg-[var(--muted)]/60 px-3 py-2 text-sm font-medium text-[var(--foreground)]">
              {challenge.status === "won"
                ? "Vitória — use o pote para algo que represente evolução."
                : challenge.status === "abandoned"
                  ? "Desafio abandonado."
                  : `Derrota${evaluation.lostReasons.length ? `: ${evaluation.lostReasons.join(" ")}` : "."}`}
            </p>
          ) : null}
        </AppCard>
      ) : null}
      {challenge && challenge.status === "active" ? (
        <AppCard className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Tracking diário</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Dia perfeito = 4/4. Multas do dia: treino −{formatBrl(SIXTY_DAY_PENALTY_NO_WORKOUT_REAIS)}, cardio −
            {formatBrl(SIXTY_DAY_PENALTY_NO_CARDIO_REAIS)}, dieta −{formatBrl(SIXTY_DAY_PENALTY_BAD_DIET_REAIS)}.
          </p>
          <label className="mt-4 block text-xs font-medium text-[var(--foreground)]">
            Data
            <input
              type="date"
              value={selectedYmd}
              min={minLogYmd ?? undefined}
              max={maxLogYmd ?? undefined}
              onChange={(e) => setSelectedYmd(e.target.value)}
              disabled={!challenge}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </label>
          <DayPillarsForm
            key={selectedYmd}
            selectedYmd={selectedYmd}
            existingRow={existingRowForSelected}
            canEdit={canEditSelected}
            isSaving={isSaving}
            onSave={handleSaveDay}
          />
        </AppCard>
      ) : null}
      {challenge && challenge.status === "active" ? (
        <AppCard className="mb-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Zona de risco</h2>
          <button
            type="button"
            onClick={() => void handleStopCardio()}
            className="w-full rounded-xl border border-red-300/80 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            Parei o cardio (derrota imediata)
          </button>
          <button
            type="button"
            onClick={() => void handleAbandon()}
            className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]"
          >
            Abandonar o plano
          </button>
        </AppCard>
      ) : null}
      <AppCard className="mb-8">
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
            Regras do sistema (resumo)
          </summary>
          <div className="mt-3 space-y-3 text-xs text-[var(--muted-foreground)]">
            <p>
              <span className="font-medium text-[var(--foreground)]">Contrato:</span> você define um
              pote (ex.: {formatBrl(SIXTY_DAY_STAKE_DEFAULT_REAIS)}). O app desconta multas do valor
              simbólico conforme você marca o dia — o cumprimento real é com você.
            </p>
            <p>
              <span className="font-medium text-[var(--foreground)]">Vitória (após 60 dias):</span>{" "}
              treino OK em pelo menos 85% dos dias; no máximo 2 dias com treino marcado como
              &quot;Não&quot;; no máximo 3 dias de dieta ruim; sem 3 dias seguidos sem treino; sem
              declarar que parou o cardio; consistência de treino não abaixo de 70% (após 14 dias
              úteis de histórico).
            </p>
            <p>
              <span className="font-medium text-[var(--foreground)]">Derrota imediata:</span> 3 dias
              seguidos sem treino; consistência &lt; 70%; declarar cardio parado; abandonar o plano.
            </p>
            <p>
              <span className="font-medium text-[var(--foreground)]">Combos:</span> 7 dias perfeitos
              seguidos → 1 refeição livre controlada ou pular 1 cardio leve (honor system). 14 dias
              perfeitos → recompensa pequena.
            </p>
            <p>
              <span className="font-medium text-[var(--foreground)]">Lembrete:</span> progressão
              semanal de cargas e treinar perto da falha ficam como hábito — use os treinos do app
              para apoiar.
            </p>
          </div>
        </details>
      </AppCard>
      {isLoading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Carregando…</p>
      ) : null}
      {errorMessage ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
