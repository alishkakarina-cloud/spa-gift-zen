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
import { BranchesSection, InstagramLinks } from "@/components/BranchesSection";
import { PromotionsSection } from "@/components/PromotionsSection";
import { LoyaltySection } from "@/components/LoyaltySection";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { useLanguage } from "@/i18n/LanguageContext";
import { MIN_AMOUNT, fixedAmounts, formatPrice } from "@/data/catalog";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";
import type { CatalogGroup } from "@/data/serviceGroups";
import { serializeServiceIds, toggleServiceId } from "@/data/selection";

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

function Index() {
  const { t } = useLanguage();
  // Единый 3-позиционный переключатель hero — по образцу layan.kz
  // (/buy-certificate, шаг 1: «Выбрать услуги (город A)» / «(город Б)» /
  // «Указать сумму», ровно одна активная панель, по умолчанию открыт первый
  // таб). Раньше городские кнопки были независимым toggle без раскрытия, а
  // сумма — отдельным аккордеоном; это и было структурным расхождением.
  const [heroTab, setHeroTab] = useState<Branch | "amount">("kokshetau");
  const [selectedAmount, setSelectedAmount] = useState<number>(fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");

  const parsedCustom = Number(customAmount);
  const effectiveAmount =
    customAmount && Number.isFinite(parsedCustom) && parsedCustom >= MIN_AMOUNT
      ? parsedCustom
      : selectedAmount;
  const heroBranch = heroTab === "amount" ? null : heroTab;
  /** Город попадает в ссылку только когда выбран — `branch` необязателен. */
  const branchSearch = heroBranch ? { branch: heroBranch } : {};

  // Порядок в hero — конкретно Кокшетау → Петропавловск (по референсу),
  // отдельно от порядка BRANCHES в данных (он используется в других местах
  // сайта и его трогать не нужно).
  const heroBranches: Branch[] = ["kokshetau", "petropavlovsk"];
  const branchById = (id: Branch) => BRANCHES.find((b) => b.id === id)!;

  // Витрина услуг — перенесена сюда с бывшей /catalog (теперь якорная секция
  // #services на главной, по структуре layan.kz, где прайс живёт прямо на
  // главной, а не отдельной страницей).
  const [servicesGroupId, setServicesGroupId] = useState<CatalogGroup>("massage");
  const [menuBranch, setMenuBranch] = useState<Branch | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const menuBranchSearch = menuBranch ? { branch: menuBranch } : {};

  /**
   * Городской таб hero: своего отдельного прайса по филиалам у нас нет (в
   * отличие от layan.kz, где Астана и Караганда показывают физически разные
   * списки услуг прямо под табами) — единый каталог уже собран в секции
   * #services. Раньше клик по табу только подсвечивал кнопку, а под ней
   * рисовалась карточка-заглушка «Выбрать услуги [город]» с описанием и
   * отдельной кнопкой — то есть у пользователя было ДВА клика вместо
   * одного, и лишняя карточка, которой на референсе нет вообще. Теперь клик
   * по табу сразу и подсвечивает его, и ведёт к реальному контенту (плавный
   * скролл к #services с подставленным филиалом) — без промежуточного шага.
   */
  const selectHeroBranch = (id: Branch) => {
    setHeroTab(id);
    setMenuBranch(id);
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  const why = [
    { title: t("home.why1Title"), desc: t("home.why1Desc") },
    { title: t("home.why2Title"), desc: t("home.why2Desc") },
    { title: t("home.why3Title"), desc: t("home.why3Desc") },
    { title: t("home.why4Title"), desc: t("home.why4Desc") },
  ];

  return (
    <main>
      {/* Композиция намеренно плотная: экран не растягивается на всю высоту,
          чтобы блок выбора сертификата был виден почти сразу. */}
      <section className="relative overflow-hidden">
        <Ribbon side="left" />
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
        {/* Раньше мотив просвечивал сквозь прозрачную btn-ghost кнопку города
            (в hero заметно длиннее ряда стало после переноса кнопок и убранного
            мокапа сертификата) — сдвинут глубже в угол и уменьшен, чтобы
            гарантированно не задевать колонку кнопок ни на одной ширине экрана. */}
        <Motif
          name="palmFrond"
          className="text-gold-soft pointer-events-none absolute -bottom-24 -left-16 h-32 w-32 sm:-bottom-36 sm:-left-28 sm:h-56 sm:w-56 lg:-bottom-48 lg:-left-40 lg:h-64 lg:w-64"
          style={{ opacity: 0.16 }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-5 py-12 sm:px-6 sm:py-14 lg:py-16">
          <div className="flex justify-center">
            <div className="flex max-w-2xl flex-col items-center text-center lg:items-start lg:text-left">
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

              {/* Три равноправных таба в одном ряду — по механике layan.kz
                  (/buy-certificate, шаг 1). По умолчанию активен первый
                  (Кокшетау), без клика. Городские табы сразу ведут к
                  реальному контенту (скролл к #services) — без
                  промежуточной карточки-заглушки, которой на референсе нет. */}
              <div className="mt-6 w-full max-w-md lg:mt-7">
                <p className="eyebrow text-center lg:text-left">{t("home.buyCityEyebrow")}</p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {heroBranches.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectHeroBranch(id)}
                      aria-pressed={heroTab === id}
                      className={heroTab === id ? "btn-gold" : "btn-ghost"}
                    >
                      {t(branchById(id).labelKey)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setHeroTab("amount")}
                    aria-pressed={heroTab === "amount"}
                    className={heroTab === "amount" ? "btn-gold" : "btn-ghost"}
                  >
                    {t("home.buyAmountToggle")}
                  </button>
                </div>

                {/* Панель показывается только для «Указать сумму» — это
                    единственный из трёх табов, чей реальный контент
                    физически помещается прямо здесь, как и на layan.kz.
                    Для городских табов реальный контент — это список услуг,
                    который живёт в #services, а не второй раз здесь.
                    panel-reveal — раньше появлялась мгновенно, без анимации;
                    тайминг снят с layan.kz (см. styles.css). */}
                {heroTab === "amount" && (
                  <div className="surface panel-reveal mt-4 rounded-lg p-4 text-left sm:p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-lg">{t("home.buyAmountTitle")}</p>
                      <span className="border-gold/45 text-gold rounded-full border px-3 py-1 text-[0.55rem] tracking-[0.2em] uppercase">
                        {t("home.buyEndless")}
                      </span>
                    </div>
                    <p className="text-cream/70 mt-2 text-sm leading-relaxed">
                      {t("home.buyAmountText")}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {fixedAmounts.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(a);
                            setCustomAmount("");
                          }}
                          aria-pressed={!customAmount && selectedAmount === a}
                          className={`rounded-md border px-4 py-2.5 text-sm transition-colors ${
                            !customAmount && selectedAmount === a
                              ? "border-gold bg-gold text-primary-foreground"
                              : "border-border bg-card text-cream hover:border-gold/60"
                          }`}
                        >
                          {formatPrice(a)}
                        </button>
                      ))}
                    </div>

                    <label
                      className={`bg-card mt-3 block rounded-md border p-3 transition-colors ${
                        customAmount ? "border-gold" : "border-border"
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
                        className={`border-input focus:border-gold bg-background mt-2 w-full border px-3 py-2.5 text-sm outline-none ${customAmount ? "border-gold text-gold" : ""}`}
                      />
                    </label>

                    <Link
                      to="/certificate"
                      search={{ kind: "amount", amount: effectiveAmount, ...branchSearch }}
                      className="btn-gold mt-4"
                    >
                      {t("home.buyGift")}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Услуги (бывшая /catalog) — якорная секция #services, по образцу
          layan.kz: полный прайс показан прямо на главной, а не отдельной
          страницей. Ссылка «Наши услуги» в hero ведёт сюда якорем.
          Поднято сразу после hero — каталог должен идти выше информационных
          блоков (не после них), это отдельно попросили поправить. ──────── */}
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

          {/* Коротко об услугах + полное меню файлом — тот же блок, что был
              на /catalog, перед списком услуг, как и на layan.kz (там
              PDF-меню тоже стоит перед прайсом). */}
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
          на layan.kz (Услуги → тизер сертификата → салоны). Раньше стоял
          в самом низу страницы, после «Ритуала». ──────────────────────── */}
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
          {/* Город из hero едет и сюда: филиал на форме оформления больше не
              выбирается, он приходит только из сценария покупки. */}
          <Link to="/certificate" search={branchSearch} className="btn-beige mt-8 sm:mt-9">
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>

      {/* ── Информационные блоки — опущены ниже каталога и сертификат-тизера
          (были выше, сразу после hero; теперь после продуктовой части, как
          и попросили). Блок 3: почему RAI THAI SPA ─────────────────────── */}
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

      {/* Акции салонов — информационный блок перед контактами. */}
      <PromotionsSection t={t} />
      <LoyaltySection t={t} />

      {/* Контакты филиалов и 2ГИС — «Наши салоны», перед футером, как и на
          layan.kz. */}
      <BranchesSection t={t} />

      {/* Футер по составу блоков layan.kz (Instagram → лого → контакты → CTA
          → копирайт), но без слотов под юр.документы и платёжные иконки —
          таких данных у нас пока нет, придумывать их не будем. */}
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
