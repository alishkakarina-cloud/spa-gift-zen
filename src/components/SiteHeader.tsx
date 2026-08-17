import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logoLight from "@/assets/logo-on-dark.webp";

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
 * Общая шапка для всех страниц (лого по центру, переключатель языка справа)
 * — раньше слева стоял WhatsApp-контакт, его убрали как дубль плавающей
 * WhatsApp-кнопки в углу. Три колонки грида вместо flex justify-between:
 * пустая левая колонка той же ширины, что и правая с LanguageSwitcher, —
 * иначе после удаления левого блока лого съехало бы влево.
 */
export function SiteHeader() {
  const { t } = useLanguage();
  const hidden = useHideOnScrollDown();

  return (
    <header
      className={`border-border/60 sticky top-0 z-30 border-b bg-forest-deep/95 backdrop-blur-sm transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3 sm:px-6">
        <div aria-hidden="true" />

        <Link to="/" aria-label={t("cert.backHomeLink")} className="shrink-0 justify-self-center">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <div className="flex items-center justify-self-end gap-3 sm:gap-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
