import atmosphereHall from "@/assets/gallery/atmosphere-hall.webp";
import bambooMirror from "@/assets/gallery/bamboo-mirror.webp";
import buddhaNiche from "@/assets/gallery/buddha-niche.webp";
import lightCorridor from "@/assets/gallery/light-corridor.webp";
import loungeChair from "@/assets/gallery/lounge-chair.webp";
import redStairs from "@/assets/gallery/red-stairs.webp";
import stairsKokshetau from "@/assets/gallery/stairs-kokshetau.webp";
import stoneBasin from "@/assets/gallery/stone-basin.webp";

const SHOTS = [
  atmosphereHall,
  redStairs,
  loungeChair,
  lightCorridor,
  stairsKokshetau,
  buddhaNiche,
  stoneBasin,
  bambooMirror,
];

/**
 * Атмосферная лента интерьеров — самостоятельный блок над каталогом.
 * С услугами не связана: показывает сами салоны, поэтому кадры отобраны
 * без людей в кадре.
 */
export function AtmosphereGallery({ label }: { label: string }) {
  return (
    <section aria-label={label} className="min-w-0">
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:gap-4 sm:px-0">
        {SHOTS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            width={1280}
            height={800}
            loading={i < 2 ? "eager" : "lazy"}
            decoding="async"
            className="border-border h-40 w-[17rem] shrink-0 snap-start rounded-lg border object-cover sm:h-52 sm:w-[22rem]"
          />
        ))}
      </div>
    </section>
  );
}
