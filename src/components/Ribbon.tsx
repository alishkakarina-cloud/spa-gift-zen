type Props = {
  text?: string;
  side?: "left" | "right";
};

/**
 * Diagonal corner ribbon, gift-wrap style — fitting for a gift certificate site.
 * Parent element must have `relative` and `overflow-hidden`.
 */
export function Ribbon({ text = "RAI THAI", side = "right" }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute top-[18px] ${side === "right" ? "right-[-42px] rotate-45" : "left-[-42px] -rotate-45"} z-10 w-[170px] bg-gold py-[7px] text-center shadow-[0_2px_10px_rgba(0,0,0,0.35)]`}
    >
      <span className="text-[0.65rem] font-medium tracking-[0.3em] text-forest-deep uppercase">
        {text}
      </span>
    </div>
  );
}
