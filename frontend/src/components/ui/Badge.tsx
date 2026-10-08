import { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type BadgeVariant = "brand" | "draft" | "offline" | "subscriber" | "success" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  brand: "bg-brand-500/15 text-brand-400 border-brand-500/25",
  draft: "bg-surface-700/50 text-surface-400 border-white/10",
  offline: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  subscriber: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
};

export function Badge({ variant = "brand", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
