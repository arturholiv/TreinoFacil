"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PrimaryButton } from "@/components/primary-button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err: string | null = params.get("error");
    if (!err) {
      return;
    }
    if (err === "missing_code") {
      setErrorMessage(
        "Link de confirmação inválido ou incompleto. Tente entrar de novo ou peça um novo email.",
      );
    } else if (err === "config") {
      setErrorMessage(
        "Servidor sem variáveis do Supabase. Confira o .env e reinicie npm run dev.",
      );
    } else {
      setErrorMessage(decodeURIComponent(err));
    }
    window.history.replaceState({}, "", "/login");
  }, []);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      const search: string =
        typeof window !== "undefined" ? window.location.search : "";
      const nextParam: string | null = new URLSearchParams(search).get("next");
      const nextPath: string =
        nextParam !== null &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//") &&
        !nextParam.includes(":")
          ? nextParam
          : "/home";
      router.replace(nextPath);
      router.refresh();
    } catch (unknownError: unknown) {
      const message: string =
        unknownError instanceof Error ? unknownError.message : String(unknownError);
      if (
        message.includes("Missing NEXT_PUBLIC_SUPABASE") ||
        message.includes("public key")
      ) {
        setErrorMessage(
          "Configure NEXT_PUBLIC_SUPABASE_URL e a chave (anon ou publishable) no .env, salve e reinicie o servidor com npm run dev.",
        );
      } else if (
        message === "Failed to fetch" ||
        message.includes("Failed to fetch") ||
        message.includes("NetworkError")
      ) {
        setErrorMessage(
          "Não foi possível conectar ao Supabase. Confira a URL do projeto, teste outra rede ou desative bloqueadores. Se usar chave publishable (sb_publishable_…) e ainda falhar, copie também a chave anon (JWT) em Project Settings → API e defina NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
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
