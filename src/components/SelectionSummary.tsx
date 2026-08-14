import type { ReactNode } from "react";
import { formatPrice } from "@/data/catalog";
import { selectedServices, selectionTotal } from "@/data/selection";

/**
 * Сводка выбранного: список отмеченных услуг с ценами и итоговая сумма.
 *
 * Липнет к низу экрана, пока пользователь листает список услуг, — иначе
 * после третьей галочки пришлось бы прокручивать страницу вниз, чтобы
 * понять, что вообще набрано. Пустой выбор блок не рисует вовсе.
 */
export function SelectionSummary({
  ids,
  onRemove,
  onClear,
  t,
  action,
}: {
  ids: ReadonlyArray<string>;
  onRemove: (id: string) => void;
  onClear: () => void;
  t: (path: string) => string;
  /** Кнопка или ссылка перехода к оформлению — своя в витрине и в мастере. */
  action: ReactNode;
}) {
  const chosen = selectedServices(ids);
  if (chosen.length === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 mt-6">
      <div className="border-gold/40 bg-background/95 rounded-lg border p-4 shadow-2xl backdrop-blur sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="eyebrow">
            {t("cert.selectionTitle")} · {chosen.length}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="text-cream/50 hover:text-gold text-[0.62rem] tracking-[0.2em] uppercase transition-colors"
          >
            {t("cert.selectionClear")}
          </button>
        </div>

        {/* При длинном наборе список прокручивается внутри себя, чтобы
            плашка не съедала весь экран на телефоне. */}
        <ul className="divide-border mt-3 max-h-40 divide-y overflow-y-auto text-sm">
          {chosen.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between gap-3 py-2">
              <span className="min-w-0 flex-1 truncate">{t(`services.${s.id}.name`)}</span>
              <span className="text-gold shrink-0">{formatPrice(s.price)}</span>
              <button
                type="button"
                onClick={() => onRemove(s.id)}
                aria-label={`${t("cert.selectionRemove")}: ${t(`services.${s.id}.name`)}`}
                className="text-cream/40 hover:text-gold shrink-0 px-1 text-base leading-none transition-colors"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="border-border mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <div className="flex items-baseline gap-3">
            <span className="text-cream/60 text-sm">{t("cert.selectionTotal")}</span>
            <span className="font-display text-gold text-xl">
              {formatPrice(selectionTotal(ids))}
            </span>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
