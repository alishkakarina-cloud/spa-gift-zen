import { useRef } from "react";
import { formatPrice, serviceImage, type Service } from "@/data/catalog";

/**
 * Горизонтальная лента услуг одной категории.
 *
 * Прокрутка нативная (`overflow-x-auto`), поэтому на телефоне работает
 * привычный свайп с инерцией системы, а не имитация на JS. Стрелки —
 * только для мыши: на мобильных они скрыты, там достаточно свайпа.
 */
export function ServiceRail({
  services,
  selectedId,
  onSelect,
  t,
  prevLabel,
  nextLabel,
}: {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: (path: string) => string;
  prevLabel: string;
  nextLabel: string;
}) {
  const rail = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    // Шаг прокрутки — примерно одна карточка с отступом.
    el.scrollBy({ left: direction * 276, behavior: "smooth" });
  };

  // min-w-0 обязателен: лента лежит в grid-колонке, а у grid-элемента
  // min-width:auto — без сброса он растягивается под содержимое ленты,
  // и горизонтальная прокрутка не включается.
  return (
    <div className="relative min-w-0">
      <div
        ref={rail}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0"
      >
        {services.map((s) => {
          const image = serviceImage(s.id);
          const active = selectedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
              className={`surface flex w-[260px] shrink-0 snap-start flex-col overflow-hidden text-left transition-colors ${active ? "border-gold" : "hover:border-gold/60"}`}
            >
              {image ? (
                <img
                  src={image}
                  alt={t(`services.${s.id}.name`)}
                  width={720}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="bg-gold/5 aspect-square w-full" />
              )}
              <span className="flex flex-1 flex-col gap-2 p-5">
                <span className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="font-display text-lg leading-tight">
                    {t(`services.${s.id}.name`)}
                  </span>
                  <span className="text-sm text-gold">{formatPrice(s.price)}</span>
                </span>
                {t(`services.${s.id}.duration`) && (
                  <span className="text-[0.65rem] tracking-[0.2em] text-cream/50 uppercase">
                    {t(`services.${s.id}.duration`)}
                  </span>
                )}
                <span className="text-sm leading-relaxed text-cream/70">
                  {t(`services.${s.id}.description`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label={prevLabel}
        className="border-border bg-background/90 text-cream/70 hover:border-gold hover:text-gold absolute top-[7.5rem] -left-4 hidden h-9 w-9 items-center justify-center rounded-full border transition-colors sm:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label={nextLabel}
        className="border-border bg-background/90 text-cream/70 hover:border-gold hover:text-gold absolute top-[7.5rem] -right-4 hidden h-9 w-9 items-center justify-center rounded-full border transition-colors sm:flex"
      >
        ›
      </button>
    </div>
  );
}
