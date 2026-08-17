import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import interiorImg from "@/assets/interior-candles.jpg";
import redNookImg from "@/assets/atmosphere-red.jpg";
import teaImg from "@/assets/detail-tea.jpg";
import mastersImg from "@/assets/masters-team.webp";
import logoLight from "@/assets/logo-on-dark.webp";
import { Motif } from "@/components/Motif";
import { Divider } from "@/components/Divider";
import { BranchesSection, InstagramLinks } from "@/components/BranchesSection";
import { PromotionsSection } from "@/components/PromotionsSection";
import { LoyaltySection } from "@/components/LoyaltySection";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { useLanguage } from "@/i18n/LanguageContext";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";
import type { CatalogGroup } from "@/data/serviceGroups";
import { serializeServiceIds, toggleServiceId } from "@/data/selection";

/**
 * /offers — бывшая главная (весь коммерческий и информационный контент),
 * hero переехал на новую минималистичную "/" по референсу layan.kz. Сюда же
 * попадает выбор города — приходит через ?branch= с кнопок-городов hero
 * либо переключается прямо здесь, у PDF-меню.
 */
const branchSearchSchema = (search: Record<string, unknown>): { branch?: Branch } => {
  const branch = search["branch"];
  return branch === "petropavlovsk" || branch === "kokshetau" ? { branch } : {};
};

export const Route = createFileRoute("/offers")({
  validateSearch: branchSearchSchema,
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
  const { branch: initialBranch } = Route.useSearch();

  // Витрина услуг — якорная секция #services, по структуре layan.kz, где
  // прайс живёт прямо на главной. Филиал приходит из hero (кнопки городов)
  // либо переключается прямо здесь.
  const [servicesGroupId, setServicesGroupId] = useState<CatalogGroup>("massage");
  const [menuBranch, setMenuBranch] = useState<Branch | null>(initialBranch ?? null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const menuBranchSearch = menuBranch ? { branch: menuBranch } : {};

  const why = [
    { title: t("home.why1Title"), desc: t("home.why1Desc") },
    { title: t("home.why2Title"), desc: t("home.why2Desc") },
    { title: t("home.why3Title"), desc: t("home.why3Desc") },
    { title: t("home.why4Title"), desc: t("home.why4Desc") },
  ];

  return (
    <main>
      {/* ── Услуги — якорная секция #services, по образцу layan.kz: полный
          прайс показан прямо на этой странице. Ссылки «Наши услуги» с
          главной ведут сюда якорем. ──────────────────────────────────── */}
      <section id="services" className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
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

          <div className="surface mt-8 rounded-lg p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl">{t("catalog.menuTitle")}</h3>
            <p className="text-cream/70 mt-3 max-w-xl text-sm leading-relaxed">
              {t("catalog.menuText")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-cream/45 text-[0.62rem] tracking-[0.2em] uppercase">
                {t("catalog.menuCity")}
              </span>
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setMenuBranch(menuBranch === b.id ? null : b.id)}
                  aria-pressed={menuBranch === b.id}
                  className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                    menuBranch === b.id
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border text-cream/70 hover:border-gold/60"
                  }`}
                >
                  {t(b.labelKey)}
                </button>
              ))}
            </div>

            <a href={spaMenuPdfFor(menuBranch)} download className="btn-ghost mt-5 text-[0.62rem]">
              {t("catalog.menuButton")}
            </a>
          </div>

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
                  search={{
                    services: serializeServiceIds(selectedServiceIds),
                    ...menuBranchSearch,
                  }}
                  className="btn-gold"
                >
                  {t("cert.giftButton")}
                </Link>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Сертификат-тизер — следующий логический шаг после каталога, как
          на layan.kz (Услуги → тизер сертификата → салоны). ─────────────── */}
      <section className="border-border relative overflow-hidden border-b">
        <Divider motif="flowerBurst" className="pt-12 sm:pt-16 lg:pt-20" />
        <Motif
          name="lotusBloom"
          className="text-gold pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 sm:h-96 sm:w-96 lg:h-[36rem] lg:w-[36rem]"
          style={{ opacity: 0.2 }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pt-10 pb-16 text-center sm:px-6 sm:pt-14 sm:pb-24 lg:pb-28">
          <div className="flex items-center gap-3">
            <Motif name="lotusBloom" className="text-gold h-7 w-7 sm:h-9 sm:w-9" />
            <p className="eyebrow">{t("home.ctaEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-cream/70 mt-4 max-w-xl text-sm leading-relaxed">
            {t("home.ctaText")}
          </p>
          <Link to="/certificate" search={menuBranchSearch} className="btn-beige mt-8 sm:mt-9">
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>

      {/* ── «Как это работает» — 3 шага из ТЗ, текст дословно. ──────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="waveCrown" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-5xl px-5 pt-10 pb-16 text-center sm:px-6 sm:pt-12 sm:pb-24">
          <div className="flex items-center justify-center gap-3">
            <Motif name="petalDiamond" className="text-gold h-7 w-7" />
            <p className="eyebrow">{t("home.howEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("home.howTitle")}
          </h2>

          <div className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-3 sm:gap-10">
            {[
              { n: "1", title: t("home.how1Title"), desc: t("home.how1Desc") },
              { n: "2", title: t("home.how2Title"), desc: t("home.how2Desc") },
              { n: "3", title: t("home.how3Title"), desc: t("home.how3Desc") },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center">
                <span className="border-gold text-gold font-display flex h-12 w-12 items-center justify-center rounded-full border text-lg">
                  {step.n}
                </span>
                <p className="font-display mt-4 text-lg">{step.title}</p>
                <p className="text-cream/70 mt-2 max-w-xs text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <Link to="/certificate" className="btn-gold mt-10 sm:mt-12">
            {t("home.howButton")}
          </Link>
        </div>
      </section>

      {/* ── Почему RAI THAI SPA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24 lg:pb-32">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
                <p className="eyebrow">{t("home.whyEyebrow")}</p>
              </div>
              <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
                {t("home.whyTitle")}
              </h2>
              <div className="mt-8 grid gap-8 sm:mt-12 sm:grid-cols-2 sm:gap-10">
                {why.map((p) => (
                  <div key={p.title}>
                    <p className="font-display text-gold text-lg sm:text-xl">{p.title}</p>
                    <p className="text-cream/70 mt-2 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src={interiorImg}
                alt="Тёмно-зелёные панели, свечи и терраццо в интерьере RaiThai"
                width={1280}
                height={1600}
                loading="lazy"
                className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[560px]"
              />
              <img
                src={redNookImg}
                alt="Атмосферная деталь интерьера RaiThai — тёплый свет в нише"
                width={1080}
                height={1350}
                loading="lazy"
                className="ring-background absolute -bottom-8 -left-6 hidden h-36 w-28 object-cover shadow-2xl ring-4 sm:-bottom-10 sm:-left-10 sm:block sm:h-52 sm:w-44 sm:ring-[6px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── О RAI THAI SPA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="paisleyDrop" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-16 sm:gap-12 sm:px-6 sm:pt-12 sm:pb-24 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-16">
          <img
            src={mastersImg}
            alt={t("home.aboutPhotoAlt")}
            width={1000}
            height={1250}
            loading="lazy"
            className="h-[320px] w-full object-cover sm:h-[440px] lg:h-[560px]"
          />
          <div>
            <div className="flex items-center gap-3">
              <Motif name="offeringBowl" className="text-gold h-8 w-6 sm:h-9 sm:w-7" />
              <p className="eyebrow">{t("home.aboutEyebrow")}</p>
            </div>
            <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
              {t("home.aboutTitle")}
            </h2>
            <p className="text-cream/75 mt-4 max-w-lg text-sm leading-relaxed sm:mt-5 sm:text-base">
              {t("home.aboutText")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Блок «Ритуал» ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="templeArch" className="pt-12 sm:pt-16 lg:pt-20" />
        <Motif
          name="templeArch"
          className="text-gold pointer-events-none absolute -right-14 -bottom-10 h-56 w-56 sm:-right-24 sm:-bottom-16 sm:h-72 sm:w-72 lg:h-[26rem] lg:w-[26rem]"
          style={{ opacity: 0.15 }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-16 sm:gap-12 sm:px-6 sm:pt-12 sm:pb-24 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-16">
          <img
            src={teaImg}
            alt="Чайная церемония — часть тайской философии RaiThai"
            width={1280}
            height={1600}
            loading="lazy"
            className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[560px]"
          />
          <div>
            <div className="flex items-center gap-3">
              <Motif name="offeringBowl" className="text-gold h-8 w-6 sm:h-9 sm:w-7" />
              <p className="eyebrow">{t("home.ritualEyebrow")}</p>
            </div>
            <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
              {t("home.ritualTitle")}
            </h2>
            <p className="text-cream/70 mt-4 max-w-lg text-sm leading-relaxed sm:mt-5">
              {t("home.ritualText")}
            </p>
          </div>
        </div>
      </section>

      <PromotionsSection t={t} />
      <LoyaltySection t={t} />
      <BranchesSection t={t} />

      <footer className="relative overflow-hidden">
        <Motif
          name="dottedWave"
          className="text-gold pointer-events-none absolute top-0 left-1/2 h-24 w-40 -translate-x-1/2 sm:h-40 sm:w-64"
          style={{ opacity: 0.12 }}
        />
        <div className="text-cream/50 relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-10 text-center text-xs sm:py-16">
          <InstagramLinks t={t} />

          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            loading="lazy"
            className="h-12 w-auto opacity-70 sm:h-14"
          />

          <div>
            <p className="text-cream/45 text-[0.62rem] tracking-[0.24em] uppercase">
              {t("footer.contactsTitle")}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {BRANCHES.map((b) => (
                <a
                  key={b.id}
                  href={b.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/70 hover:text-gold transition-colors"
                >
                  {t(b.labelKey)}: WhatsApp
                </a>
              ))}
            </div>
          </div>

          <Link to="/certificate" className="btn-gold">
            {t("cert.giftButton")}
          </Link>

          <p className="text-cream/40">
            © {new Date().getFullYear()} Rai Thai Spa. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </main>
  );
}
