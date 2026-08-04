export type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  group: "massage" | "spa";
};

export const services: Service[] = [
  {
    id: "oil-absolute-calm",
    name: "Oil-массаж «Абсолютный покой»",
    duration: "60 мин",
    price: 18000,
    description:
      "Плавная обволакивающая техника с тёплыми натуральными маслами. Снимает хронический стресс и тревожность.",
    group: "massage",
  },
  {
    id: "traditional-thai",
    name: "Традиционный тайский массаж",
    duration: "60 мин",
    price: 18000,
    description:
      "Без масла, в хлопковой пижаме. Элементы пассивной йоги, глубокие нажатия и скрутки — глубокое восстановление тела.",
    group: "massage",
  },
  {
    id: "lomi-lomi",
    name: "Гавайский массаж «Ломи-Ломи»",
    duration: "60 мин",
    price: 18000,
    description:
      "Плавные глубокие движения предплечьями и локтями. Эффективно снимает мышечное напряжение.",
    group: "massage",
  },
  {
    id: "hot-stones",
    name: "Магическая сила камней",
    duration: "60 мин",
    price: 20000,
    description:
      "Массаж горячими вулканическими камнями — глубокое прогревание и полное расслабление.",
    group: "massage",
  },
  {
    id: "foot-massage",
    name: "Тайский массаж ног",
    duration: "40 мин",
    price: 12000,
    description:
      "Работа с рефлекторными зонами стоп: лёгкость в ногах и прилив энергии.",
    group: "massage",
  },
  {
    id: "neck-zone",
    name: "Массаж шейно-воротниковой зоны",
    duration: "40 мин",
    price: 12000,
    description: "Точечная работа с зоной напряжения от сидячей работы.",
    group: "massage",
  },
  {
    id: "reboot",
    name: "SPA-программа «Перезагрузка»",
    duration: "120 мин",
    price: 42500,
    description:
      "Хамам с аромотерапией, пилинг кесе, скрабирование, мытьё головы, чайная церемония и Oil-массаж 60 минут.",
    group: "spa",
  },
  {
    id: "queen-of-thailand",
    name: "SPA-ритуал «Королева Таиланда»",
    duration: "160 мин",
    price: 48000,
    description:
      "Женский ритуал: хамам, пилинг, скраб, массаж лица, массаж на выбор 60 минут и тайский массаж ног.",
    group: "spa",
  },
  {
    id: "king-of-thailand",
    name: "SPA-ритуал «Король Таиланда»",
    duration: "160 мин",
    price: 48000,
    description:
      "Мужская программа восстановления: хамам, пилинг, скраб, Ломи-Ломи или тайский массаж 60 минут и работа с ногами или ШВЗ.",
    group: "spa",
  },
];

export const fixedAmounts = [20000, 30000, 50000, 75000, 100000];
export const MIN_AMOUNT = 20000;

export type CertificateDesign = {
  id: string;
  title: string;
  caption: string;
  motif: string;
  from: string;
  to: string;
  ink: string;
};

export const designs: CertificateDesign[] = [
  {
    id: "universal",
    title: "Универсальный",
    caption: "Подарочный сертификат",
    motif: "❈",
    from: "oklch(0.26 0.04 155)",
    to: "oklch(0.34 0.05 158)",
    ink: "var(--color-gold)",
  },
  {
    id: "birthday",
    title: "День рождения",
    caption: "С днём рождения",
    motif: "✦",
    from: "oklch(0.28 0.05 150)",
    to: "oklch(0.42 0.07 120)",
    ink: "var(--color-gold-soft)",
  },
  {
    id: "for-her",
    title: "Для неё",
    caption: "Для неё",
    motif: "❀",
    from: "oklch(0.34 0.05 30)",
    to: "oklch(0.5 0.06 25)",
    ink: "oklch(0.94 0.03 60)",
  },
  {
    id: "for-him",
    title: "Для него",
    caption: "Для него",
    motif: "◈",
    from: "oklch(0.2 0.02 200)",
    to: "oklch(0.3 0.03 190)",
    ink: "var(--color-gold)",
  },
  {
    id: "for-two",
    title: "Для двоих",
    caption: "SPA для двоих",
    motif: "❋",
    from: "oklch(0.26 0.04 165)",
    to: "oklch(0.38 0.05 100)",
    ink: "var(--color-gold-soft)",
  },
  {
    id: "romantic",
    title: "Романтический",
    caption: "С любовью",
    motif: "♥",
    from: "oklch(0.28 0.07 20)",
    to: "oklch(0.4 0.09 15)",
    ink: "oklch(0.93 0.04 60)",
  },
  {
    id: "new-year",
    title: "Новый год",
    caption: "С Новым годом",
    motif: "✧",
    from: "oklch(0.24 0.05 160)",
    to: "oklch(0.32 0.07 145)",
    ink: "var(--color-gold)",
  },
  {
    id: "8-march",
    title: "8 марта",
    caption: "С 8 марта",
    motif: "✿",
    from: "oklch(0.32 0.06 350)",
    to: "oklch(0.46 0.07 340)",
    ink: "oklch(0.95 0.03 70)",
  },
  {
    id: "14-feb",
    title: "14 февраля",
    caption: "С Днём святого Валентина",
    motif: "❥",
    from: "oklch(0.26 0.08 10)",
    to: "oklch(0.36 0.1 5)",
    ink: "oklch(0.94 0.04 60)",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-KZ").format(value) + " ₸";
