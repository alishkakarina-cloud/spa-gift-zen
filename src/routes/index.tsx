import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import heroPhoto from "@/assets/atmosphere-arch.jpg";
import logoLight from "@/assets/logo-on-dark.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { BRANCHES, type Branch } from "@/data/branches";

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.37 4 14.98c0 2.2.6 4.28 1.66 6.08L4 29l8.16-2.14a11.9 11.9 0 0 0 3.86.64h.01c6.62 0 12.02-5.37 12.02-11.98C28.05 8.37 22.65 3 16.02 3Zm0 21.9h-.01a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-4.85 1.27 1.3-4.72-.24-.38a9.86 9.86 0 0 1-1.52-5.29c0-5.46 4.46-9.9 9.94-9.9 2.65 0 5.15 1.03 7.02 2.9a9.83 9.83 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.92 9.91Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.47 1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

/**
 * Новая главная "/" — по структуре layan.kz (полноэкранный hero: лого →
 * города → контакт → заголовок → подзаголовок → 2 CTA → индикатор скролла),
 * но без визуального стиля layan.kz — палитра и шрифты те же, что и везде на
 * сайте. Весь прежний контент главной (каталог, инфоблоки, футер) переехал
 * на /offers, эта страница — только hero.
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
  const primaryBranch = BRANCHES[0]!;

  // Порядок городов в hero — Кокшетау → Петропавловск, как и было на прежней
  // главной (см. /offers), а не порядок BRANCHES в данных.
  const heroBranches: Branch[] = ["kokshetau", "petropavlovsk"];
  const branchById = (id: Branch) => BRANCHES.find((b) => b.id === id)!;

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
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            className="w-32 sm:w-40"
          />

          {/* Города — ведут на витрину услуг /offers с подставленным
              филиалом, а не разворачивают контент прямо здесь (контента для
              разворота у нас нет: единый каталог живёт на /offers). */}
          <div className="mt-6 grid w-full max-w-xs grid-cols-2 gap-2">
            {heroBranches.map((id) => (
              <Link
                key={id}
                to="/offers"
                hash="services"
                search={{ branch: id }}
                className="btn-ghost"
              >
                {t(branchById(id).labelKey)}
              </Link>
            ))}
          </div>

          {/* Телефона в проекте нет — по контакту у нас WhatsApp, замена
              согласована. */}
          <a
            href={primaryBranch.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/80 hover:text-gold mt-5 flex items-center gap-2.5 text-sm transition-colors"
          >
            <span className="border-gold/45 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border">
              <WhatsAppGlyph className="h-4 w-4" />
            </span>
            {t("whatsapp.label")}
          </a>

          <h1 className="font-display mt-8 max-w-xs text-[1.9rem] leading-[1.15] sm:max-w-sm sm:text-4xl lg:text-5xl">
            {t("home.aboutTitle")}
          </h1>
          <p className="text-cream/75 mt-4 max-w-sm text-sm leading-relaxed">
            {t("home.why2Title")}. {t("home.why2Desc")}
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link to="/certificate" className="btn-beige w-full">
              {t("home.heroCta")}
            </Link>
            <Link to="/offers" hash="services" className="btn-gold w-full">
              {t("home.heroCatalogCta")}
            </Link>
          </div>
        </div>

        <Link
          to="/offers"
          hash="services"
          aria-label={t("home.heroCatalogCta")}
          className="border-gold/50 text-gold hover:bg-gold/10 relative mx-auto mb-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors sm:mb-8"
        >
          <ChevronDown className="h-5 w-5" />
        </Link>
      </section>
    </main>
  );
}
