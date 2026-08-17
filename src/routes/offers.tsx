import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { useLanguage } from "@/i18n/LanguageContext";
import { MIN_AMOUNT, formatPrice } from "@/data/catalog";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";
import type { CatalogGroup } from "@/data/serviceGroups";
import { serializeServiceIds, toggleServiceId } from "@/data/selection";

/**
 * /offers — упрощённая страница выбора: город (сразу в мастер оформления
 * /certificate с выставленным филиалом) или сумма, ниже — каталог услуг.
 * Прежний "офферный" контент (hero, "о салоне", атмосферные блоки, "два
 * варианта подарка" и т.д.) сюда больше не переносится — эти компоненты не
 * удалены физически, просто не используются в роутинге (см. компоненты
 * BranchesSection/PromotionsSection/LoyaltySection и разметку, которая была
 * в этом файле раньше — в истории git).
 */
export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Услуги и сертификаты — Rai Thai Spa" },
      {
        name: "description",
        content:
          "Электронные подарочные сертификаты Rai Thai Spa: тайский массаж и SPA-программы. Оформление за 2 минуты, сертификат приходит сразу после оплаты.",
      },
      { property: "og:title", content: "Услуги и сертификаты — Rai Thai Spa" },
      {
        property: "og:description",
        content:
          "Подарите настоящее тайское SPA. Сертификат на услугу или на сумму — оформление за 2 минуты.",
      },
    ],
  }),
  component: Offers,
});

function Offers() {
  const { t } = useLanguage();

  const [servicesGroupId, setServicesGroupId] = useState<CatalogGroup>("massage");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  return (
    <main>
      {/* ── Выбор: город (сразу в мастер с выставленным филиалом) или
          сумма — три равноправных пункта, без промежуточных экранов. ──── */}
      <section className="relative overflow-hidden">
        <Divider motif="waveCrown" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-5xl px-5 pt-10 pb-12 sm:px-6 sm:pt-12 sm:pb-16">
          <div className="flex items-center gap-3">
            <Motif name="petalDiamond" className="text-gold h-7 w-7" />
            <p className="eyebrow">{t("home.buyEyebrow")}</p>
          </div>
          <h1 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("cert.step1Title")}
          </h1>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {BRANCHES.map((b) => (
              <Link
                key={b.id}
                to="/certificate"
                search={{ branch: b.id }}
                className="surface p-6 text-left transition-colors hover:border-gold/60"
              >
                <span className="block font-display text-xl sm:text-2xl">
                  {t("home.buyCityPrefix")} {t(b.labelKey)}
                </span>
                <span className="text-cream/65 mt-2 block text-sm">{b.address}</span>
              </Link>
            ))}

            <Link
              to="/certificate"
              search={{ kind: "amount" }}
              className="surface p-6 text-left transition-colors hover:border-gold/60"
            >
              <span className="block font-display text-xl sm:text-2xl">
                {t("home.buyAmountToggle")}
              </span>
              <span className="text-cream/65 mt-2 block text-sm">
                {t("cert.choiceAmountFrom", { amount: formatPrice(MIN_AMOUNT) })}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Каталог услуг — тот же компонент, что и на шаге 1 мастера
          оформления (/certificate) — единый источник правды по ценам и
          описаниям. ────────────────────────────────────────────────────── */}
      <section id="services" className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-8 sm:pt-10" />
        <div className="relative mx-auto max-w-6xl px-5 pt-6 pb-16 sm:px-6 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
            <p className="eyebrow">{t("catalog.title")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("catalog.title")}
          </h2>
          <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">
            {t("catalog.subtitle")}
          </p>

          <a href={spaMenuPdfFor()} download className="btn-ghost mt-5 text-[0.62rem]">
            {t("catalog.menuButton")}
          </a>

          <div className="mt-10">
            <ServiceCatalogBrowser
              groupId={servicesGroupId}
              onGroupChange={setServicesGroupId}
              selectedIds={selectedServiceIds}
              onToggle={(id) => setSelectedServiceIds((ids) => toggleServiceId(ids, id))}
              onClear={() => setSelectedServiceIds([])}
              t={t}
              action={
                <Link
                  to="/certificate"
                  search={{ services: serializeServiceIds(selectedServiceIds) }}
                  className="btn-gold"
                >
                  {t("cert.giftButton")}
                </Link>
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}
