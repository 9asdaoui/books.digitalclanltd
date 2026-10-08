import { LabelHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  hint?: string;
  required?: boolean;
};

export function Label({ children, hint, required, className, ...props }: LabelProps) {
  return (
    <div className="space-y-1">
      <label className={cn("block text-sm text-surface-300", className)} {...props}>
        {children}
        {required && <span className="ml-0.5 text-error-500">*</span>}
      </label>
      {hint && <p className="text-xs text-surface-500">{hint}</p>}
    </div>
  );
}
