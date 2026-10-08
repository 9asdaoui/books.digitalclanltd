import { useCallback, useState } from "react";
import { ToastMessage } from "../components/Toast";

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  return { toasts, addToast, dismiss };
}
