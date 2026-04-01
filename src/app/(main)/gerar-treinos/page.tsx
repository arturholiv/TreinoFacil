"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppCard } from "@/components/app-card";
import { PageHeader } from "@/components/page-header";
import { PrimaryButton } from "@/components/primary-button";
import { WEEKDAY_LABELS_PT } from "@/lib/constants/weekdays";
import type { DayOfWeekKey } from "@/lib/constants/weekdays";
import type { AbcFrequency, SplitKind } from "@/lib/constants/split-templates";
import {
  buildWeeklyPlan,
  exercisesForInsert,
  SPLIT_DEFINITIONS,
  workoutDisplayName,
} from "@/lib/constants/split-templates";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function GerarTreinosPage() {
  const router = useRouter();
  const [splitKind, setSplitKind] = useState<SplitKind>("ABC");
  const [abcFrequency, setAbcFrequency] = useState<AbcFrequency>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const planPreview = useMemo(() => {
    if (splitKind !== "ABC") {
      return buildWeeklyPlan(splitKind, 3);
    }
    return buildWeeklyPlan("ABC", abcFrequency);
  }, [splitKind, abcFrequency]);
  async function handleGenerate() {
    setErrorMessage("");
    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Faça login para gerar treinos.");
      setIsSubmitting(false);
      return;
    }
    const plan =
      splitKind === "ABC"
        ? buildWeeklyPlan("ABC", abcFrequency)
        : buildWeeklyPlan(splitKind, 3);
    for (const item of plan) {
      const name: string = workoutDisplayName(item.definition);
      const { data: created, error: wError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name,
          day_of_week: item.dayOfWeek,
        })
        .select("id")
        .single();
      if (wError || !created) {
        setErrorMessage(wError?.message ?? "Falha ao criar treino.");
        setIsSubmitting(false);
        return;
      }
      const workoutId: string = created.id as string;
      const exerciseRows = exercisesForInsert(item.definition);
      const { error: exError } = await supabase.from("exercises").insert(
        exerciseRows.map((ex) => ({
          workout_id: workoutId,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          notes: ex.notes,
          weight: "",
        })),
      );
      if (exError) {
        setErrorMessage(exError.message);
        setIsSubmitting(false);
        return;
      }
    }
    setIsSubmitting(false);
    router.replace("/workouts");
    router.refresh();
  }
  return (
    <>
      <PageHeader
        title="Treinos com IA"
        subtitle="Escolha ABC, ABCD, ABCDE ou o programa Leangains (7 dias, com postura e alongamentos)."
        action={
          <Link
            href="/workouts"
            className="text-sm font-medium text-[var(--muted-foreground)] underline-offset-2 hover:underline"
          >
            Voltar
          </Link>
        }
      />
      <AppCard className="mb-4">
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">Simples assim:</strong> você escolhe o tipo de
          divisão e quantos dias quer treinar. A <strong>inteligência artificial do app</strong> gera
          uma rotina completa e <strong>salva na sua conta</strong> — cada dia com seu treino e lista
          de exercícios. Depois é só usar: troque nome, dia, séries, peso ou notas quando quiser, em
          &quot;Treinos&quot; ou &quot;Editar treino&quot;. Tudo fica só no seu perfil.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
          Inclui o programa <strong>Leangains</strong> (foco estético, ombro lateral, costas, peito
          superior, posterior e postura) além das divisões ABC tradicionais.
        </p>
      </AppCard>
      <AppCard className="mb-6 flex flex-col gap-5">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Tipo de divisão
          </legend>
          <div className="mt-3 flex flex-col gap-2">
            {(
              [
                {
                  value: "ABC" as SplitKind,
                  label: "ABC — 3 grupos (Peito+tríceps / Costas+bíceps / Perna+ombro)",
                },
                {
                  value: "ABCD" as SplitKind,
                  label: "ABCD — 4 dias (Peito / Costas / Pernas / Ombro+braço)",
                },
                {
                  value: "ABCDE" as SplitKind,
                  label: "ABCDE — 5 dias (foco estético, 1 grupo por dia + braços+abdômen)",
                },
                {
                  value: "LEANGAINS" as SplitKind,
                  label:
                    "Leangains — 7 dias (seg–dom): musculação + postura/alongamentos; domingo recuperação leve",
                },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] p-3"
              >
                <input
                  type="radio"
                  name="split"
                  checked={splitKind === opt.value}
                  onChange={() => setSplitKind(opt.value)}
                  className="mt-1 size-4 shrink-0"
                />
                <span className="text-sm leading-snug">{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {splitKind === "ABC" ? (
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--foreground)]">
              Dias por semana (ABC)
            </legend>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              3× = segunda, quarta e sexta. 6× = segunda a sábado (ciclo A→B→C duas vezes).
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {(
                [
                  { value: 3 as AbcFrequency, label: "3 dias na semana" },
                  { value: 6 as AbcFrequency, label: "6 dias na semana" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] p-3"
                >
                  <input
                    type="radio"
                    name="abcfreq"
                    checked={abcFrequency === opt.value}
                    onChange={() => setAbcFrequency(opt.value)}
                    className="size-4"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : splitKind === "LEANGAINS" ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Leangains gera <strong>sete treinos</strong>: segunda a sábado com fichas detalhadas +
            postura; <strong>domingo</strong> só recuperação leve (caminhada/bike, alongamentos e
            mobilidade). Cardio por dia está nas notas do último bloco ou em &quot;Cardio
            (recomendado)&quot; quando aplicável.
          </p>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            {splitKind === "ABCD"
              ? "ABCD usa 4 dias: segunda, terça, quinta e sexta."
              : "ABCDE usa segunda a sexta (5 dias)."}
          </p>
        )}
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Prévia do calendário</h3>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[var(--muted-foreground)]">
            {planPreview.map((row, idx) => {
              const dayLabel: string = WEEKDAY_LABELS_PT[row.dayOfWeek as DayOfWeekKey];
              return (
                <li key={`${row.dayOfWeek}-${row.definition.letter}-${idx}`} className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <span className="shrink-0 font-medium text-[var(--foreground)]">{dayLabel}</span>
                  <span>{workoutDisplayName(row.definition)}</span>
                  <span className="text-xs">
                    ({row.definition.exercises.length} ex.
                    {row.definition.cardioHint ? " + cardio" : ""})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        {errorMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <PrimaryButton type="button" disabled={isSubmitting} onClick={() => void handleGenerate()}>
          {isSubmitting
            ? "Criando seus treinos…"
            : "Gerar meus treinos com inteligência artificial"}
        </PrimaryButton>
        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Seus treinos antigos não são apagados. Pode haver mais de um treino no mesmo dia — organize
          em &quot;Treinos&quot;.
        </p>
      </AppCard>
      <details className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
        <summary className="cursor-pointer font-medium text-[var(--foreground)]">
          Ver resumo dos exercícios por programa
        </summary>
        <div className="mt-4 flex flex-col gap-4 text-[var(--muted-foreground)]">
          {(Object.keys(SPLIT_DEFINITIONS) as SplitKind[]).map((k) => (
            <div key={k}>
              <p className="font-semibold text-[var(--foreground)]">{k}</p>
              <ul className="mt-2 space-y-3">
                {SPLIT_DEFINITIONS[k].map((d) => (
                  <li key={`${k}-${d.letter}-${d.title}`}>
                    <span className="text-[var(--foreground)]">
                      {d.workoutName ?? `${d.letter} — ${d.title}`}
                    </span>
                    <ul className="ml-3 mt-1 list-disc space-y-0.5">
                      {d.exercises.map((ex) => (
                        <li key={ex.name}>
                          {ex.name} — {ex.sets}×{ex.reps}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
