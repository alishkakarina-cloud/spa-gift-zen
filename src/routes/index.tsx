import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroPhoto from "@/assets/atmosphere-arch.jpg";
import interiorImg from "@/assets/interior-candles.jpg";
import redNookImg from "@/assets/atmosphere-red.jpg";
import teaImg from "@/assets/detail-tea.jpg";
import mastersImg from "@/assets/masters-team.webp";
import logoLight from "@/assets/logo-on-dark.webp";
import { Motif } from "@/components/Motif";
import { Divider } from "@/components/Divider";
import { Ribbon } from "@/components/Ribbon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CertificateCard } from "@/components/CertificateCard";
import { BranchesSection } from "@/components/BranchesSection";
import { PromotionsSection } from "@/components/PromotionsSection";
import { LoyaltySection } from "@/components/LoyaltySection";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  MIN_AMOUNT,
  designs,
  fixedAmounts,
  formatPrice,
  serviceImage,
  services,
} from "@/data/catalog";
import { BRANCHES, type Branch } from "@/data/branches";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rai Thai Spa — подарочные сертификаты онлайн" },
      {
        name: "description",
        content:
          "Электронные подарочные сертификаты Rai Thai Spa: тайский массаж и SPA-программы. Оформление за 2 минуты, сертификат приходит сразу после оплаты.",
      },
      { property: "og:title", content: "Rai Thai Spa — подарочные сертификаты онлайн" },
      {
        property: "og:description",
        content:
          "Подарите настоящее тайское SPA. Сертификат на услугу или на сумму — оформление за 2 минуты.",
      },
    ],
  }),
  component: Index,
});

/**
 * Программы, которые показываем прямо на главной. Полный каталог живёт на
 * /catalog — здесь только витрина коротких путей до покупки.
 * `hit` — бейдж «Хит» из ТЗ; состав и цены услуг берутся из каталога.
 */
const HIGHLIGHTS: ReadonlyArray<{ id: string; hit?: boolean }> = [
  { id: "reload", hit: true },
  { id: "queen-of-thailand", hit: true },
  { id: "oil-absolute-calm", hit: true },
  { id: "king-of-thailand" },
  { id: "thai-bath-1" },
  { id: "journey-thailand-1" },
  { id: "journey-bali-1" },
  { id: "journey-malaysia-1" },
];

function Index() {
  const { t } = useLanguage();
  const [city, setCity] = useState<Branch>("petropavlovsk");
  const [amountsOpen, setAmountsOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");

  const parsedCustom = Number(customAmount);
  const effectiveAmount =
    customAmount && Number.isFinite(parsedCustom) && parsedCustom >= MIN_AMOUNT
      ? parsedCustom
      : selectedAmount;

  const why = [
    { title: t("home.why1Title"), desc: t("home.why1Desc") },
    { title: t("home.why2Title"), desc: t("home.why2Desc") },
    { title: t("home.why3Title"), desc: t("home.why3Desc") },
    { title: t("home.why4Title"), desc: t("home.why4Desc") },
  ];

  const highlights = HIGHLIGHTS.map((h) => ({
    ...h,
    service: services.find((s) => s.id === h.id)!,
  })).filter((h) => h.service);

  return (
    <main>
      {/* Композиция намеренно плотная: экран не растягивается на всю высоту,
          чтобы блок выбора сертификата был виден почти сразу. */}
      <section className="relative overflow-hidden">
        <Ribbon side="left" />
        <LanguageSwitcher className="absolute top-5 right-5 z-20 sm:top-6 sm:right-6" />
        <img
          src={heroPhoto}
          alt="Интерьер RaiThai Massage & Spa — тёмно-зелёные стены, авторская картина, полосатый ковёр"
          width={1080}
          height={1350}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,13,0.88),rgba(8,18,13,0.72)_45%,rgba(14,28,21,0.97))]" />
        <Motif
          name="lotusCrown"
          className="text-gold pointer-events-none absolute -top-10 -right-16 h-56 w-56 sm:-top-20 sm:-right-28 sm:h-[32rem] sm:w-[32rem] lg:h-[42rem] lg:w-[42rem]"
          style={{ opacity: 0.22 }}
        />
        <Motif
          name="palmFrond"
          className="text-gold-soft pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 sm:-bottom-24 sm:-left-20 sm:h-80 sm:w-80 lg:h-[28rem] lg:w-[28rem]"
          style={{ opacity: 0.2 }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-5 py-12 sm:px-6 sm:py-14 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <img
                src={logoLight}
                alt="RaiThai Massage & Spa"
                width={900}
                height={778}
                className="w-36 sm:w-44 lg:w-52"
              />
              <Divider motif="waveCrown" className="mt-4 sm:mt-5" />
              <h1 className="font-display mt-4 text-[1.9rem] leading-[1.12] sm:mt-5 sm:text-4xl lg:text-5xl">
                {t("home.heroTitle1")}
                <br />
                {t("home.heroTitle2")}
              </h1>
              <p className="text-cream/75 mt-3 max-w-xl text-sm leading-relaxed sm:mt-4">
                {t("home.heroSubtitle")}
              </p>

              {/* Точка бессрочности №1 — заметный бейдж, не мелкий текст. */}
              <div className="border-gold/45 bg-gold/10 mt-4 max-w-md rounded-lg border px-4 py-3 text-left sm:mt-5">
                <p className="text-gold font-display text-base tracking-wide uppercase sm:text-lg">
                  {t("home.heroBadgeTitle")}
                </p>
                <p className="text-cream/75 mt-1.5 text-sm leading-relaxed">
                  {t("home.heroBadgeText")}
                </p>
              </div>

              <p className="text-cream/60 mt-4 text-[0.7rem] tracking-[0.24em] uppercase">
                {t("home.heroTimeLine")}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
                <a href="#certificates" className="btn-gold">
                  {t("home.heroCta")}
                </a>
                <Link to="/catalog" className="btn-ghost">
                  {t("home.heroCatalogCta")}
                </Link>
              </div>
            </div>

            {/* Мокап сертификата — та же карточка, что получает покупатель. */}
            <div className="mx-auto w-full max-w-md lg:max-w-none">
              <CertificateCard design={designs[0]!} valueLabel={formatPrice(50000)} compact />
            </div>
          </div>
        </div>
      </section>

      {/* ── Блок 2: главный коммерческий блок ─────────────────────────── */}
      <section id="certificates" className="relative overflow-hidden scroll-mt-6">
        <Divider motif="lotusBloom" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="petalDiamond" className="text-gold h-7 w-7" />
            <p className="eyebrow">{t("home.buyEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("home.buyTitle")}
          </h2>

          {/* Шаг 0 — город. Вынесен в начало сценария покупки, как на референсе,
              а не спрятан внутри формы заказа. */}
          <p className="eyebrow mt-8">{t("home.buyCityEyebrow")}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {BRANCHES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setCity(b.id)}
                aria-pressed={city === b.id}
                className={`rounded-md border px-5 py-3 text-sm transition-colors ${
                  city === b.id
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border text-cream/75 hover:border-gold/60"
                }`}
              >
                {t("home.buyCityPrefix")} {t(b.labelKey)}
              </button>
            ))}
          </div>

          {/* Вариант 1 — сертификат на сумму */}
          <div className="surface mt-6 rounded-lg p-6 sm:mt-8 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-xl sm:text-2xl">{t("home.buyAmountTitle")}</h3>
              {/* Точка бессрочности №2 */}
              <span className="border-gold/45 text-gold rounded-full border px-3 py-1 text-[0.62rem] tracking-[0.2em] uppercase">
                {t("home.buyEndless")}
              </span>
            </div>
            <p className="text-cream/70 mt-2 text-sm">{t("home.buyAmountText")}</p>

            {/* Номиналы раскрываются по клику. Анимация — через grid-rows,
                чтобы высота считалась сама и переход был плавным. */}
            <button
              type="button"
              onClick={() => setAmountsOpen((v) => !v)}
              aria-expanded={amountsOpen}
              className="border-gold/45 text-gold hover:bg-gold/10 mt-5 inline-flex items-center gap-2 rounded-md border px-5 py-3 text-sm transition-colors"
            >
              {t("home.buyAmountToggle")}
              <span
                className={`text-xs transition-transform duration-300 ${amountsOpen ? "rotate-45" : ""}`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              className={`grid transition-all duration-500 ease-out ${
                amountsOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex flex-wrap gap-3">
                  {fixedAmounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(a);
                        setCustomAmount("");
                      }}
                      aria-pressed={!customAmount && selectedAmount === a}
                      className={`rounded-md border px-5 py-3 text-sm transition-colors ${
                        !customAmount && selectedAmount === a
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-border text-cream/75 hover:border-gold/60"
                      }`}
                    >
                      {formatPrice(a)}
                    </button>
                  ))}
                </div>

                <label
                  className={`mt-4 block max-w-xs rounded-md border p-4 transition-colors ${
                    customAmount ? "border-gold bg-gold/10" : "border-border"
                  }`}
                >
                  <span
                    className={`text-xs transition-colors ${customAmount ? "text-gold" : "text-cream/60"}`}
                  >
                    {t("home.buyAmountCustom")}
                  </span>
                  <input
                    type="number"
                    min={MIN_AMOUNT}
                    step={1000}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={String(MIN_AMOUNT)}
                    className={`border-input focus:border-gold mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none ${customAmount ? "border-gold text-gold" : ""}`}
                  />
                </label>

                <Link
                  to="/certificate"
                  search={{ kind: "amount", amount: effectiveAmount, branch: city }}
                  className="btn-gold mt-6"
                >
                  {t("home.buyGift")}
                </Link>
              </div>
            </div>
          </div>

          {/* Вариант 2 — сертификат на программу */}
          <div className="mt-12 sm:mt-16">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-xl sm:text-2xl">{t("home.buyProgramTitle")}</h3>
              <Link
                to="/catalog"
                className="text-gold/85 hover:text-gold text-[0.65rem] tracking-[0.24em] uppercase transition-colors"
              >
                {t("home.buyAllServices")} →
              </Link>
            </div>
            <p className="text-cream/70 mt-2 max-w-xl text-sm">{t("home.buyProgramText")}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map(({ id, hit, service }) => {
                const image = serviceImage(id);
                return (
                  <article
                    key={id}
                    className="surface flex flex-col overflow-hidden rounded-lg"
                  >
                    <div className="relative">
                      {image && (
                        <img
                          src={image}
                          alt=""
                          width={720}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      )}
                      {hit && (
                        <span className="bg-gold text-primary-foreground absolute top-3 left-3 rounded-full px-3 py-1 text-[0.6rem] tracking-[0.2em] uppercase">
                          {t("home.buyHit")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h4 className="font-display text-lg leading-tight">
                        {t(`services.${id}.name`)}
                      </h4>
                      {t(`services.${id}.duration`) && (
                        <span className="text-cream/45 text-[0.62rem] tracking-[0.2em] uppercase">
                          {t(`services.${id}.duration`)}
                        </span>
                      )}
                      <p className="text-cream/70 line-clamp-2 text-sm leading-relaxed">
                        {t(`services.${id}.description`)}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <span className="text-gold text-sm">{formatPrice(service.price)}</span>
                        <Link
                          to="/certificate"
                          search={{ service: id, branch: city }}
                          className="border-gold/45 text-gold hover:bg-gold/10 rounded-md border px-4 py-2 text-[0.62rem] tracking-[0.2em] uppercase transition-colors"
                        >
                          {t("home.buyGift")}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Блок 3: почему RAI THAI SPA ───────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-12 sm:pt-16 lg:pt-20" />
        <Motif
          name="diamondLattice"
          className="text-sage pointer-events-none absolute -top-6 -left-14 h-52 w-52 sm:-top-10 sm:-left-24 sm:h-72 sm:w-72 lg:h-[26rem] lg:w-[26rem]"
          style={{ opacity: 0.16 }}
        />
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

      {/* ── Блок 5: о RAI THAI SPA ────────────────────────────────────── */}
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

      {/* ── Блок «Ритуал» — оставлен как был ──────────────────────────── */}
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

      {/* ── Блок 4: FAQ (точка бессрочности №4) ───────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="dottedWave" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="waveCrown" className="text-gold h-7 w-9" />
            <p className="eyebrow">{t("home.faqEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("home.faqTitle")}
          </h2>
          <div className="border-border mt-8 border-t">
            <details className="border-border group border-b" open>
              <summary className="font-display marker:content-none flex cursor-pointer items-center justify-between gap-4 py-5 text-lg">
                {t("home.faq1Q")}
                <span className="text-gold text-sm transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-cream/70 pb-5 text-sm leading-relaxed">{t("home.faq1A")}</p>
            </details>
          </div>
        </div>
      </section>

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
          <Link to="/certificate" className="btn-ghost mt-8 sm:mt-9">
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>

      {/* Акции салонов — информационный блок перед контактами. */}
      <PromotionsSection t={t} />
      <LoyaltySection t={t} />

      {/* Контакты филиалов, 2ГИС и Instagram — перед футером. */}
      <BranchesSection t={t} />

      <footer className="relative overflow-hidden">
        <Motif
          name="dottedWave"
          className="text-gold pointer-events-none absolute top-0 left-1/2 h-24 w-40 -translate-x-1/2 sm:h-40 sm:w-64"
          style={{ opacity: 0.12 }}
        />
        <div className="text-cream/50 relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-5 py-10 text-center text-xs sm:py-16">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            loading="lazy"
            className="h-12 w-auto opacity-70 sm:h-14"
          />
        </div>
      </footer>
    </main>
  );
}
