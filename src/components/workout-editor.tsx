"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ExerciseIllustration } from "@/components/exercise-illustration";
import { PrimaryButton } from "@/components/primary-button";
import type { DayOfWeekKey } from "@/lib/constants/weekdays";
import { WEEKDAY_SELECT_OPTIONS } from "@/lib/constants/weekdays";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import type { ExerciseDraft } from "@/lib/types/workout-types";

type WorkoutEditorProps = {
  editingWorkoutId?: string;
};

const DEFAULT_EXERCISE: ExerciseDraft = {
  name: "",
  sets: 3,
  reps: "10",
  weight: "",
  notes: "",
};

export function WorkoutEditor({ editingWorkoutId }: WorkoutEditorProps) {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekKey>("monday");
  const [exercises, setExercises] = useState<ExerciseDraft[]>([{ ...DEFAULT_EXERCISE }]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(editingWorkoutId));
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const loadWorkout = useCallback(async () => {
    if (!editingWorkoutId) {
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
    const { data: w, error: wError } = await supabase
      .from("workouts")
      .select("id,name,day_of_week")
      .eq("id", editingWorkoutId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (wError || !w) {
      setErrorMessage("Treino não encontrado.");
      setIsLoading(false);
      return;
    }
    setName(w.name as string);
    setDayOfWeek(w.day_of_week as DayOfWeekKey);
    const { data: exRows, error: exError } = await supabase
      .from("exercises")
      .select("id,name,sets,reps,weight,notes")
      .eq("workout_id", editingWorkoutId)
      .order("id", { ascending: true });
    if (exError) {
      setErrorMessage(exError.message);
      setIsLoading(false);
      return;
    }
    if (exRows?.length) {
      setExercises(
        exRows.map((row) => ({
          id: row.id as string,
          name: row.name as string,
          sets: row.sets as number,
          reps: String(row.reps),
          weight: String(row.weight ?? ""),
          notes: String(row.notes ?? ""),
        })),
      );
    } else {
      setExercises([{ ...DEFAULT_EXERCISE }]);
    }
    setIsLoading(false);
  }, [editingWorkoutId]);
  useEffect(() => {
    const timeoutId: number = window.setTimeout(() => {
      void loadWorkout();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadWorkout]);
  function addExerciseRow() {
    setExercises((prev) => [...prev, { ...DEFAULT_EXERCISE }]);
  }
  function updateExerciseRow(index: number, patch: Partial<ExerciseDraft>) {
    setExercises((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }
  function removeExerciseRow(index: number) {
    setExercises((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    const trimmed: ExerciseDraft[] = exercises
      .map((row) => ({
        ...row,
        name: row.name.trim(),
        sets: Math.max(1, Number(row.sets) || 1),
        reps: row.reps.trim() || "10",
        weight: row.weight.trim(),
        notes: row.notes.trim(),
      }))
      .filter((row) => row.name.length > 0);
    if (!name.trim()) {
      setErrorMessage("Informe o nome do treino.");
      return;
    }
    if (!trimmed.length) {
      setErrorMessage("Adicione pelo menos um exercício com nome.");
      return;
    }
    setIsSaving(true);
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErrorMessage("Sessão expirada. Entre novamente.");
      setIsSaving(false);
      return;
    }
    if (editingWorkoutId) {
      const { error: uError } = await supabase
        .from("workouts")
        .update({ name: name.trim(), day_of_week: dayOfWeek })
        .eq("id", editingWorkoutId)
        .eq("user_id", user.id);
      if (uError) {
        setErrorMessage(uError.message);
        setIsSaving(false);
        return;
      }
      const { error: dError } = await supabase
        .from("exercises")
        .delete()
        .eq("workout_id", editingWorkoutId);
      if (dError) {
        setErrorMessage(dError.message);
        setIsSaving(false);
        return;
      }
      const { error: iError } = await supabase.from("exercises").insert(
        trimmed.map((row) => ({
          workout_id: editingWorkoutId,
          name: row.name,
          sets: row.sets,
          reps: row.reps,
          weight: row.weight,
          notes: row.notes,
        })),
      );
      if (iError) {
        setErrorMessage(iError.message);
        setIsSaving(false);
        return;
      }
    } else {
      const { data: created, error: cError } = await supabase
        .from("workouts")
        .insert({
          user_id: user.id,
          name: name.trim(),
          day_of_week: dayOfWeek,
        })
        .select("id")
        .single();
      if (cError || !created) {
        setErrorMessage(cError?.message ?? "Não foi possível criar o treino.");
        setIsSaving(false);
        return;
      }
      const newId: string = created.id as string;
      const { error: iError } = await supabase.from("exercises").insert(
        trimmed.map((row) => ({
          workout_id: newId,
          name: row.name,
          sets: row.sets,
          reps: row.reps,
          weight: row.weight,
          notes: row.notes,
        })),
      );
      if (iError) {
        setErrorMessage(iError.message);
        setIsSaving(false);
        return;
      }
    }
    setIsSaving(false);
    router.replace("/workouts");
    router.refresh();
  }
  if (isLoading) {
    return <p className="text-[var(--muted-foreground)]">Carregando…</p>;
  }
  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Nome do treino
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Peito e tríceps"
          className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-base outline-none ring-[var(--accent)] focus:ring-2"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Dia da semana
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value as DayOfWeekKey)}
          className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-base outline-none ring-[var(--accent)] focus:ring-2"
        >
          {WEEKDAY_SELECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">Exercícios</span>
          <button
            type="button"
            onClick={addExerciseRow}
            className="text-sm font-semibold text-[var(--accent)]"
          >
            + Adicionar
          </button>
        </div>
        <ul className="flex flex-col gap-4">
          {exercises.map((row, index) => (
            <li
              key={`${row.id ?? "new"}-${index}`}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  #{index + 1}
                </span>
                {exercises.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeExerciseRow(index)}
                    className="text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    Remover
                  </button>
                ) : null}
              </div>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
                <ExerciseIllustration
                  exerciseName={row.name.trim().length >= 1 ? row.name : " "}
                  variant="list"
                  className="mx-auto sm:mx-0"
                />
                <div className="min-w-0 flex-1 flex flex-col gap-3">
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Nome
                    <input
                      value={row.name}
                      onChange={(e) => updateExerciseRow(index, { name: e.target.value })}
                      placeholder="Ex.: Supino reto"
                      className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Séries
                      <input
                        type="number"
                        min={1}
                        value={row.sets}
                        onChange={(e) =>
                          updateExerciseRow(index, { sets: Math.max(1, Number(e.target.value) || 1) })
                        }
                        className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Reps
                      <input
                        value={row.reps}
                        onChange={(e) => updateExerciseRow(index, { reps: e.target.value })}
                        placeholder="10 ou 8-12"
                        className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Peso (carga)
                    <input
                      value={row.weight}
                      onChange={(e) => updateExerciseRow(index, { weight: e.target.value })}
                      placeholder="Ex.: 20 kg, 10+10 kg cada lado"
                      className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Notas
                    <textarea
                      value={row.notes}
                      onChange={(e) => updateExerciseRow(index, { notes: e.target.value })}
                      placeholder="Técnica, progressão, lesão…"
                      rows={3}
                      className="resize-y rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-base outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <PrimaryButton type="submit" disabled={isSaving}>
        {isSaving ? "Salvando…" : editingWorkoutId ? "Salvar alterações" : "Criar treino"}
      </PrimaryButton>
    </form>
  );
}
