import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

const STORAGE_KEY = "raithai-lang";

type Vars = Record<string, string | number>;

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a dot-path key, e.g. t("home.heroTitle1"), with optional {var} interpolation. */
  t: (path: string, vars?: Vars) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(value: string, vars?: Vars): string {
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key) => {
    const v = vars[key];
    return v === undefined ? match : String(v);
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start from "ru" so the first client render matches the server-rendered
  // HTML exactly — the persisted choice is applied after mount to avoid a
  // hydration mismatch (the server has no access to localStorage).
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "kz" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "kz" ? "kk" : lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const t = useMemo(() => {
    return (path: string, vars?: Vars) => {
      const value = readPath(translations[lang], path) ?? readPath(translations.ru, path);
      if (typeof value !== "string") return path;
      return interpolate(value, vars);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
