import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({
  children,
  className = "",
  type = "button",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-12 w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-base font-semibold text-[var(--accent-foreground)] shadow-sm transition active:scale-[0.98] disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
