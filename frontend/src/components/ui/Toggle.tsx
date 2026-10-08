import { cn } from "../../lib/cn";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id?: string;
};

export function Toggle({ checked, onChange, label, description, id = "toggle" }: ToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-900/40 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-surface-200">{label}</p>
        {description && <p className="text-xs text-surface-500">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition duration-200",
          checked ? "bg-brand-500" : "bg-surface-600",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200",
            checked && "translate-x-5",
          )}
        />
      </button>
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
    </div>
  );
}
