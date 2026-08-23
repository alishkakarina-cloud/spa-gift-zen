import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback } from "react";
import { Check, ChevronDown, Clock, Infinity as InfinityIcon, MapPin } from "lucide-react";
import heroPhoto from "@/assets/atmosphere-arch.webp";
import logoLight from "@/assets/logo-on-dark.webp";
import { useLanguage } from "@/i18n/LanguageContext";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";
import { services, serviceImage, formatPrice } from "@/data/catalog";
import { BranchesSection } from "@/components/BranchesSection";
import { CertPerks } from "@/components/CertPerks";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";
import { FAQ_NUMBERS } from "@/data/faq";

/**
 * «Хиты услуг» на главной — 4 позиции, прямо названные владельцем (правка
 * 2026-08-23, блок «Наши услуги» по структуре layan.kz): Oil-массаж,
 * Традиционный тайский массаж, «Перезагрузка», «Королева Таиланда». Имена —
 * id из каталога (src/data/catalog.ts), название/фото/цена берутся оттуда
 * же, а не дублируются вручную. У «Королевы Таиланда» в каталоге услуга
 * называется «SPA-ритуал», не «SPA-программа» (как в задаче) — показываем
 * реальное название из каталога, не выдуманное.
 */
const HOME_HIT_SERVICE_IDS = [
  "oil-absolute-calm",
  "traditional-thai",
  "reload",
  "queen-of-thailand",
] as const;

// Порядок в hero — Кокшетау → Петропавловск, как и на витрине /offers,
// а не порядок BRANCHES в данных (тот используется в других местах сайта).
const heroBranches: Branch[] = ["kokshetau", "petropavlovsk"];
const branchById = (id: Branch) => BRANCHES.find((b) => b.id === id)!;

/**
 * Главная "/" — СТРОГО только информация о спа: hero, «Сертификаты Rai Thai
 * Spa», «Почему RaiThai», условия использования, салоны/контакты, FAQ,
 * футер. Никакого функционала выбора/покупки здесь нет (правка 2026-08-22,
 * владелец отменил более раннее решение объединять весь сайт в одну
 * длинную страницу) — «Купить сертификат» настоящим переходом уводит на
 * /certificate, где теперь живёт весь путь целиком: выбор города/суммы,
 * каталог услуг и весь мастер оформления с единым степпером.
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
  // «Наши услуги» — скролл на этой же странице к новому блоку «Наши услуги»
  // (id="services", правка 2026-08-23) — витрина хит-услуг сразу под hero.
  // Раньше цель была id="cert-terms" («Условия использования сертификата»),
  // это не имело отношения к названию кнопки — правка блока 4 задачи.
  // scroll-mt-24 на секции резервирует отступ под sticky-хедер.
  const scrollToServices = useCallback(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main>
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <img
          src={heroPhoto}
          alt="Интерьер RaiThai Massage & Spa — тёмно-зелёные стены, авторская картина, полосатый ковёр"
          width={1080}
          height={1350}
          // Насыщенность/контраст приглушены на самом фото (фильтр, не файл —
          // проще менять фото позже без пересборки эффекта); затемнение и
          // цветной тон — отдельным слоем ниже, так их можно независимо
          // калибровать под текст поверх.
          className="absolute inset-0 h-full w-full object-cover [filter:saturate(75%)_contrast(92%)]"
        />
        {/* Затемнение + фирменный тёмно-зелёный тон одним радиальным слоем:
            центр (там читается заголовок) — плотнее, 55-65% укрывистости;
            к краям — заметно светлее, чтобы тёплые блики/свечи на фото не
            тонули под сплошной заливкой. Цвет — --forest-deep (#253027,
            брендбук), не абстрактный зелёный. */}
        <div className="absolute inset-0 bg-[radial-gradient(140%_120%_at_50%_50%,rgba(37,48,39,0.62)_0%,rgba(37,48,39,0.58)_50%,rgba(37,48,39,0.42)_80%,rgba(37,48,39,0.26)_100%)]" />

        <div className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-14 text-center sm:px-6">
          {/* Пилюли городов — чисто визуальный декор hero (атмосфера), без
              клика и без какой-либо связи с логикой страницы. Рабочий выбор
              филиала — на шаге 1 страницы /certificate (см.
              routes/certificate.tsx), не здесь: владелец решил, что кнопки
              в hero не должны делать вообще ничего — только показывать
              города для атмосферы. */}
          <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8">
            {heroBranches.map((id) => (
              <span
                key={id}
                className="border-gold/50 text-gold bg-forest-deep/60 flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[0.68rem] whitespace-nowrap backdrop-blur-sm sm:gap-1.5 sm:px-5 sm:py-2 sm:text-sm"
              >
                <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                {t(branchById(id).labelKey)}
              </span>
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

          {/* Бессрочность сертификата — по ТЗ должна быть видна уже в hero,
              отдельным акцентом, не переписывая уже утверждённый заголовок. */}
          <div className="border-gold/40 bg-forest-deep/60 text-gold mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.62rem] tracking-[0.15em] uppercase backdrop-blur-sm">
            <InfinityIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
            {t("home.heroBadgeTitle")}
          </div>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
            <Link to="/certificate" className="btn-beige w-full">
              {t("home.heroCta")}
            </Link>
            <button type="button" onClick={scrollToServices} className="btn-gold w-full">
              {t("home.heroCatalogCta")}
            </button>
          </div>
        </div>

        <Link
          to="/certificate"
          aria-label={t("home.heroCta")}
          className="border-gold/50 text-gold hover:bg-gold/10 relative mx-auto mb-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors sm:mb-8"
        >
          <ChevronDown className="h-5 w-5" />
        </Link>
      </section>

      {/* ── «Наши услуги» — по структуре layan.kz (аудит 2026-08-23: у них
          это заголовок + короткий текст о салоне + кнопки скачивания
          SPA-меню по городам + карточки услуг), но с нашими 4 хит-позициями
          и обязательным бейджем «Хит» (тем же визуальным стилем, что и в
          основном каталоге /offers) — у layan самого бейджа нет, это наше
          решение поверх их структуры. Карточки НЕ кликабельны — чисто
          витрина, никакого перехода. id="services" — цель скролла кнопки
          «Наши услуги» в hero выше. ──────────────────────────────────── */}
      <section id="services" className="relative overflow-hidden scroll-mt-24">
        <Reveal className="relative mx-auto max-w-5xl px-5 pt-12 pb-16 sm:px-6 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
            <p className="eyebrow">{t("catalog.title")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("catalog.title")}</h2>
          <p className="text-cream/70 mt-3 max-w-xl text-sm leading-relaxed">
            {t("home.aboutText")}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {HOME_HIT_SERVICE_IDS.map((id) => {
              const service = services.find((s) => s.id === id);
              const image = serviceImage(id);
              if (!service) return null;
              return (
                <article key={id} className="surface flex flex-col overflow-hidden rounded-lg">
                  <div className="relative aspect-square">
                    {image && (
                      <img
                        src={image}
                        alt=""
                        width={720}
                        height={720}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="bg-maroon border-gold/50 text-cream absolute top-2 left-2 rounded-full border px-2 py-1 text-[0.6rem] font-medium tracking-[0.05em] uppercase">
                      {t("catalog.hitBadge")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <h3 className="font-display text-sm leading-tight sm:text-base">
                      {service.name}
                    </h3>
                    <div className="text-cream/70 mt-auto flex items-center justify-between pt-2 text-xs sm:text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        {service.duration}
                      </span>
                      <span className="text-gold font-semibold">{formatPrice(service.price)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={spaMenuPdfFor("kokshetau")} download className="btn-ghost text-[0.62rem]">
              {t("home.spaMenuKokshetauButton")}
            </a>
            <a href={spaMenuPdfFor("petropavlovsk")} download className="btn-ghost text-[0.62rem]">
              {t("home.spaMenuPetropavlovskButton")}
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── «Подарочные сертификаты» — описание + 4 пункта. id="cert-info" —
          старая цель скролла кнопки «Наши услуги» до правки 2026-08-23. ── */}
      <div id="cert-info" className="scroll-mt-24">
        <CertPerks t={t} />
      </div>

      {/* ── «Условия использования сертификата» — по структуре layan.kz
          (заголовок + карточки-плашки сплошным акцентным цветом), но с
          нашими данными и палитрой (золотой, не их оранжевый). Пункты про
          частичное использование/остаток/возврат сюда не включены — вопрос
          ещё не утверждён владельцем (см. FAQ_NUMBERS в certificate.tsx).
          term4-6 добавлены по полному тексту ТЗ (электронная выдача с
          номером, предварительная запись, передача другому человеку).
          id="cert-terms" + scroll-mt-24 — цель скролла кнопки «Наши услуги»
          в hero (правка, было id="cert-info" на блоке ВЫШЕ — заголовок
          «Условия использования» оказывался ниже экрана после скролла). ── */}
      <section id="cert-terms" className="relative overflow-hidden scroll-mt-24">
        <Reveal className="relative mx-auto max-w-2xl px-5 pb-16 sm:px-6 sm:pb-24">
          <h2 className="font-display text-center text-2xl sm:text-3xl">
            {t("home.termsTitle")}
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {([1, 3, 4, 5] as const).map((n) => (
              <div
                key={n}
                className="bg-gold text-primary-foreground flex items-center gap-3 rounded-lg px-5 py-4"
              >
                <span className="border-primary-foreground/50 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm leading-snug sm:text-base">{t(`home.term${n}`)}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── «Почему RAI THAI SPA» — 4 причины из ТЗ. ─────────────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="diamondLattice" className="pt-4 sm:pt-6" />
        <Reveal className="relative mx-auto max-w-5xl px-5 pt-8 pb-16 sm:px-6 sm:pb-24">
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
        </Reveal>
      </section>

      {/* ── «Наши салоны» — перенесены сюда из бывшего оверлея «Наши услуги»
          (см. историю задач). id="salons" сейчас ни на что не ведёт с hero
          (цель кнопки «Наши услуги» — id="cert-info" выше, правка
          2026-08-22) — оставлен на случай, если понадобится доскролл сюда
          откуда-то ещё. ──────────────────────────────────────────────── */}
      <div id="salons" className="scroll-mt-24">
        <BranchesSection t={t} />
      </div>

      {/* ── FAQ — тот же набор вопросов/ответов из официального ТЗ (блок 18),
          что и на /certificate (общий список FAQ_NUMBERS, чтобы решение о
          скрытых вопросах 6/9 не разъезжалось по файлам). ──────────────── */}
      <section className="relative overflow-hidden">
        <Divider motif="dottedWave" className="pt-4 sm:pt-6" />
        <Reveal className="relative mx-auto max-w-3xl px-5 pt-8 pb-16 sm:px-6 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="waveCrown" className="text-gold h-7 w-9" />
            <p className="eyebrow">{t("home.faqEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("home.faqTitle")}</h2>
          <div className="border-border mt-8 border-t">
            {FAQ_NUMBERS.map((n) => (
              <details key={n} className="border-border faq-accordion group border-b" open={n === 1}>
                <summary className="font-display marker:content-none flex cursor-pointer items-center justify-between gap-4 py-5 text-lg">
                  {t(`home.faq${n}Q`)}
                  <span className="text-gold text-sm transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-cream/70 pb-5 text-sm leading-relaxed">{t(`home.faq${n}A`)}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <SiteFooter t={t} />
    </main>
  );
}
