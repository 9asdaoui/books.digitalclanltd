import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "paywall" | "success";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40 hover:from-brand-500 hover:to-violet-500",
  secondary: "border border-white/10 bg-white/5 text-surface-200 hover:bg-white/10",
  ghost: "text-brand-400 hover:bg-white/5 hover:text-brand-400",
  danger: "border border-red-500/30 bg-red-600/20 text-red-300 hover:bg-red-600/30",
  paywall: "bg-amber-600 text-white hover:bg-amber-500",
  success: "bg-emerald-700 text-white hover:bg-emerald-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-sm font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
