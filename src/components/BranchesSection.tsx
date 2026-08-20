import { Instagram, MapPin } from "lucide-react";
import { Motif } from "@/components/Motif";
import { Reveal } from "@/components/Reveal";
import { BRANCHES, instagramLinkFor, mapLinkFor } from "@/data/branches";
import logoLight from "@/assets/logo-on-dark.webp";

/**
 * «Наши салоны» — контакты двух филиалов и отдельный блок Instagram.
 *
 * Карта намеренно не встраивается виджетом: адрес — компактная кликабельная
 * строка с пином, которая открывает 2ГИС в новой вкладке. Так блок остаётся
 * вспомогательным и не спорит с основной конверсией — покупкой сертификата.
 */
export function BranchesSection({ t }: { t: (path: string) => string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
          <div className="flex items-center gap-3">
            <Motif name="templeArch" className="text-gold h-7 w-7" />
            <p className="eyebrow">{t("branches.eyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("branches.title")}
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6">
            {BRANCHES.map((b) => (
              <Reveal key={b.id} as="article" className="surface rounded-lg p-6 sm:p-7">
                <p className="text-cream/45 text-[0.62rem] tracking-[0.24em] uppercase">
                  {t(b.labelKey)}
                </p>
                <h3 className="font-display mt-2 text-xl tracking-wide">RAI THAI SPA</h3>

                <a
                  href={mapLinkFor(b)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/80 hover:text-gold mt-5 flex items-start gap-2.5 text-sm transition-colors"
                >
                  <MapPin className="text-gold mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {b.address}
                    <span className="text-cream/45 mt-0.5 block text-[0.62rem] tracking-[0.2em] uppercase">
                      {t("branches.openMap")}
                    </span>
                  </span>
                </a>

                <a
                  href={instagramLinkFor(b)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/80 hover:text-gold mt-4 flex items-center gap-2.5 text-sm transition-colors"
                >
                  <Instagram className="text-gold h-4 w-4 shrink-0" aria-hidden="true" />
                  @{b.instagram}
                </a>

                <a
                  href={b.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cream/80 hover:text-gold mt-4 flex items-center gap-2.5 text-sm transition-colors"
                >
                  <WhatsAppGlyph className="text-gold h-4 w-4 shrink-0" />
                  WhatsApp
                </a>

                <p className="border-border text-cream/60 mt-5 border-t pt-4 text-sm">
                  {t("branches.hours")}: {b.hours}
                </p>
              </Reveal>
            ))}
          </div>
      </div>
    </section>
  );
}

/**
 * «Мы в Instagram» — раньше был вторым блоком BranchesSection перед обычным
 * <footer>. Вынесен отдельно и переехал внутрь <footer> на главной — на
 * layan.kz Instagram-ссылки живут именно внутри футера, а не отдельной
 * секцией перед ним.
 *
 * Карточки укрупнены по образцу layan.kz (круглый лого-плейсхолдер сверху,
 * крупное название салона, большая пилюля-кнопка с хендлом на всю ширину) —
 * но в нашей палитре (тёмно-зелёный/золотой), не в их светлой. У layan
 * плейсхолдер пустой (лого ещё не подгрузилось на скрине) — у нас сразу
 * стоит наш логотип в золотом круге, как на карточке филиала в /services.
 */
export function InstagramLinks({ t }: { t: (path: string) => string }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3">
        <Instagram className="text-gold h-5 w-5" aria-hidden="true" />
        <h2 className="font-display text-xl sm:text-2xl">{t("branches.instagramTitle")}</h2>
      </div>
      <div className="mt-8 flex flex-col gap-6 sm:mt-10 sm:gap-8">
        {BRANCHES.map((b) => (
          <Reveal
            key={b.id}
            as="article"
            className="border-gold flex flex-col items-center rounded-lg border-2 bg-[linear-gradient(155deg,var(--color-forest),color-mix(in_srgb,var(--color-clay)_30%,var(--color-forest)))] px-6 py-10 sm:px-10 sm:py-12"
          >
            <img
              src={logoLight}
              alt=""
              width={900}
              height={778}
              loading="lazy"
              className="border-gold/40 bg-forest-deep h-20 w-20 rounded-full border object-contain p-3 sm:h-24 sm:w-24"
            />
            <h3 className="font-display mt-6 text-center text-xl sm:text-2xl">
              RaiThai Massage &amp; SPA — {t(b.labelKey)}
            </h3>

            <a
              href={instagramLinkFor(b)}
              target="_blank"
              rel="noopener noreferrer"
              className="border-gold hover:bg-gold/10 text-cream mt-6 flex w-full max-w-md items-center justify-between rounded-full border px-6 py-3.5 text-sm transition-colors sm:text-base"
            >
              <span>@{b.instagram}</span>
              <Instagram className="text-gold h-5 w-5 shrink-0" aria-hidden="true" />
            </a>

            <div className="text-cream/70 mt-6 flex flex-col items-center gap-1.5 text-xs">
              <span>
                {t("branches.hours")}: {b.hours}
              </span>
              <span>{b.address}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16.02 3C9.4 3 4 8.37 4 14.98c0 2.2.6 4.28 1.66 6.08L4 29l8.16-2.14a11.9 11.9 0 0 0 3.86.64h.01c6.62 0 12.02-5.37 12.02-11.98C28.05 8.37 22.65 3 16.02 3Zm0 21.9h-.01a9.9 9.9 0 0 1-5.06-1.39l-.36-.21-4.85 1.27 1.3-4.72-.24-.38a9.86 9.86 0 0 1-1.52-5.29c0-5.46 4.46-9.9 9.94-9.9 2.65 0 5.15 1.03 7.02 2.9a9.83 9.83 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.92 9.91Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.91-2.2-.24-.57-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.47 1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}
