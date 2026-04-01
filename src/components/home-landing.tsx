"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/primary-button";

/**
 * Public marketing block for visitors who open /home without a session.
 */
export function HomeLanding() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
          Treino Fácil
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">
          Seu treino do dia, no bolso
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--muted-foreground)]">
          Organize treinos por dia da semana, veja automaticamente o que cai hoje, marque
          exercícios feitos e anote peso e observações — tudo pensado para usar no celular.
        </p>
      </div>
      <ul className="flex flex-col gap-3 text-sm text-[var(--foreground)]">
        <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <span className="font-semibold text-[var(--accent)]">1.</span>
          <span>Cadastre-se e monte treinos (peito, costas, pernas…) com séries e repetições.</span>
        </li>
        <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <span className="font-semibold text-[var(--accent)]">2.</span>
          <span>Vincule cada treino a um dia da semana; na home aparece o treino de hoje.</span>
        </li>
        <li className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <span className="font-semibold text-[var(--accent)]">3.</span>
          <span>Na execução, marque o que concluiu, ajuste peso e notas quando quiser.</span>
        </li>
      </ul>
      <div className="flex flex-col gap-3 pt-2">
        <PrimaryButton type="button" onClick={() => router.push("/login")}>
          Entrar
        </PrimaryButton>
        <Link
          href="/register"
          className="block w-full text-center text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
        >
          Criar conta gratuita
        </Link>
      </div>
    </div>
  );
}
