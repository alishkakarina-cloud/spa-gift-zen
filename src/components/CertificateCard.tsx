import type { CertificateDesign, CertificateTexture } from "@/data/catalog";
import { Motif } from "@/components/Motif";
import { Ribbon } from "@/components/Ribbon";
import { useLanguage } from "@/i18n/LanguageContext";
import logoLight from "@/assets/logo-on-dark.webp";
import logoGold from "@/assets/logo-on-light.webp";
import texEmerald from "@/assets/cert-emerald.jpg";
import texCream from "@/assets/cert-cream.jpg";
import texRose from "@/assets/cert-rose.jpg";
import texNoir from "@/assets/cert-noir.jpg";
import texTerracotta from "@/assets/cert-terracotta.jpg";

const textures: Record<CertificateTexture, string> = {
  emerald: texEmerald,
  cream: texCream,
  rose: texRose,
  noir: texNoir,
  terracotta: texTerracotta,
};

type Props = {
  design: CertificateDesign;
  valueLabel: string;
  /**
   * Состав сертификата: названия программ печатаются списком. Чем длиннее
   * список, тем мельче кегль — иначе четыре позиции не помещаются в бланк.
   * Пусто — печатается `valueLabel` (номинал сертификата на сумму).
   */
  items?: ReadonlyArray<string> | undefined;
  recipient?: string | undefined;
  sender?: string | undefined;
  message?: string | undefined;
  number?: string | undefined;
  /** Филиал, в котором действует сертификат. */
  branch?: string | undefined;
  /** Как записаться на процедуру — печатается на самом сертификате. */
  bookingNote?: string | undefined;
  compact?: boolean | undefined;
};

export function CertificateCard({
  design,
  valueLabel,
  items,
  recipient,
  sender,
  message,
  number,
  branch,
  bookingNote,
  compact = false,
}: Props) {
  const { t } = useLanguage();
  const logo = design.logo === "gold" ? logoGold : logoLight;
  const lines = items && items.length > 0 ? items : null;
  const count = lines?.length ?? 1;
  const titleSize = compact
    ? count > 3
      ? "text-sm"
      : count > 1
        ? "text-base"
        : "text-2xl"
    : count > 3
      ? "text-xl sm:text-2xl"
      : count > 1
        ? "text-2xl sm:text-3xl"
        : "text-4xl sm:text-5xl";

  return (
    <div
      className="relative overflow-hidden"
      style={{ color: design.ink, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)" }}
    >
      <img
        src={textures[design.texture]}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={1280}
        height={800}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: design.veil }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-[9px] border"
        style={{ borderColor: design.accent, opacity: 0.55 }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-[14px] border"
        style={{ borderColor: design.accent, opacity: 0.22 }}
        aria-hidden="true"
      />
      <Motif
        name={design.motif}
        className={`pointer-events-none absolute -bottom-8 -right-8 ${compact ? "h-32 w-32" : "h-56 w-56"}`}
        style={{ color: design.ink, opacity: 0.16 }}
      />
      {!compact && <Ribbon />}

      <div
        className={`relative flex flex-col ${compact ? "gap-2 px-7 py-7" : "gap-5 px-9 py-10 sm:px-12 sm:py-12"}`}
      >
        <div className="flex items-start justify-between">
          <img
            src={logo}
            alt="RaiThai Massage & Spa"
            width={900}
            height={778}
            loading="lazy"
            className={compact ? "h-12 w-auto" : "h-20 w-auto"}
          />
          <Motif
            name={design.motif}
            className={compact ? "h-6 w-6" : "h-10 w-10"}
            style={{ color: design.accent }}
          />
        </div>

        <div
          className="h-px w-full"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${design.accent}, transparent)`,
            opacity: 0.7,
          }}
          aria-hidden="true"
        />

        <div className={compact ? "py-1" : "py-3"}>
          <p
            className="text-[0.58rem] tracking-[0.36em] uppercase"
            style={{ color: design.accent }}
          >
            {t(`designs.${design.id}.caption`)}
          </p>
          {lines ? (
            <>
              <ul className={`font-display mt-3 flex flex-col ${compact ? "gap-0.5" : "gap-1"}`}>
                {lines.map((line) => (
                  <li key={line} className={`leading-[1.15] ${titleSize}`}>
                    {line}
                  </li>
                ))}
              </ul>
              {/* Итог рядом со списком — иначе по одним названиям не понять,
                  на какую сумму выдан сертификат. */}
              <p
                className={`mt-2 tracking-[0.2em] uppercase opacity-80 ${compact ? "text-[0.55rem]" : "text-xs"}`}
              >
                {valueLabel}
              </p>
            </>
          ) : (
            <p className={`font-display mt-3 leading-[1.1] ${titleSize}`}>{valueLabel}</p>
          )}
        </div>

        {(recipient || sender) && (
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs opacity-90">
            {recipient && (
              <span>
                {t("cert.cardTo")}: {recipient}
              </span>
            )}
            {sender && (
              <span>
                {t("cert.cardFrom")}: {sender}
              </span>
            )}
          </div>
        )}

        {message && !compact && (
          <p className="max-w-md font-display text-lg leading-snug italic opacity-95">
            «{message}»
          </p>
        )}

        {(branch || bookingNote) && !compact && (
          <div className="mt-1 flex flex-col gap-1 text-[0.62rem] leading-relaxed opacity-85">
            {branch && (
              <span>
                {t("cert.cardBranch")}: {branch}
              </span>
            )}
            {bookingNote && <span>{bookingNote}</span>}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-end justify-between gap-2 text-[0.56rem] tracking-[0.24em] uppercase">
          {/* Бессрочность — заметная пометка, а не мелкая сноска. */}
          <span
            className="rounded-full border px-3 py-1 font-medium"
            style={{ borderColor: design.accent, color: design.accent }}
          >
            {t("cert.cardValidity")}
          </span>
          {number && <span className="text-right opacity-90">№ {number}</span>}
        </div>
      </div>
    </div>
  );
}
