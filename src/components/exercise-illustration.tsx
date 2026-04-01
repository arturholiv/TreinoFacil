"use client";

import Image from "next/image";
import { useState } from "react";
import { getExerciseIllustrationUrl } from "@/lib/constants/exercise-illustration-urls";

type ExerciseIllustrationProps = {
  exerciseName: string;
  className?: string;
  /** default: detalhe do treino · compact: editor · list: linha da lista (sempre ocupa espaço). */
  variant?: "default" | "compact" | "list";
};

/** Fundo branco fixo (como PNGs do catálogo), em claro e escuro. */
const ILLUSTRATION_SURFACE: string =
  "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)]";

/** Largura fixa: em flex, `w-full` colapsa quando o pai não tem largura (figura some). */
const LIST_FRAME: string = `relative h-[7.5rem] w-[11rem] min-w-[11rem] shrink-0 overflow-hidden rounded-xl border border-[var(--border)] ${ILLUSTRATION_SURFACE}`;

/**
 * Mostra ilustração do exercício quando houver URL mapeada (wger.de, CC BY-SA).
 * Variante `list` reserva espaço e mostra placeholder quando não houver figura.
 */
export function ExerciseIllustration({
  exerciseName,
  className = "",
  variant = "default",
}: ExerciseIllustrationProps) {
  const url: string | null = getExerciseIllustrationUrl(exerciseName);
  const [hasError, setHasError] = useState<boolean>(false);
  if (variant === "list") {
    const showImage: boolean = Boolean(url) && !hasError;
    return (
      <figure className={`w-[11rem] min-w-[11rem] shrink-0 ${className}`}>
        {showImage ? (
          <div className={LIST_FRAME}>
            <Image
              src={url as string}
              alt={`Referência visual: ${exerciseName}`}
              title="Ilustração: wger.de (CC BY-SA)"
              fill
              sizes="176px"
              className="object-contain object-center p-1.5"
              onError={() => setHasError(true)}
              unoptimized
            />
          </div>
        ) : (
          <div
            className={`${LIST_FRAME} flex items-center justify-center border-dashed p-2`}
          >
            <span className="text-center text-[11px] leading-snug text-neutral-500 dark:text-neutral-500">
              Sem ilustração para este exercício
            </span>
          </div>
        )}
      </figure>
    );
  }
  if (!url || hasError) {
    return null;
  }
  const box: string =
    variant === "compact"
      ? `relative h-28 w-[200px] min-w-[200px] max-w-[200px] rounded-xl border border-[var(--border)] ${ILLUSTRATION_SURFACE}`
      : `relative h-36 w-[220px] min-w-[220px] max-w-[220px] rounded-xl border border-[var(--border)] sm:h-40 sm:w-[200px] sm:min-w-[200px] sm:max-w-[200px] ${ILLUSTRATION_SURFACE}`;
  return (
    <figure className={`shrink-0 ${className}`}>
      <div className={box}>
        <Image
          src={url}
          alt={`Referência visual: ${exerciseName}`}
          title="Ilustração: wger.de (CC BY-SA)"
          fill
          sizes="(max-width: 640px) 220px, 200px"
          className="object-contain object-center p-1"
          onError={() => setHasError(true)}
          unoptimized
        />
      </div>
    </figure>
  );
}
