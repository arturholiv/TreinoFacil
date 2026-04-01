"use client";

import { useEffect, useId, useState } from "react";

type ClearWorkoutsModalProps = {
  readonly isOpen: boolean;
  readonly workoutCount: number;
  readonly isSubmitting: boolean;
  readonly errorMessage?: string;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
};

/**
 * Modal de confirmação para apagar todos os treinos do usuário.
 */
export function ClearWorkoutsModal({
  isOpen,
  workoutCount,
  isSubmitting,
  errorMessage = "",
  onClose,
  onConfirm,
}: ClearWorkoutsModalProps) {
  const [hasAcknowledged, setHasAcknowledged] = useState<boolean>(false);
  const titleId: string = useId();
  const descriptionId: string = useId();
  const treinoLabel: string = workoutCount === 1 ? "treino" : "treinos";
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow: string = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        disabled={isSubmitting}
        onClick={() => onClose()}
        className="absolute inset-0 bg-[var(--foreground)]/25 backdrop-blur-sm transition-opacity disabled:pointer-events-none dark:bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 mb-[max(1rem,env(safe-area-inset-bottom))] w-full max-w-[420px] rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:mb-0 sm:mx-4"
      >
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div
            className="flex size-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/80"
            aria-hidden
          >
            <svg
              className="size-7 text-red-600 dark:text-red-400"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.577 4.5-2.598 4.5H4.645c-2.022 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a1 1 0 100-2 1 1 0 000 2z"
              />
            </svg>
          </div>
          <h2
            id={titleId}
            className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            Apagar todos os treinos?
          </h2>
          <p
            id={descriptionId}
            className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]"
          >
            Você vai remover <strong className="text-[var(--foreground)]">{workoutCount}</strong>{" "}
            {treinoLabel}. Isso apaga cada treino, a lista de exercícios e o histórico de conclusão
            desses exercícios.{" "}
            <strong className="text-[var(--foreground)]">Não dá para desfazer.</strong>
          </p>
        </div>
        {errorMessage ? (
          <p
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 p-4 text-left transition hover:bg-[var(--muted)]/80">
          <input
            type="checkbox"
            checked={hasAcknowledged}
            disabled={isSubmitting}
            onChange={(e) => setHasAcknowledged(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-sm leading-snug text-[var(--foreground)]">
            Entendo que todos os meus treinos e dados ligados a eles serão apagados permanentemente.
          </span>
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onClose()}
            className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-sm font-semibold text-[var(--foreground)] transition enabled:hover:bg-[var(--muted)] disabled:opacity-50 sm:w-auto sm:min-w-[7rem]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!hasAcknowledged || isSubmitting}
            onClick={() => onConfirm()}
            className="min-h-12 w-full rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-red-700 enabled:active:scale-[0.98] disabled:opacity-40 dark:bg-red-700 dark:enabled:hover:bg-red-600 sm:w-auto sm:min-w-[10rem]"
          >
            {isSubmitting ? "Apagando…" : "Apagar todos"}
          </button>
        </div>
      </div>
    </div>
  );
}
