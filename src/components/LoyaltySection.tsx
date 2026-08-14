import { Motif } from "@/components/Motif";

/**
 * Система лояльности — уровни и кэшбэк с официального меню RaiThai.
 * Информационный блок: покупку не запускает, поэтому без кнопок.
 */
const TIERS = [
  { id: "silver", nameKey: "loyalty.silverName", condKey: "loyalty.silverCond", cashback: "3%" },
  { id: "gold", nameKey: "loyalty.goldName", condKey: "loyalty.goldCond", cashback: "4%" },
  { id: "royal", nameKey: "loyalty.royalName", condKey: "loyalty.royalCond", cashback: "5%" },
] as const;

export function LoyaltySection({ t }: { t: (path: string) => string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-5 pb-16 sm:px-6 sm:pb-20">
        <div className="surface rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Motif name="diamondLattice" className="text-gold h-7 w-7" />
            <p className="eyebrow">{t("loyalty.eyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-xl sm:text-2xl">{t("loyalty.title")}</h2>
          <p className="text-cream/70 mt-2 text-sm">{t("loyalty.intro")}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <div key={tier.id} className="border-border rounded-md border p-5">
                <p className="font-display text-gold text-lg tracking-[0.16em] uppercase">
                  {t(tier.nameKey)}
                </p>
                <p className="text-cream/70 mt-2 text-sm leading-relaxed">{t(tier.condKey)}</p>
                <p className="text-cream/85 mt-3 text-sm">
                  {t("loyalty.cashback")}: <span className="text-gold">{tier.cashback}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
