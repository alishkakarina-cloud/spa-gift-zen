/** Два филиала RaiThai — единственный источник правды по городам. */
export type Branch = "petropavlovsk" | "kokshetau";

export const BRANCHES: ReadonlyArray<{ id: Branch; labelKey: string }> = [
  { id: "petropavlovsk", labelKey: "whatsapp.petropavlovsk" },
  { id: "kokshetau", labelKey: "whatsapp.kokshetau" },
];

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
