import { useEffect, useRef } from "react";
import { Motif, type MotifName } from "@/components/Motif";
import { serviceImage } from "@/data/catalog";

export type CategoryCard = {
  id: string;
  labelKey: string;
  motif: MotifName;
  /** Услуга-донор: её фото представляет категорию. null — фото ещё нет. */
  imageFrom: string | null;
  count: number;
};

/**
 * Бесконечная лента категорий.
 *
 * Зацикливание без библиотек: список рендерится трижды, лента стартует со
 * средней копии, а после каждой прокрутки позиция незаметно возвращается в
 * середину. Пользователь может листать в любую сторону сколько угодно и
 * никогда не упирается в край.
 */
export function CategoryCarousel({
  categories,
  activeId,
  onSelect,
  t,
  prevLabel,
  nextLabel,
}: {
  categories: CategoryCard[];
  activeId: string;
  onSelect: (id: string) => void;
  t: (path: string) => string;
  prevLabel: string;
  nextLabel: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const loop = [...categories, ...categories, ...categories];

  // Стартуем со средней копии, чтобы ленту можно было тянуть в обе стороны,
  // и на каждый скролл незаметно возвращаем позицию в середину.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    const block = () => el.scrollWidth / 3;
    el.scrollLeft = block();

    // Коррекция синхронная: сдвиг на целый блок незаметен глазу, а через
    // requestAnimationFrame она бы не сработала в неактивной вкладке.
    const onScroll = () => {
      const b = block();
      if (el.scrollLeft < b * 0.5) el.scrollLeft += b;
      else if (el.scrollLeft > b * 1.5) el.scrollLeft -= b;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const step = (direction: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * 236, behavior: "smooth" });
  };

  return (
    <div className="relative min-w-0">
      <div
        ref={rail}
        className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0"
      >
        {loop.map((c, i) => {
          const image = c.imageFrom ? serviceImage(c.imageFrom) : undefined;
          const active = c.id === activeId;
          return (
            <button
              key={`${c.id}-${i}`}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-pressed={active}
              className={`surface w-[13rem] shrink-0 overflow-hidden rounded-lg text-left transition-colors ${active ? "border-gold" : "hover:border-gold/60"}`}
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  width={720}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <span className="bg-gold/5 flex aspect-[4/3] w-full items-center justify-center">
                  <Motif name={c.motif} className="text-gold h-10 w-10 opacity-70" />
                </span>
              )}
              <span className="flex items-baseline justify-between gap-2 px-4 py-3">
                <span
                  className={`font-display text-base leading-tight ${active ? "text-gold" : ""}`}
                >
                  {t(c.labelKey)}
                </span>
                <span className="text-cream/45 text-xs">{c.count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label={prevLabel}
        className="border-border bg-background/90 text-cream/70 hover:border-gold hover:text-gold absolute top-1/2 -left-4 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border transition-colors sm:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label={nextLabel}
        className="border-border bg-background/90 text-cream/70 hover:border-gold hover:text-gold absolute top-1/2 -right-4 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border transition-colors sm:flex"
      >
        ›
      </button>
    </div>
  );
}
