import { Motif, type MotifName } from "@/components/Motif";

type Props = {
  motif?: MotifName;
  className?: string;
};

/** Section divider — thin gold rule flanking a small brand motif. */
export function Divider({ motif = "dottedWave", className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-5 ${className}`} aria-hidden="true">
      <span className="gold-rule w-10 sm:w-16 lg:w-24" />
      <Motif name={motif} className="h-6 w-9 shrink-0 text-gold sm:h-8 sm:w-12" />
      <span className="gold-rule w-10 sm:w-16 lg:w-24" />
    </div>
  );
}
