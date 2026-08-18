/** Рабочая почта компании (не филиала) — подтверждена владельцем 2026-08-18. */
export const COMPANY_EMAIL = "raithai2024@gmail.com";

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
 * PDF со SPA-меню.
 *
 * Ссылка ведёт не напрямую на статический файл, а на серверный редирект
 * (см. src/routes/api/menu-pdf.ts): он отдаёт файл, загруженный админом в
 * /admin/menu, если он есть, иначе — тот же статический
 * /menu/spa-menu.pdf, что и раньше. Так администратор может заменить меню
 * без участия разработчика и без релиза, а если он этого не делал —
 * поведение кнопки не отличается от прежнего.
 */
export const spaMenuPdfFor = (branch?: Branch | null) =>
  `/api/menu-pdf${branch ? `?branch=${branch}` : ""}`;
