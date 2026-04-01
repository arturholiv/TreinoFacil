import type { ReactNode } from "react";

type AppCardProps = {
  children: ReactNode;
  className?: string;
};

export function AppCard({ children, className = "" }: AppCardProps) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}
