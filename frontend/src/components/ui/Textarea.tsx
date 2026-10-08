import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
};

const textareaClass =
  "w-full resize-none rounded-xl border border-white/10 bg-surface-900/60 px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-600 outline-none transition focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/25";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ error, className, ...props }, ref) => (
  <div className="space-y-1">
    <textarea
      ref={ref}
      aria-invalid={!!error}
      className={cn(textareaClass, error && "border-red-500/50", className)}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";
