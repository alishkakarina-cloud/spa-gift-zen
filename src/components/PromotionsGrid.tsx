import { PROMOTIONS } from "@/data/promotions";

/**
 * Сетка карточек акций — дословный контент из официального меню RaiThai.
 * Вынесена отдельно, потому что рендерится в двух местах: в блоке «Акции» на
 * главной (PromotionsSection) и внутри каталога, когда выбрана категория
 * «Акции и специальные предложения» (ServiceCatalogBrowser).
 */
export function PromotionsGrid({
  t,
  className = "mt-4 grid gap-4 sm:grid-cols-2",
}: {
  t: (path: string) => string;
  className?: string;
}) {
  return (
    <div className={className}>
      {PROMOTIONS.map((p) => (
        <article key={p.id} className="surface flex flex-col rounded-lg p-6">
          <h3 className="font-display text-gold text-lg tracking-wide uppercase sm:text-xl">
            {p.title}
          </h3>
          <p className="text-cream/80 mt-3 text-sm leading-relaxed">{p.summary}</p>

          <p className="text-cream/45 mt-5 text-[0.62rem] tracking-[0.2em] uppercase">
            {t("promo.terms")}
          </p>
          <ul className="text-cream/70 mt-2 space-y-1 text-sm">
            {p.terms.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-gold/70" aria-hidden="true">
                  ·
                </span>
                {line}
              </li>
            ))}
          </ul>

          {p.exclusions && (
            <>
              <p className="text-cream/45 mt-4 text-[0.62rem] tracking-[0.2em] uppercase">
                {t("promo.exclusions")}
              </p>
              <ul className="text-cream/55 mt-2 space-y-1 text-sm">
                {p.exclusions.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span aria-hidden="true">–</span>
                    {line}
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
