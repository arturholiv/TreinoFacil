import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/public-env";

/**
 * Troca o `code` do fluxo PKCE (link de confirmação de email, OAuth, etc.) por sessão em cookie.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code: string | null = requestUrl.searchParams.get("code");
  const origin: string = requestUrl.origin;
  let nextPath: string = requestUrl.searchParams.get("next") ?? "/home";
  if (!nextPath.startsWith("/")) {
    nextPath = "/home";
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }
  let url: string;
  let apiKey: string;
  try {
    const config = getSupabasePublicConfig();
    url = config.url;
    apiKey = config.apiKey;
  } catch {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }
  const cookieStore = await cookies();
  const supabase = createServerClient(url, apiKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* route handler: set pode falhar em edge cases */
        }
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }
  return NextResponse.redirect(`${origin}${nextPath}`);
}
