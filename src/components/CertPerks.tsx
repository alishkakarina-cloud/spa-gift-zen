import { Check } from "lucide-react";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";
import { Reveal } from "@/components/Reveal";

/**
 * «Подарочные сертификаты» — 4 пункта с иконкой. Вынесено из /services в
 * общий компонент, чтобы тот же блок без дублирования разметки/текста можно
 * было показать и внутри ServicesOverlay (оверлей «Наши услуги» с главной).
 */
export function CertPerks({ t }: { t: (path: string) => string }) {
  const perks = [
    t("home.heroBadgeTitle"),
    t("home.certPerk2Title"),
    t("home.how3Desc"),
    t("home.certPerk4Title"),
  ];

  return (
    <section className="relative overflow-hidden">
      <Divider motif="flowerBurst" className="pt-4 sm:pt-6" />
      <Reveal className="relative mx-auto max-w-4xl px-5 pt-8 pb-12 sm:px-6 sm:pb-16">
        <div className="flex items-center gap-3">
          <Motif name="lotusBloom" className="text-gold h-7 w-7" />
          <p className="eyebrow">{t("home.certPerksEyebrow")}</p>
        </div>
        <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("home.certPerksTitle")}</h2>

        {/* Абзац под заголовком убран (правка владельца 2026-08-26) —
            дублировал то, что и так видно в списке ниже. Перевод
            certPerksText не удалён из translations.ts — не используется
            больше нигде, но удалять неиспользуемый ключ не просили. */}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3">
              <span className="border-gold/45 text-gold flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm">{perk}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
