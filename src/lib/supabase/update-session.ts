import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/public-env";

const AUTH_PATHS: readonly string[] = ["/login", "/register"];

function isProtectedPath(pathname: string): boolean {
  if (
    pathname === "/workouts" ||
    pathname === "/create-workout" ||
    pathname === "/gerar-treinos" ||
    pathname === "/checkin"
  ) {
    return true;
  }
  if (pathname.startsWith("/workout/")) {
    return true;
  }
  if (pathname.startsWith("/edit-workout/")) {
    return true;
  }
  return false;
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname);
}

/**
 * Refreshes auth session and applies route guards.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse: NextResponse = NextResponse.next({ request });
  let url: string;
  let apiKey: string;
  try {
    const config = getSupabasePublicConfig();
    url = config.url;
    apiKey = config.apiKey;
  } catch {
    return supabaseResponse;
  }
  const supabase = createServerClient(url, apiKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname: string = request.nextUrl.pathname;
  if (!user && isProtectedPath(pathname)) {
    const redirectUrl: URL = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }
  if (user && isAuthPath(pathname)) {
    const redirectUrl: URL = new URL("/home", request.url);
    return NextResponse.redirect(redirectUrl);
  }
  if (pathname === "/") {
    const oauthCode: string | null = request.nextUrl.searchParams.get("code");
    if (oauthCode) {
      const callbackUrl = new URL("/auth/callback", request.url);
      request.nextUrl.searchParams.forEach((value, key) => {
        callbackUrl.searchParams.set(key, value);
      });
      return NextResponse.redirect(callbackUrl);
    }
    return NextResponse.redirect(new URL("/home", request.url));
  }
  return supabaseResponse;
}
