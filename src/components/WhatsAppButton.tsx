import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const BRANCHES = [
  { id: "petropavlovsk", labelKey: "whatsapp.petropavlovsk", number: "77005458008" },
  { id: "kokshetau", labelKey: "whatsapp.kokshetau", number: "77478018008" },
] as const;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.37 4 14.98c0 2.2.6 4.28 1.66 6.08L4 29l8.16-2.14a11.9 11.9 0 0 0 3.86.64h.01c6.62 0 12.02-5.37 12.02-11.98C28.05 8.37 22.65 3 16.02 3Zm0 21.9h-.01a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-4.85 1.27 1.3-4.72-.24-.38a9.86 9.86 0 0 1-1.52-5.29c0-5.46 4.46-9.9 9.94-9.9 2.65 0 5.15 1.03 7.02 2.9a9.83 9.83 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.92 9.91Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.47 1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function WhatsAppButton() {
  const { t } = useLanguage();
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
    <div ref={ref} className="fixed right-5 bottom-5 z-40 sm:right-7 sm:bottom-7">
      {open && (
        <div
          role="menu"
          className="border-gold/30 bg-forest-deep absolute right-0 bottom-full mb-3 w-56 overflow-hidden rounded-lg border shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
        >
          <p className="border-gold/20 text-cream/60 border-b px-4 py-2.5 text-[0.65rem] tracking-[0.2em] uppercase">
            {t("whatsapp.choose")}
          </p>
          {BRANCHES.map((branch) => (
            <a
              key={branch.id}
              href={`https://wa.me/${branch.number}`}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="text-cream/85 hover:bg-gold/10 hover:text-gold flex items-center gap-3 px-4 py-3 text-sm transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              {t(branch.labelKey)}
            </a>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("whatsapp.label")}
        title={t("whatsapp.label")}
        /* Вторичный канал: приглушённая кнопка, чтобы не спорить по весу
           с основным CTA «Купить сертификат» / «Подарить». */
        className="border-gold/40 bg-forest-deep/90 text-gold/85 hover:border-gold hover:text-gold flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors"
      >
        <WhatsAppIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
