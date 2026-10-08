import { useCallback, useState } from "react";

export type ReaderTheme = "dark" | "sepia" | "light";
export type ReaderFontSize = "sm" | "md" | "lg" | "xl";

const STORAGE_KEY = "dcb-reader-settings";

type ReaderSettings = {
  theme: ReaderTheme;
  fontSize: ReaderFontSize;
  focusMode: boolean;
};

const defaults: ReaderSettings = {
  theme: "sepia",
  fontSize: "lg",
  focusMode: false,
};

function loadSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveSettings(settings: ReaderSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);

  const setTheme = useCallback((theme: ReaderTheme) => {
    setSettings((prev) => {
      const next = { ...prev, theme };
      saveSettings(next);
      return next;
    });
  }, []);

  const setFontSize = useCallback((fontSize: ReaderFontSize) => {
    setSettings((prev) => {
      const next = { ...prev, fontSize };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleFocusMode = useCallback(() => {
    setSettings((prev) => {
      const next = { ...prev, focusMode: !prev.focusMode };
      saveSettings(next);
      return next;
    });
  }, []);

  return { ...settings, setTheme, setFontSize, toggleFocusMode };
}

export function getReadingProgress(bookId: string): number {
  try {
    const raw = localStorage.getItem(`dcb-read-${bookId}`);
    return raw ? Number(raw) : 1;
  } catch {
    return 1;
  }
}

export function saveReadingProgress(bookId: string, page: number) {
  localStorage.setItem(`dcb-read-${bookId}`, String(page));
}
