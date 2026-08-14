import { Motif } from "@/components/Motif";
import { PromotionsGrid } from "@/components/PromotionsGrid";

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

        <PromotionsGrid t={t} className="mt-8 grid gap-4 sm:grid-cols-2" />
      </div>
    </section>
  );
}
