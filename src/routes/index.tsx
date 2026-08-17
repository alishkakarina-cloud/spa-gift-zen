import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import heroPhoto from "@/assets/atmosphere-arch.jpg";
import logoLight from "@/assets/logo-on-dark.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { BottomSheet } from "@/components/BottomSheet";
import { spaMenuPdfFor } from "@/data/branches";
import { services, formatPrice } from "@/data/catalog";

/**
 * Превью каталога внутри шторки — сознательно короткая подборка (не весь
 * каталог: в «Массаж» и «SPA-программы» по 9 позиций каждая), те же id, что
 * первыми стоят в data/catalog.ts. Полный список — через PDF-кнопку внизу
 * шторки.
 */
const sheetPreviewGroups: ReadonlyArray<{ groupKey: string; serviceIds: readonly string[] }> = [
  {
    groupKey: "cert.groupMassage",
    serviceIds: ["oil-absolute-calm", "traditional-thai", "lomi-lomi", "hot-stones"],
  },
  { groupKey: "cert.groupSpa", serviceIds: ["queen-of-thailand", "king-of-thailand"] },
];

function ServicePreviewRow({
  id,
  t,
}: {
  id: string;
  t: (path: string, vars?: Record<string, string | number>) => string;
}) {
  const price = services.find((s) => s.id === id)?.price ?? 0;
  return (
    <li className="border-border/60 border-b py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="font-display text-base">{t(`services.${id}.name`)}</span>
        <span className="text-gold shrink-0 text-sm">{formatPrice(price)}</span>
      </div>
      <p className="text-cream/45 mt-0.5 text-[0.62rem] tracking-[0.15em] uppercase">
        {t(`services.${id}.duration`)}
      </p>
      <p className="text-cream/65 mt-1.5 text-sm leading-relaxed">
        {t(`services.${id}.description`)}
      </p>
    </li>
  );
}

/**
 * Новая главная "/" — по структуре layan.kz (полноэкранный hero: лого →
 * заголовок → подзаголовок → 2 CTA → индикатор скролла), но без визуального
 * стиля layan.kz — палитра и шрифты те же, что и везде на сайте. Кнопки
 * городов и WhatsApp-контакт из hero убраны — дублировали sticky-хедер и
 * витрину /offers, где выбор города уже есть. Весь прежний контент главной
 * (каталог, инфоблоки, футер) переехал на /offers, эта страница — только
 * hero.
 *
 * «Купить сертификат» ведёт на /offers (выбор города/суммы + каталог), а
 * не сразу на /certificate — так через hero всегда проходит выбор
 * города/суммы. «Наши услуги» открывает шторку с PDF-каталогом (как на
 * layan.kz).
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
  const [servicesOpen, setServicesOpen] = useState(false);

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

          <h1 className="font-display mt-7 max-w-xs text-[1.9rem] leading-[1.15] sm:mt-8 sm:max-w-sm sm:text-4xl lg:text-5xl">
            {t("home.aboutTitle")}
          </h1>
          <p className="text-cream/75 mt-4 max-w-sm text-sm leading-relaxed">
            {t("home.why2Title")}. {t("home.why2Desc")}
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link to="/offers" className="btn-beige w-full">
              {t("home.heroCta")}
            </Link>
            <button type="button" onClick={() => setServicesOpen(true)} className="btn-gold w-full">
              {t("home.heroCatalogCta")}
            </button>
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

      <BottomSheet
        open={servicesOpen}
        onClose={() => setServicesOpen(false)}
        closeLabel={t("home.sheetClose")}
      >
        <h2 className="font-display pr-8 text-xl sm:text-2xl">{t("home.heroCatalogCta")}</h2>
        <p className="text-cream/70 mt-3 max-w-lg text-sm leading-relaxed">
          {t("catalog.subtitle")}
        </p>

        {sheetPreviewGroups.map((group) => (
          <div key={group.groupKey}>
            <p className="font-display text-gold mt-6 text-lg">{t(group.groupKey)}</p>
            <ul className="mt-2">
              {group.serviceIds.map((id) => (
                <ServicePreviewRow key={id} id={id} t={t} />
              ))}
            </ul>
          </div>
        ))}

        <a href={spaMenuPdfFor()} download className="btn-gold mt-8 w-full sm:w-auto">
          {t("home.sheetPdfButton")}
        </a>
      </BottomSheet>
    </main>
  );
}
