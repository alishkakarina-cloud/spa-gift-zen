import type { MotifName } from "@/components/Motif";
import type { Service } from "@/data/catalog";
import { services } from "@/data/catalog";
import { PROMOTIONS } from "@/data/promotions";
// Обложки категорий с официального меню RaiThai (raithai-spa.kamiqr.com) —
// это фото самой категории, а не какой-то одной услуги внутри неё, поэтому
// они лежат отдельно от src/assets/services и не участвуют в галерее услуг.
import travelCover from "@/assets/categories/travel.webp";
import pregnancyCover from "@/assets/categories/pregnancy.webp";
import promotionsCover from "@/assets/categories/promotions.webp";

/**
 * «Для беременных» — не отдельный набор услуг, а подборка уже существующих
 * позиций по флагу `pregnancySafe`, как на официальном меню RaiThai. Поэтому
 * идентификатор категории шире, чем `Service["group"]`.
 *
 * «Акции и специальные предложения» на референсе (raithai-spa.kamiqr.com) —
 * такая же по значимости категория верхнего уровня, как «Массажные
 * процедуры» или «SPA-программы», поэтому она тоже здесь, а не только в
 * отдельном блоке на главной. Но акция — не Service (нет цены/длительности,
 * её нельзя подарить), поэтому это не позиция каталога, а особый пункт со
 * своим рендером в ServiceCatalogBrowser.
 */
export type CatalogGroup = Service["group"] | "pregnancy" | "promotions";

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
    id: "promotions",
    motif: "waveCrown",
    labelKey: "cert.groupPromotions",
    imageFrom: null,
    coverImage: promotionsCover,
  },
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

export const serviceGroupCounts = () =>
  SERVICE_GROUPS.map((g) => ({
    ...g,
    count: g.id === "promotions" ? PROMOTIONS.length : servicesInGroup(g.id).length,
  }));
