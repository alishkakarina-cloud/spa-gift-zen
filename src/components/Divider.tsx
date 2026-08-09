import { Motif, type MotifName } from "@/components/Motif";

type Props = {
  motif?: MotifName;
  className?: string;
};

/** Section divider — thin gold rule flanking a small brand motif. */
export function Divider({ motif = "dottedWave", className = "" }: Props) {
  return (
    <div className={`flex items-center justify-center gap-5 ${className}`} aria-hidden="true">
      <span className="gold-rule w-16 sm:w-24" />
      <Motif name={motif} className="h-8 w-12 shrink-0 text-gold" />
      <span className="gold-rule w-16 sm:w-24" />
    </div>
  );
}
