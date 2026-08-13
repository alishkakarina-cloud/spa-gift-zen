import type { MotifName } from "@/components/Motif";
import type { Service } from "@/data/catalog";
import { services } from "@/data/catalog";

/**
 * Категории услуг в порядке показа — как в прайсе RaiThai
 * (raithai-spa.kamiqr.com). Общий источник для карусели категорий на
 * /catalog и внутри мастера оформления на /certificate, чтобы список,
 * мотивы и репрезентативные фото не расходились между страницами.
 */
export const SERVICE_GROUPS: ReadonlyArray<{
  id: Service["group"];
  motif: MotifName;
  labelKey: string;
  /** Услуга, фото которой представляет категорию в карусели. */
  imageFrom: string | null;
}> = [
  {
    id: "massage",
    motif: "paisleyDrop",
    labelKey: "cert.groupMassage",
    imageFrom: "oil-absolute-calm-90",
  },
  {
    id: "complex",
    motif: "waveCrown",
    labelKey: "cert.groupComplex",
    imageFrom: "complex-energy-90",
  },
  { id: "spa", motif: "offeringBowl", labelKey: "cert.groupSpa", imageFrom: "reload" },
  {
    id: "travel",
    motif: "templeArch",
    labelKey: "cert.groupTravel",
    imageFrom: "journey-bali-1",
  },
  // Детскую линию ещё не снимали — карточка идёт с фирменным мотивом.
  { id: "kids", motif: "flowerBurst", labelKey: "cert.groupKids", imageFrom: null },
];

export const serviceGroupCounts = () =>
  SERVICE_GROUPS.map((g) => ({
    ...g,
    count: services.filter((s) => s.group === g.id).length,
  }));
