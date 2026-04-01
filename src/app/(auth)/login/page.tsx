"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
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
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Use seu email e senha para continuar.
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
            autoComplete="current-password"
            required
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
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando…" : "Entrar"}
        </PrimaryButton>
      </form>
      <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
        Não tem conta?{" "}
        <Link href="/register" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
