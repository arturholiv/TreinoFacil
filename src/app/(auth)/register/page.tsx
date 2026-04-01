"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    if (!data.session) {
      setInfoMessage(
        "Se o projeto exigir confirmação por email, abra o link enviado antes de entrar.",
      );
      return;
    }
    router.replace("/home");
    router.refresh();
  }
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-10 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
          Treino Fácil
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Criar conta</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Cadastre-se para salvar seus treinos na nuvem.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-base outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Senha
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 text-base outline-none ring-[var(--accent)] focus:ring-2"
          />
        </label>
        {errorMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errorMessage}
          </p>
        ) : null}
        {infoMessage ? (
          <p className="text-sm text-[var(--muted-foreground)]" role="status">
            {infoMessage}
          </p>
        ) : null}
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Criando…" : "Cadastrar"}
        </PrimaryButton>
      </form>
      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
