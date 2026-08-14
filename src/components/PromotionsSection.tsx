import { Motif } from "@/components/Motif";
import { PROMOTIONS } from "@/data/promotions";

/**
 * Акции и спецпредложения салонов. Блок информационный — на покупку
 * сертификата не уводит, поэтому без кнопок: только условия.
 */
export function PromotionsSection({ t }: { t: (path: string) => string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
        <div className="flex items-center gap-3">
          <Motif name="waveCrown" className="text-gold h-7 w-9" />
          <p className="eyebrow">{t("promo.eyebrow")}</p>
        </div>
        <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
          {t("promo.title")}
        </h2>
        <p className="text-cream/70 mt-3 max-w-xl text-sm leading-relaxed">{t("promo.intro")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
      </div>
    </section>
  );
}
