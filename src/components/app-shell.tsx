"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type AppShellProps = {
  children: ReactNode;
};

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/home", label: "Início" },
  { href: "/workouts", label: "Treinos" },
  { href: "/checkin", label: "Hábito" },
  { href: "/desafio-60", label: "60 dias" },
  { href: "/create-workout", label: "Novo" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname: string = usePathname();
  const [hasSession, setHasSession] = useState<boolean>(false);
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    function syncSession() {
      void supabase.auth.getUser().then(({ data: { user } }) => {
        setHasSession(Boolean(user));
      });
    }
    syncSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session?.user));
    });
    return () => subscription.unsubscribe();
  }, []);
  const showBottomNav: boolean = pathname !== "/home" || hasSession;
  return (
    <div className={`flex min-h-dvh flex-col ${showBottomNav ? "pb-24" : "pb-8"}`}>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6">{children}</main>
      {showBottomNav ? (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-label="Principal"
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 py-2">
            {NAV_ITEMS.map((item) => {
              const isActive: boolean = (() => {
                if (item.href === "/home") {
                  return pathname === "/home";
                }
                if (item.href === "/workouts") {
                  return (
                    pathname === "/workouts" ||
                    pathname.startsWith("/workout/") ||
                    pathname.startsWith("/edit-workout/")
                  );
                }
                if (item.href === "/checkin") {
                  return pathname === "/checkin";
                }
                if (item.href === "/desafio-60") {
                  return pathname === "/desafio-60";
                }
              if (item.href === "/create-workout") {
                return (
                  pathname === "/create-workout" ||
                  pathname === "/gerar-treinos" ||
                  pathname.startsWith("/edit-workout/")
                );
              }
                return pathname === item.href;
              })();
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-xl px-1 text-xs font-medium transition sm:text-sm ${
                    isActive
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
