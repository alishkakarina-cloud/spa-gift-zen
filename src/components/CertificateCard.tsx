import type { CertificateDesign, CertificateTexture } from "@/data/catalog";
import { Motif } from "@/components/Motif";
import logoLight from "@/assets/logo-light.png";
import logoGold from "@/assets/logo-gold.png";
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
  recipient?: string | undefined;
  sender?: string | undefined;
  message?: string | undefined;
  number?: string | undefined;
  compact?: boolean | undefined;
};

export function CertificateCard({
  design,
  valueLabel,
  recipient,
  sender,
  message,
  number,
  compact = false,
}: Props) {
  const logo = design.logo === "gold" ? logoGold : logoLight;

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
        style={{ color: design.ink, opacity: 0.08 }}
      />

      <div
        className={`relative flex flex-col ${compact ? "gap-2 px-7 py-7" : "gap-5 px-9 py-10 sm:px-12 sm:py-12"}`}
      >
        <div className="flex items-start justify-between">
          <img
            src={logo}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            loading="lazy"
            className={compact ? "h-12 w-auto" : "h-20 w-auto"}
          />
          <Motif
            name={design.motif}
            className={compact ? "h-5 w-5" : "h-8 w-8"}
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
            {design.caption}
          </p>
          <p
            className={`mt-3 font-display leading-[1.1] ${compact ? "text-2xl" : "text-4xl sm:text-5xl"}`}
          >
            {valueLabel}
          </p>
        </div>

        {(recipient || sender) && (
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs opacity-90">
            {recipient && <span>Кому: {recipient}</span>}
            {sender && <span>От: {sender}</span>}
          </div>
        )}

        {message && !compact && (
          <p className="max-w-md font-display text-lg leading-snug italic opacity-95">
            «{message}»
          </p>
        )}

        <div className="mt-2 flex items-end justify-between text-[0.56rem] tracking-[0.24em] uppercase opacity-90">
          <span className="whitespace-nowrap">Петропавловск · Кокшетау</span>
          <span className="text-right">{number ? `№ ${number}` : "Действителен 12 месяцев"}</span>
        </div>
      </div>
    </div>
  );
}
