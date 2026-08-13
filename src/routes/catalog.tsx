import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { useLanguage } from "@/i18n/LanguageContext";
import logoLight from "@/assets/logo-light.png";
import type { Service } from "@/data/catalog";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Каталог услуг — Rai Thai Spa" },
      {
        name: "description",
        content:
          "Массаж, комплексные программы, SPA-путешествия и детская линия Rai Thai Spa. Выберите услугу и оформите подарочный сертификат онлайн.",
      },
      { property: "og:title", content: "Каталог услуг — Rai Thai Spa" },
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
  const navigate = useNavigate();
  const [groupId, setGroupId] = useState<Service["group"]>("massage");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link to="/" aria-label={t("cert.backHomeLink")}>
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            className="h-12 w-auto"
          />
        </Link>
        <LanguageSwitcher />
      </header>

      <h1 className="font-display mt-10 text-3xl sm:text-4xl">{t("catalog.title")}</h1>
      <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">{t("catalog.subtitle")}</p>

      <div className="mt-10">
        <ServiceCatalogBrowser
          groupId={groupId}
          onGroupChange={setGroupId}
          selectedServiceId={null}
          onServiceSelect={(id) => navigate({ to: "/certificate", search: { service: id } })}
          t={t}
        />
      </div>
    </main>
  );
}
