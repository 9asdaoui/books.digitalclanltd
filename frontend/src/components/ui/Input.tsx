import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-surface-900/60 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-600 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, InputProps>(({ error, className, ...props }, ref) => (
  <div className="space-y-1">
    <input
      ref={ref}
      aria-invalid={!!error}
      className={cn(inputClass, error && "border-red-500/50 focus:ring-red-500/25", className)}
      {...props}
    />
    {error && (
      <p className="text-xs text-red-400" role="alert">
        {error}
      </p>
    )}
  </div>
));
Input.displayName = "Input";
