import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, MapPin } from "lucide-react";
import heroPhoto from "@/assets/atmosphere-arch.jpg";
import logoLight from "@/assets/logo-on-dark.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { BRANCHES, type Branch } from "@/data/branches";
import { OffersSection } from "@/components/OffersSection";

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
            {heroBranches.map((id) => (
              <Link
                key={id}
                to="/certificate"
                search={{ branch: id }}
                className="border-gold/50 text-gold bg-forest-deep/60 hover:bg-gold/10 flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[0.68rem] whitespace-nowrap backdrop-blur-sm transition-colors sm:gap-1.5 sm:px-5 sm:py-2 sm:text-sm"
              >
                <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                {t(branchById(id).labelKey)}
              </Link>
            ))}
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
    </main>
  );
}
