import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PATHS: readonly string[] = ["/login", "/register"];

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/home" || pathname === "/workouts" || pathname === "/create-workout") {
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
  const url: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return supabaseResponse;
  }
  const supabase = createServerClient(url, anonKey, {
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
    const target: string = user ? "/home" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }
  return supabaseResponse;
}
