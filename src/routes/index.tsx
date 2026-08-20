import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronDown, Infinity as InfinityIcon, MapPin } from "lucide-react";
import { useState } from "react";
import heroPhoto from "@/assets/atmosphere-arch.webp";
import logoLight from "@/assets/logo-on-dark.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { BRANCHES, type Branch } from "@/data/branches";
import { OffersSection } from "@/components/OffersSection";
import { SiteFooter } from "@/components/SiteFooter";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";

// Порядок в hero — Кокшетау → Петропавловск, как и на витрине /offers,
// а не порядок BRANCHES в данных (тот используется в других местах сайта).
const heroBranches: Branch[] = ["kokshetau", "petropavlovsk"];
const branchById = (id: Branch) => BRANCHES.find((b) => b.id === id)!;

/** Доскролл к секции #buy (выбор города/суммы) — без перехода на другой
 *  маршрут. Раньше «Купить сертификат» вёл на /offers отдельной страницей;
 *  теперь этот же контент физически на этой же странице (см.
 *  OffersSection), клиенты просили, чтобы листалось вниз без переходов. */
const scrollToBuy = () => document.getElementById("buy")?.scrollIntoView({ behavior: "smooth" });

/**
 * Главная "/" — hero, а сразу под ним, без перехода на другой маршрут, —
 * тот же контент, что раньше жил только на /offers (выбор города/суммы +
 * каталог услуг), физически встроенный через общий компонент OffersSection.
 * Одна страница, один скролл — /offers как маршрут остался жив для прямых
 * ссылок, но на главной больше не нужен переход, чтобы это увидеть.
 *
 * «Наши услуги» и стрелка внизу hero ведут дальше — на /services (салоны,
 * Instagram, условия сертификата, футер) — эта страница в текущей задаче
 * не объединялась, остаётся отдельным маршрутом.
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rai Thai Spa — тайский массаж и SPA-сертификаты" },
      {
        name: "description",
        content:
          "RAI THAI SPA — настоящие тайские мастера и аутентичные техники массажа в Петропавловске и Кокшетау. Электронный подарочный сертификат — оформление онлайн за 2 минуты.",
      },
      { property: "og:title", content: "Rai Thai Spa — тайский массаж и SPA-сертификаты" },
      {
        property: "og:description",
        content: "Кусочек Таиланда в вашем городе. Подарочный сертификат на массаж и SPA.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useLanguage();
  // Город в hero — формальность (правка клиента): клик только подсвечивает
  // кнопку, никуда не ведёт и ни на что не влияет. Раньше вёл прямо в
  // /certificate?branch=... — эта функциональность убрана, реальный выбор
  // города остался в секции ниже (OffersSection).
  const [activeHeroBranch, setActiveHeroBranch] = useState<Branch | null>(null);

  return (
    <main>
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <img
          src={heroPhoto}
          alt="Интерьер RaiThai Massage & Spa — тёмно-зелёные стены, авторская картина, полосатый ковёр"
          width={1080}
          height={1350}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,13,0.85),rgba(8,18,13,0.68)_45%,rgba(14,28,21,0.96))]" />

        <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-14 text-center sm:px-6">
          {/* Пилюли выбора города — по структуре layan.kz, но в нашей
              палитре (тёмно-зелёный/золотой, не их цвета). Ведут сразу в
              мастер оформления с выставленным городом — та же
              city-фильтрация /certificate, что уже используется на /offers. */}
          <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
            {heroBranches.map((id) => {
              const active = activeHeroBranch === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveHeroBranch(id)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[0.68rem] whitespace-nowrap backdrop-blur-sm transition-colors sm:gap-1.5 sm:px-5 sm:py-2 sm:text-sm ${
                    active
                      ? "border-gold bg-gold text-primary-foreground"
                      : "border-gold/50 text-gold bg-forest-deep/60 hover:bg-gold/10"
                  }`}
                >
                  <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                  {t(branchById(id).labelKey)}
                </button>
              );
            })}
          </div>

          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            className="w-32 sm:w-40"
          />

          <h1 className="font-display mt-7 max-w-xs text-[1.9rem] leading-[1.15] sm:mt-8 sm:max-w-sm sm:text-4xl lg:text-5xl">
            {t("home.aboutTitle")}
          </h1>
          <p className="text-cream/75 mt-4 max-w-sm text-sm leading-relaxed">
            {t("home.why2Title")}. {t("home.why2Desc")}
          </p>

          {/* Бессрочность сертификата — по ТЗ должна быть видна уже в hero,
              отдельным акцентом, не переписывая уже утверждённый заголовок. */}
          <div className="border-gold/40 bg-forest-deep/60 text-gold mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.62rem] tracking-[0.15em] uppercase backdrop-blur-sm">
            <InfinityIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            {t("home.heroBadgeTitle")}
          </div>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <button type="button" onClick={scrollToBuy} className="btn-beige w-full">
              {t("home.heroCta")}
            </button>
            <Link to="/services" className="btn-gold w-full">
              {t("home.heroCatalogCta")}
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToBuy}
          aria-label={t("home.heroCta")}
          className="border-gold/50 text-gold hover:bg-gold/10 relative mx-auto mb-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors sm:mb-8"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </section>

      <OffersSection />

      {/* ── «Почему RAI THAI SPA» — 4 причины из ТЗ. Переводы (whyEyebrow,
          whyTitle, why1-4Title/Desc) уже были в i18n, блок физически нигде
          не выводился — восстановлен здесь, на главной, чтобы бессрочность
          сертификата (why1) была видна и как отдельный пункт преимуществ,
          не только в hero-бейдже и в FAQ. ──────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="diamondLattice" className="pt-4 sm:pt-6" />
        <div className="relative mx-auto max-w-5xl px-5 pt-8 pb-16 sm:px-6 sm:pb-24">
          <div className="flex items-center justify-center gap-3 text-center sm:justify-start sm:text-left">
            <Motif name="petalDiamond" className="text-gold h-7 w-7 shrink-0" />
            <p className="eyebrow">{t("home.whyEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-center text-2xl sm:text-left sm:text-3xl">
            {t("home.whyTitle")}
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="surface flex flex-col gap-2 rounded-lg p-5">
                <span className="border-gold/45 text-gold flex h-9 w-9 shrink-0 items-center justify-center rounded-full border">
                  <Check className="h-4 w-4" />
                </span>
                <h3 className="font-display text-base leading-tight">
                  {t(`home.why${n}Title`)}
                </h3>
                <p className="text-cream/70 text-sm leading-relaxed">{t(`home.why${n}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter t={t} />
    </main>
  );
}
