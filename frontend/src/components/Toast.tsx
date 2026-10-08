type ToastType = "success" | "error" | "info";

export type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastProps = {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
};

const styles: Record<ToastType, string> = {
  success: "border-emerald-500/50 bg-emerald-950/80 text-emerald-100",
  error: "border-red-500/50 bg-red-950/80 text-red-100",
  info: "border-indigo-500/50 bg-indigo-950/80 text-indigo-100",
};

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${styles[toast.type]}`}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-white/60 hover:text-white"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
