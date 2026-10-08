import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/cn";

const MIN_SPLASH_MS = 700;

type BootGateProps = {
  children: ReactNode;
};

export function BootGate({ children }: BootGateProps) {
  const { loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function boot() {
      try {
        await document.fonts.ready;
      } catch {
        /* fonts API unavailable */
      }

      while (!cancelled) {
        const elapsed = Date.now() - started;
        const authDone = !loading;
        const minDone = elapsed >= MIN_SPLASH_MS;
        if (authDone && minDone) break;
        await new Promise((r) => setTimeout(r, 50));
      }

      if (cancelled) return;

      const splash = document.getElementById("splash");
      if (splash) {
        splash.classList.add("splash-exit");
        window.setTimeout(() => {
          splash.remove();
        }, 600);
      }

      setReady(true);
      window.setTimeout(() => setSplashVisible(false), 600);
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [loading]);

  return (
    <>
      {!ready && splashVisible && null}
      <div className={cn("boot-gate-content", ready && "boot-ready")}>{children}</div>
    </>
  );
}
