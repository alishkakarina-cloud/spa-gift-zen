import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { languageLabels, languageNames, type Lang } from "@/i18n/translations";

const LANGS: Lang[] = ["ru", "kz", "en"];

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: Props) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="border-gold/40 bg-forest-deep/70 text-cream flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.65rem] tracking-[0.2em] uppercase backdrop-blur-sm transition-colors hover:border-gold"
      >
        {languageLabels[lang]}
        <svg
          viewBox="0 0 12 8"
          className={`h-2 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="border-gold/30 bg-forest-deep absolute top-full right-0 z-20 mt-2 w-32 overflow-hidden rounded-md border shadow-lg"
        >
          {LANGS.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === lang}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                  l === lang ? "text-gold" : "text-cream/75 hover:text-gold"
                }`}
              >
                <span>{languageNames[l]}</span>
                <span className="text-[0.6rem] opacity-60">{languageLabels[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
