import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { useLanguage } from "@/i18n/LanguageContext";
import logoLight from "@/assets/logo-on-dark.webp";
import type { Service } from "@/data/catalog";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Наши услуги — Rai Thai Spa" },
      {
        name: "description",
        content:
          "Массаж, комплексные программы, SPA-путешествия и детская линия Rai Thai Spa. Выберите услугу и оформите подарочный сертификат онлайн.",
      },
      { property: "og:title", content: "Наши услуги — Rai Thai Spa" },
      {
        property: "og:description",
        content: "Все услуги Rai Thai Spa по категориям — с фото и ценами.",
      },
    ],
  }),
  component: CatalogPage,
});

/**
 * Самостоятельная витрина каталога — просмотр без шагов оформления
 * сертификата. Клик по услуге ведёт в мастер оформления (/certificate) с
 * уже выбранной услугой, через query-параметр ?service=<id>.
 */
function CatalogPage() {
  const { t } = useLanguage();
  const [groupId, setGroupId] = useState<Service["group"]>("massage");
  // Город для SPA-меню. Пока файл общий, но выбор уже влияет на ссылку —
  // когда появятся отдельные PDF, менять придётся только пути в branches.ts.
  const [branch, setBranch] = useState<Branch | null>(null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link to="/" aria-label={t("cert.backHomeLink")}>
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            className="h-12 w-auto"
          />
        </Link>
        <LanguageSwitcher />
      </header>

      <h1 className="font-display mt-10 text-3xl sm:text-4xl">{t("catalog.title")}</h1>
      <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">{t("catalog.subtitle")}</p>

      {/* Коротко об услугах + полное меню файлом. Кнопка намеренно вторичная:
          основной CTA сайта — покупка сертификата, а не скачивание прайса. */}
      <div className="surface mt-8 rounded-lg p-6 sm:p-8">
        <h2 className="font-display text-xl sm:text-2xl">{t("catalog.menuTitle")}</h2>
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
              onClick={() => setBranch(branch === b.id ? null : b.id)}
              aria-pressed={branch === b.id}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                branch === b.id
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-cream/70 hover:border-gold/60"
              }`}
            >
              {t(b.labelKey)}
            </button>
          ))}
        </div>

        <a href={spaMenuPdfFor(branch)} download className="btn-ghost mt-5 text-[0.62rem]">
          {t("catalog.menuButton")}
        </a>
      </div>

      <div className="mt-10">
        <ServiceCatalogBrowser groupId={groupId} onGroupChange={setGroupId} t={t} />
      </div>
    </main>
  );
}
