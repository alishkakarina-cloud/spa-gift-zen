import type { CertificateDesign } from "@/data/catalog";

type Props = {
  design: CertificateDesign;
  valueLabel: string;
  recipient?: string;
  sender?: string;
  message?: string;
  number?: string;
  compact?: boolean;
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
  return (
    <div
      className="relative overflow-hidden rounded-sm"
      style={{
        backgroundImage: `linear-gradient(140deg, ${design.from}, ${design.to})`,
        color: design.ink,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.18), transparent 55%)",
        }}
      />
      <div
        className="absolute inset-[10px] rounded-sm border"
        style={{ borderColor: "currentColor", opacity: 0.35 }}
      />
      <div
        className={`relative flex flex-col ${compact ? "gap-2 p-6" : "gap-4 p-8 sm:p-10"}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[0.6rem] tracking-[0.4em] uppercase opacity-80">
            Rai Thai Spa
          </span>
          <span className={compact ? "text-base" : "text-xl"}>{design.motif}</span>
        </div>

        <div className={compact ? "py-1" : "py-4"}>
          <p className="text-[0.6rem] tracking-[0.32em] uppercase opacity-70">
            {design.caption}
          </p>
          <p
            className={`mt-2 font-display leading-tight ${compact ? "text-2xl" : "text-4xl sm:text-5xl"}`}
          >
            {valueLabel}
          </p>
        </div>

        {(recipient || sender) && (
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs opacity-85">
            {recipient && <span>Кому: {recipient}</span>}
            {sender && <span>От: {sender}</span>}
          </div>
        )}

        {message && !compact && (
          <p className="max-w-md font-display text-lg leading-snug italic opacity-90">
            «{message}»
          </p>
        )}

        <div className="mt-2 flex items-end justify-between text-[0.6rem] tracking-[0.2em] uppercase opacity-70">
          <span>Петропавловск · Кокшетау</span>
          <span>{number ? `№ ${number}` : "Действителен 12 месяцев"}</span>
        </div>
      </div>
    </div>
  );
}
