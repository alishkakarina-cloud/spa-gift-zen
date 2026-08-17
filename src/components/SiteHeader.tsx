import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BRANCHES } from "@/data/branches";
import logoLight from "@/assets/logo-on-dark.webp";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.37 4 14.98c0 2.2.6 4.28 1.66 6.08L4 29l8.16-2.14a11.9 11.9 0 0 0 3.86.64h.01c6.62 0 12.02-5.37 12.02-11.98C28.05 8.37 22.65 3 16.02 3Zm0 21.9h-.01a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-4.85 1.27 1.3-4.72-.24-.38a9.86 9.86 0 0 1-1.52-5.29c0-5.46 4.46-9.9 9.94-9.9 2.65 0 5.15 1.03 7.02 2.9a9.83 9.83 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.92 9.91Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.47 1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

/**
 * Показ/скрытие шапки по направлению скролла — по поведению layan.kz:
 * скролл вниз прячет её (translateY(-100%)), скролл вверх возвращает,
 * у самого верха страницы шапка всегда видна. sticky (не fixed) — уже
 * занимает место в потоке и не требует компенсирующих отступов у
 * контента на других страницах.
 */
function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) {
        setHidden(false);
      } else if (y > lastY.current) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

/**
 * Общая шапка для всех страниц (структура по образцу layan.kz: контакт слева,
 * логотип, основной CTA справа) — раньше у каждой страницы была своя шапка
 * (на главной — только переключатель языка поверх hero, на /catalog и
 * /certificate — логотип + переключатель без CTA и контакта).
 */
export function SiteHeader() {
  const { t } = useLanguage();
  const primaryBranch = BRANCHES[0]!;
  const hidden = useHideOnScrollDown();

  return (
    <header
      className={`border-border/60 sticky top-0 z-30 border-b bg-forest-deep/95 backdrop-blur-sm transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <a
          href={primaryBranch.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          title={t("whatsapp.label")}
          aria-label={t("whatsapp.label")}
          className="text-cream/75 hover:text-gold flex items-center gap-2 text-sm transition-colors"
        >
          <WhatsAppGlyph className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">{t("whatsapp.label")}</span>
        </a>

        <Link to="/" aria-label={t("cert.backHomeLink")} className="shrink-0">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
