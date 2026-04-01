/**
 * Resolves Supabase URL and browser-safe API key from env.
 * Supports legacy anon JWT and newer publishable keys (dashboard "Connect").
 * Uses the first non-empty candidate so an empty ANON_KEY does not block PUBLISHABLE_*.
 */
function firstNonEmpty(...candidates: (string | undefined)[]): string | undefined {
  for (const candidate of candidates) {
    const trimmed: string = typeof candidate === "string" ? candidate.trim() : "";
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
}

export function getSupabasePublicConfig(): { url: string; apiKey: string } {
  const urlRaw: string | undefined = firstNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const url: string | undefined = urlRaw ? urlRaw.replace(/\/+$/, "") : undefined;
  const apiKey: string | undefined = firstNonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  if (!url || !apiKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a public key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (see .env.local.example). Restart npm run dev after editing .env.",
    );
  }
  return { url, apiKey };
}
