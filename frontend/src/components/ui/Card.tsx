import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "glass" | "solid";
  padding?: "sm" | "md" | "lg";
};

const paddingMap = { sm: "p-4", md: "p-6", lg: "p-8" };

export function Card({ variant = "glass", padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant === "glass" ? "glass-panel" : "rounded-2xl border border-white/10 bg-surface-800",
        paddingMap[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-display mb-6 text-lg font-semibold text-surface-100", className)} {...props}>
      {children}
    </h2>
  );
}
