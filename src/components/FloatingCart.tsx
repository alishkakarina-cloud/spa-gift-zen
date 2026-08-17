import { useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { formatPrice } from "@/data/catalog";

/**
 * ТОЛЬКО вёрстка — без бизнес-логики. Источник данных для корзины (выбор
 * внутри шага 1 /certificate или отдельное состояние на объединённой
 * главной) ещё не согласован с клиентом, поэтому здесь захардкожен один
 * демо-пример на реальных данных (Oil-массаж, реальная цена из
 * data/catalog.ts), а не выдуманная услуга — просто чтобы показать, как
 * корзина выглядит и анимируется. Когда источник данных подтвердят,
 * заменить demoItem на реальное состояние и, вероятно, скрывать компонент
 * целиком, пока ничего не выбрано.
 *
 * Компактная однострочная пилюля, а не крупная карточка — первая версия
 * (высокая, во всю карточку) на мобильном перекрывала кнопку «Далее» шага
 * выбора дизайна /certificate; узкая пилюля снизу-слева такого риска
 * почти не несёт. bottom-left, не bottom-right — там уже WhatsAppButton.
 */
const demoItem = { name: "Oil-массаж «Абсолютный покой»", price: 18000 };

export function FloatingCart() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="border-gold/30 bg-forest-deep fixed bottom-5 left-5 z-40 flex max-w-[calc(100vw-2.5rem)] items-center gap-2 rounded-full border py-2 pr-2 pl-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-300 sm:bottom-7 sm:left-7 sm:gap-3 sm:py-2.5 sm:pl-4"
      role="region"
      aria-label={t("cart.title")}
    >
      <span className="text-cream/85 max-w-[7rem] truncate text-xs sm:max-w-[10rem] sm:text-sm">
        {demoItem.name}
      </span>
      <span className="text-gold shrink-0 text-xs sm:text-sm">{formatPrice(demoItem.price)}</span>

      <button
        type="button"
        aria-label={t("cart.checkout")}
        title={t("cart.checkout")}
        className="border-gold/45 text-gold hover:bg-gold/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("cart.close")}
        title={t("cart.close")}
        className="text-cream/45 hover:text-gold flex h-6 w-6 shrink-0 items-center justify-center transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
