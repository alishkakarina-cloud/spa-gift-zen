import type { MotifName } from "@/components/Motif";

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

export type CertificateTexture =
  | "emerald"
  | "cream"
  | "rose"
  | "noir"
  | "terracotta";

export type CertificateDesign = {
  id: string;
  title: string;
  caption: string;
  motif: MotifName;
  texture: CertificateTexture;
  /** Цвет вуали поверх текстуры для читаемости */
  veil: string;
  /** Основной цвет текста и рамки */
  ink: string;
  /** Акцент — сумма, номинал */
  accent: string;
  /** Светлая или золотая версия логотипа */
  logo: "light" | "gold";
};

export const designs: CertificateDesign[] = [
  {
    id: "universal",
    title: "Универсальный",
    caption: "Подарочный сертификат",
    motif: "offeringBowl",
    texture: "emerald",
    veil: "linear-gradient(150deg, rgba(10,26,18,0.82), rgba(10,26,18,0.62))",
    ink: "#f4efe6",
    accent: "#bf9974",
    logo: "light",
  },
  {
    id: "birthday",
    title: "День рождения",
    caption: "С днём рождения",
    motif: "flowerBurst",
    texture: "cream",
    veil: "linear-gradient(150deg, rgba(244,239,230,0.72), rgba(216,183,149,0.5))",
    ink: "#22301f",
    accent: "#7f4925",
    logo: "gold",
  },
  {
    id: "for-her",
    title: "Для неё",
    caption: "Для неё",
    motif: "petalDiamond",
    texture: "rose",
    veil: "linear-gradient(150deg, rgba(60,26,26,0.5), rgba(120,60,52,0.42))",
    ink: "#fdf4ee",
    accent: "#f0d3b8",
    logo: "light",
  },
  {
    id: "for-him",
    title: "Для него",
    caption: "Для него",
    motif: "templeArch",
    texture: "noir",
    veil: "linear-gradient(150deg, rgba(8,14,11,0.7), rgba(8,14,11,0.5))",
    ink: "#f0ece2",
    accent: "#bf9974",
    logo: "gold",
  },
  {
    id: "for-two",
    title: "Для двоих",
    caption: "SPA для двоих",
    motif: "wingsBow",
    texture: "emerald",
    veil: "linear-gradient(150deg, rgba(18,36,27,0.62), rgba(120,128,89,0.42))",
    ink: "#f4efe6",
    accent: "#d8b795",
    logo: "light",
  },
  {
    id: "romantic",
    title: "Романтический",
    caption: "С любовью",
    motif: "paisleyDrop",
    texture: "terracotta",
    veil: "linear-gradient(150deg, rgba(40,10,8,0.74), rgba(70,20,14,0.56))",
    ink: "#fbeee4",
    accent: "#e2bb92",
    logo: "light",
  },
  {
    id: "new-year",
    title: "Новый год",
    caption: "С Новым годом",
    motif: "diamondLattice",
    texture: "emerald",
    veil: "linear-gradient(150deg, rgba(8,22,15,0.86), rgba(30,52,36,0.66))",
    ink: "#f4efe6",
    accent: "#bf9974",
    logo: "gold",
  },
  {
    id: "8-march",
    title: "8 марта",
    caption: "С 8 марта",
    motif: "lotusBloom",
    texture: "rose",
    veil: "linear-gradient(150deg, rgba(244,239,230,0.62), rgba(224,168,158,0.5))",
    ink: "#3a2320",
    accent: "#7f4925",
    logo: "gold",
  },
  {
    id: "14-feb",
    title: "14 февраля",
    caption: "С Днём святого Валентина",
    motif: "waveCrown",
    texture: "terracotta",
    veil: "linear-gradient(150deg, rgba(38,8,8,0.72), rgba(78,18,14,0.5))",
    ink: "#fbeee4",
    accent: "#d8b795",
    logo: "light",
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-KZ").format(value) + " ₸";
