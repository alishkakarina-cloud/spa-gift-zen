import type { MotifName } from "@/components/Motif";
import type { Service } from "@/data/catalog";
import { groupServiceFamilies, services } from "@/data/catalog";
// Обложки категорий с официального меню RaiThai (raithai-spa.kamiqr.com) —
// это фото самой категории, а не какой-то одной услуги внутри неё, поэтому
// они лежат отдельно от src/assets/services и не участвуют в галерее услуг.
import travelCover from "@/assets/categories/travel.webp";
import pregnancyCover from "@/assets/categories/pregnancy.webp";

/**
 * «Для беременных» — не отдельный набор услуг, а подборка уже существующих
 * позиций по флагу `pregnancySafe`, как на официальном меню RaiThai. Поэтому
 * идентификатор категории шире, чем `Service["group"]`.
 */
export type CatalogGroup = Service["group"] | "pregnancy";

export const SERVICE_GROUPS: ReadonlyArray<{
  id: CatalogGroup;
  motif: MotifName;
  labelKey: string;
  /** Услуга, фото которой представляет категорию в карусели. */
  imageFrom: string | null;
  /** Собственная обложка категории — приоритетнее imageFrom (см. CategoryCarousel). */
  coverImage?: string;
  /** Примечание под заголовком категории (например, предупреждения врача). */
  noteKey?: string;
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
    coverImage: travelCover,
  },
  { id: "kids", motif: "flowerBurst", labelKey: "cert.groupKids", imageFrom: "kids-oil-60" },
  {
    id: "pregnancy",
    motif: "lotusBloom",
    labelKey: "cert.groupPregnancy",
    imageFrom: "mom-to-be-60",
    coverImage: pregnancyCover,
    noteKey: "cert.pregnancyNote",
  },
  {
    id: "subscription",
    motif: "diamondLattice",
    labelKey: "cert.groupSubscription",
    imageFrom: "subscription-wellness",
    noteKey: "cert.subscriptionNote",
  },
];

/** Услуги категории: обычные — по группе, «Для беременных» — по флагу. */
export const servicesInGroup = (group: CatalogGroup) =>
  group === "pregnancy"
    ? services.filter((s) => s.pregnancySafe)
    : services.filter((s) => s.group === group);

/**
 * Карточки категории, сгруппированные в семьи и готовые к отображению.
 * SPA-программы — по возрастанию цены (ТЗ); остальные категории сохраняют
 * порядок из данных.
 */
export const familiesInGroup = (group: CatalogGroup) => {
  const families = groupServiceFamilies(servicesInGroup(group));
  return group === "spa"
    ? [...families].sort((a, b) => a.variants[0]!.price - b.variants[0]!.price)
    : families;
};

/**
 * Счётчик на плитке категории — по карточкам, которые реально увидит
 * пользователь. Услуги с несколькими длительностями теперь одна карточка,
 * поэтому считаем сгруппированные семьи, а не плоские позиции в данных.
 */
export const serviceGroupCounts = () =>
  SERVICE_GROUPS.map((g) => ({
    ...g,
    count: groupServiceFamilies(servicesInGroup(g.id)).length,
  }));
