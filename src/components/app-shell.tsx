"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/home", label: "Início" },
  { href: "/workouts", label: "Treinos" },
  { href: "/create-workout", label: "Novo" },
];

export function AppShell({ children }: AppShellProps) {
  const pathname: string = usePathname();
  return (
    <div className="flex min-h-dvh flex-col pb-24">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-6">{children}</main>
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
              if (item.href === "/create-workout") {
                return (
                  pathname === "/create-workout" ||
                  pathname.startsWith("/edit-workout/")
                );
              }
              return pathname === item.href;
            })();
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-12 min-w-[4.5rem] flex-1 items-center justify-center rounded-xl text-sm font-medium transition ${
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
    </div>
  );
}
