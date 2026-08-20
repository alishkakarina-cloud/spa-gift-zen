import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, MapPin } from "lucide-react";
import { CertPerks } from "@/components/CertPerks";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { useLanguage } from "@/i18n/LanguageContext";
import { services, formatPrice, serviceImage } from "@/data/catalog";
import { BRANCHES, spaMenuPdfFor, mapLinkFor, instagramLinkFor, type Branch } from "@/data/branches";
import logoLight from "@/assets/logo-on-dark.webp";

/**
 * /services — «Наши услуги» с главной ведёт сюда полноценной страницей, а не
 * маленькой шторкой (как было раньше — см. BottomSheet.tsx, компонент не
 * удалён, просто больше не используется на этой кнопке). Структура — по
 * référence layan.kz (открыли их «Наши услуги» и сверились по факту: это не
 * шторка, а секция на той же странице — салоны → Instagram → сертификаты →
 * каталог → баннер салонов → футер), но со своей палитрой и своими текстами.
 *
 * Порядок секций ниже — по правке от клиента: каталог должен быть виден
 * сразу под заголовком, без скролла через контакты; контакты (салоны +
 * Instagram) уехали в самый низ, перед футером.
 *
 * «Закрыть» отдельным крестиком не сделан — это обычная страница, а не
 * модалка, глобальный SiteHeader (лого = ссылка на главную, sticky) уже
 * даёт то же самое действие на всё время скролла.
 */
const featuredServiceIds = [
  "oil-absolute-calm",
  "traditional-thai",
  "lomi-lomi",
  "hot-stones",
  "queen-of-thailand",
  "king-of-thailand",
] as const;

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Наши услуги — Rai Thai Spa" },
      {
        name: "description",
        content:
          "Салоны Rai Thai Spa в Кокшетау и Петропавловске, каталог услуг и подарочные сертификаты.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServiceCard({ id, t }: { id: string; t: (path: string) => string }) {
  const svc = services.find((s) => s.id === id)!;
  const image = serviceImage(id);
  return (
    <article className="surface flex flex-col overflow-hidden rounded-lg">
      {image && (
        <div className="relative">
          <img
            src={image}
            alt=""
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
          />
          {svc.hit && (
            <span className="bg-maroon border-gold/50 text-cream absolute top-2 left-2 rounded-full border px-2.5 py-1 text-[0.6rem] font-medium tracking-[0.15em] uppercase">
              {t("catalog.hitBadge")}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-base leading-tight">{t(`services.${id}.name`)}</h3>
        <p className="text-cream/45 text-[0.6rem] tracking-[0.15em] uppercase">
          {t(`services.${id}.duration`)}
        </p>
        <p className="text-gold mt-auto text-sm">{formatPrice(svc.price)}</p>
      </div>
    </article>
  );
}

function ServicesPage() {
  const { t } = useLanguage();
  const [activeBranchId, setActiveBranchId] = useState<Branch>(BRANCHES[0]!.id);
  const activeBranch = BRANCHES.find((b) => b.id === activeBranchId)!;

  return (
    <main>
      <section className="relative overflow-hidden">
        <Divider motif="waveCrown" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-4 text-center sm:px-6 sm:pt-12">
          <h1 className="font-display text-3xl sm:text-4xl">{t("home.heroCatalogCta")}</h1>
        </div>
      </section>

      {/* ── 1. Каталог услуг — сразу под заголовком, без скролла через
          контакты. Превью из данных /certificate + PDF-меню. ───────────── */}
      <section id="catalog" className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-4 sm:pt-6" />
        <Reveal className="relative mx-auto max-w-6xl px-5 pt-8 pb-16 sm:px-6 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
            <p className="eyebrow">{t("catalog.title")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("catalog.title")}</h2>
          <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">
            {t("catalog.subtitle")}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {BRANCHES.map((b) => (
              <a key={b.id} href={spaMenuPdfFor(b.id)} download className="btn-ghost text-[0.62rem]">
                {t("catalog.menuButton")} — {t(b.labelKey)}
              </a>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {featuredServiceIds.map((id) => (
              <ServiceCard key={id} id={id} t={t} />
            ))}
          </div>

          <Link to="/offers" hash="services" className="btn-gold mt-8">
            {t("cert.giftButton")}
          </Link>
        </Reveal>
      </section>

      {/* ── 2. Подарочные сертификаты — 4 пункта с иконкой. ─────────────── */}
      <CertPerks t={t} />

      {/* ── 3. Баннер салонов — наша палитра (тёмно-зелёный/золотой), не
          оранжевая, как у layan. ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(14,28,21,0.97),rgba(127,73,37,0.28)_65%,rgba(180,151,117,0.24))]">
        <Reveal className="relative mx-auto flex max-w-3xl flex-col items-center px-5 py-14 text-center sm:px-6 sm:py-20">
          <Motif name="templeArch" className="text-gold h-8 w-8" />
          <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("home.salonsBannerTitle")}</h2>
          <p className="text-cream/75 mt-4 max-w-xl text-sm leading-relaxed">
            {t("home.salonsBannerText")}
          </p>
          <Link to="/offers" className="btn-beige mt-8">
            {t("home.heroCta")}
          </Link>
        </Reveal>
      </section>

      {/* ── 4. Наши салоны — пилюли-переключатель города, карточка активного
          салона (лого, Instagram, адрес). Контакты — в самом низу страницы,
          перед футером, по правке от клиента. Кнопки-пилюли переключателя
          уменьшены под мобильный (были на общих btn-gold/btn-ghost —
          крупный padding/uppercase, непропорционально большие для этого
          компактного переключателя). ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Reveal className="relative mx-auto max-w-3xl px-5 pt-8 pb-12 sm:px-6 sm:pb-16">
          <div className="flex items-center gap-3">
            <Motif name="templeArch" className="text-gold h-7 w-7" />
            <p className="eyebrow">{t("branches.eyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("branches.title")}</h2>
          <p className="text-cream/70 mt-3 max-w-xl text-sm leading-relaxed">
            {t("home.aboutText")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {BRANCHES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBranchId(b.id)}
                aria-pressed={activeBranchId === b.id}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  activeBranchId === b.id
                    ? "border-gold bg-gold text-primary-foreground"
                    : "border-border bg-card text-cream/80 hover:border-gold/60"
                }`}
              >
                {t(b.labelKey)}
              </button>
            ))}
          </div>

          <article className="surface mt-6 flex flex-col items-start gap-4 rounded-lg p-6 sm:flex-row sm:items-center sm:p-7">
            <img
              src={logoLight}
              alt=""
              width={900}
              height={778}
              loading="lazy"
              className="border-gold/40 bg-forest-deep h-16 w-16 shrink-0 rounded-full border object-contain p-2"
            />
            <div>
              <h3 className="font-display text-xl tracking-wide">RAI THAI SPA</h3>
              <a
                href={instagramLinkFor(activeBranch)}
                target="_blank"
                rel="noopener noreferrer"
                className="border-gold/45 text-gold hover:bg-gold/10 mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
              >
                <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />@{activeBranch.instagram}
              </a>
              <a
                href={mapLinkFor(activeBranch)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/80 hover:text-gold mt-3 flex items-start gap-2 text-sm transition-colors"
              >
                <MapPin className="text-gold mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {activeBranch.address}
              </a>
            </div>
          </article>
        </Reveal>
      </section>

      <SiteFooter t={t} />
    </main>
  );
}
