import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCart } from "@/context/CartContext";
import { selectionTotal, serializeServiceIds } from "@/data/selection";
import { formatPrice } from "@/data/catalog";

/**
 * Показывает реальный выбор из каталога (CartContext, общий с OffersSection
 * на "/" и /offers) — по правке клиента: "чтобы понятно было сколько услуг
 * мы набрали". Раньше был статичный демо-пример без данных — теперь читает
 * то же состояние, что и каталог, и просто не рендерится, пока ничего не
 * отмечено (естественное пустое состояние вместо всегда видимой заглушки).
 *
 * Крупный золотой бейдж со счётчиком — количество должно быть видно с
 * первого взгляда, не только через чтение текста. Вся полоса — ссылка
 * в /certificate с уже подставленными услугами (та же ?services=, что и у
 * кнопки в самом каталоге) — мастер оформления не тронут, только вход в
 * него отсюда тоже работает.
 */
export function FloatingCart() {
  const { t } = useLanguage();
  const { selectedServiceIds } = useCart();
  const [dismissed, setDismissed] = useState(false);

  // Если после закрытия человек отметил ещё услугу — корзина должна снова
  // появиться, а не остаться скрытой до перезагрузки страницы.
  useEffect(() => {
    setDismissed(false);
  }, [selectedServiceIds.length]);

  if (dismissed || selectedServiceIds.length === 0) return null;

  const total = selectionTotal(selectedServiceIds);

  return (
    <div
      className="border-gold/40 bg-forest-deep fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-1 rounded-full border py-1.5 pr-1.5 pl-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-300 sm:bottom-7 sm:left-7"
      role="region"
      aria-label={t("cart.title")}
    >
      <Link
        to="/certificate"
        search={{ services: serializeServiceIds(selectedServiceIds) }}
        className="hover:bg-gold/10 flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 transition-colors sm:gap-3 sm:pr-4"
      >
        <span className="bg-gold text-primary-foreground font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm sm:h-9 sm:w-9 sm:text-base">
          {selectedServiceIds.length}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-cream/60 text-[0.6rem] tracking-[0.15em] uppercase">
            {t("cart.title")}
          </span>
          <span className="text-gold text-sm sm:text-base">{formatPrice(total)}</span>
        </span>
        <ArrowRight className="text-gold h-4 w-4 shrink-0" aria-hidden="true" />
      </Link>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("cart.close")}
        title={t("cart.close")}
        className="text-cream/45 hover:text-gold flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
