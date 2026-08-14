/** Два филиала RaiThai — единственный источник правды по городам. */
export type Branch = "petropavlovsk" | "kokshetau";

export type BranchInfo = {
  id: Branch;
  labelKey: string;
  /** Адрес салона без города — город берётся из подписи филиала. */
  address: string;
  instagram: string;
  whatsapp: string;
  hours: string;
  /** Поисковый запрос для 2ГИС: город + адрес. */
  mapQuery: string;
};

export const BRANCHES: ReadonlyArray<BranchInfo> = [
  {
    id: "petropavlovsk",
    labelKey: "whatsapp.petropavlovsk",
    address: "ул. Жабаева, 180В",
    instagram: "raithai_petropalv",
    whatsapp: "https://wa.me/77005458008",
    hours: "11:00–23:00",
    mapQuery: "Петропавловск, ул. Жабаева, 180В",
  },
  {
    id: "kokshetau",
    labelKey: "whatsapp.kokshetau",
    address: "ул. Сагдиева, 44",
    instagram: "raithai_kokshetau",
    whatsapp: "https://wa.me/77478018008",
    hours: "11:00–23:00",
    mapQuery: "Кокшетау, ул. Сагдиева, 44",
  },
];

export const mapLinkFor = (branch: BranchInfo) =>
  `https://2gis.kz/search/${encodeURIComponent(branch.mapQuery)}`;

export const instagramLinkFor = (branch: BranchInfo) =>
  `https://instagram.com/${branch.instagram}`;

/**
 * PDF со SPA-меню по филиалам.
 *
 * Сейчас у салонов один общий файл, поэтому оба города ведут на него. Когда
 * появятся отдельные меню для Петропавловска и Кокшетау — достаточно положить
 * их в `public/menu/` и поменять пути здесь, логика кнопки не меняется.
 */
export const SPA_MENU_PDF: Record<Branch, string> = {
  petropavlovsk: "/menu/spa-menu.pdf",
  kokshetau: "/menu/spa-menu.pdf",
};

/** Меню для случая, когда город ещё не выбран. */
export const DEFAULT_SPA_MENU_PDF = "/menu/spa-menu.pdf";

export const spaMenuPdfFor = (branch?: Branch | null) =>
  branch ? SPA_MENU_PDF[branch] : DEFAULT_SPA_MENU_PDF;
