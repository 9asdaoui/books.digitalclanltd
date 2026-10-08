import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
};

const selectClass =
  "w-full rounded-xl border border-white/10 bg-surface-900/60 px-4 py-2.5 text-sm text-surface-100 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/25";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ error, className, children, ...props }, ref) => (
  <div className="space-y-1">
    <select ref={ref} className={cn(selectClass, error && "border-red-500/50", className)} {...props}>
      {children}
    </select>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Select.displayName = "Select";
