import { ReactNode } from "react";
import { cn } from "../../lib/cn";

type AppShellProps = {
  variant?: "admin" | "reader";
  children: ReactNode;
  className?: string;
};

export function AppShell({ variant = "reader", children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen text-surface-100",
        variant === "admin" ? "bg-app-gradient" : "bg-reader",
        className,
      )}
    >
      {children}
    </div>
  );
}
