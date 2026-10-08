import { ReactNode, useEffect } from "react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: "default" | "paywall";
  footer?: ReactNode;
};

export function Modal({ open, onClose, title, children, variant = "default", footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={cn(
          "glass-panel w-full max-w-md p-6",
          variant === "paywall" && "border-amber-500/50",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="modal-title"
          className={cn(
            "text-display text-xl font-bold",
            variant === "paywall" ? "text-amber-400" : "text-surface-100",
          )}
        >
          {title}
        </h3>
        <div className="mt-3 text-sm text-surface-300">{children}</div>
        {footer ?? (
          <div className="mt-6">
            <Button variant={variant === "paywall" ? "paywall" : "secondary"} fullWidth onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
