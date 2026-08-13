import type { MotifName } from "@/components/Motif";

export type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
  description: string;
  group: "massage" | "complex" | "spa" | "travel" | "kids";
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

  // Позиции ниже добавлены по прайсу RaiThai Spa (raithai-spa.kamiqr.com).
  // Локальные массажи (ноги, спина/ШВЗ, лицо и голова) намеренно не включены.
  // Услуги с несколькими форматами вынесены отдельными позициями: покупатель
  // выбирает конкретную длительность или число персон и платит именно за неё.
  {
    id: "oil-absolute-calm-90",
    name: "Oil-массаж «Абсолютный покой», 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Плавная обволакивающая техника с тёплыми натуральными маслами. Снимает хронический стресс и тревожность.",
    group: "massage",
  },
  {
    id: "oil-absolute-calm-120",
    name: "Oil-массаж «Абсолютный покой», 120 минут",
    duration: "120 мин",
    price: 34500,
    description:
      "Плавная обволакивающая техника с тёплыми натуральными маслами. Снимает хронический стресс и тревожность.",
    group: "massage",
  },
  {
    id: "traditional-thai-90",
    name: "Традиционный тайский массаж, 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Без масла, в хлопковой пижаме. Элементы пассивной йоги, глубокие нажатия и скрутки — глубокое восстановление тела.",
    group: "massage",
  },
  {
    id: "traditional-thai-120",
    name: "Традиционный тайский массаж, 120 минут",
    duration: "120 мин",
    price: 34500,
    description:
      "Без масла, в хлопковой пижаме. Элементы пассивной йоги, глубокие нажатия и скрутки — глубокое восстановление тела.",
    group: "massage",
  },
  {
    id: "lomi-lomi-90",
    name: "Гавайский массаж «Ломи-Ломи», 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Плавные глубокие движения предплечьями и локтями. Эффективно снимает мышечное напряжение.",
    group: "massage",
  },
  {
    id: "lomi-lomi-120",
    name: "Гавайский массаж «Ломи-Ломи», 120 минут",
    duration: "120 мин",
    price: 34500,
    description:
      "Плавные глубокие движения предплечьями и локтями. Эффективно снимает мышечное напряжение.",
    group: "massage",
  },
  {
    id: "hot-stones-90",
    name: "Магическая сила камней, 90 минут",
    duration: "90 мин",
    price: 28500,
    description:
      "Глубокий прогрев мышц гладкими вулканическими камнями в сочетании с oil-массажем. Идеально для холодных дней.",
    group: "massage",
  },
  {
    id: "hot-stones-120",
    name: "Магическая сила камней, 120 минут",
    duration: "120 мин",
    price: 38500,
    description:
      "Глубокий прогрев мышц гладкими вулканическими камнями в сочетании с oil-массажем. Идеально для холодных дней.",
    group: "massage",
  },
  {
    id: "balinese-60",
    name: "Балийский массаж «Гармония энергии», 60 минут",
    duration: "60 мин",
    price: 18000,
    description: "Баланс между глубокой проработкой мышц и расслабляющим воздействием масел.",
    group: "massage",
  },
  {
    id: "balinese-90",
    name: "Балийский массаж «Гармония энергии», 90 минут",
    duration: "90 мин",
    price: 26500,
    description: "Баланс между глубокой проработкой мышц и расслабляющим воздействием масел.",
    group: "massage",
  },
  {
    id: "balinese-120",
    name: "Балийский массаж «Гармония энергии», 120 минут",
    duration: "120 мин",
    price: 34500,
    description: "Баланс между глубокой проработкой мышц и расслабляющим воздействием масел.",
    group: "massage",
  },
  {
    id: "anticellulite-60",
    name: "Антицеллюлитный массаж Slim, 60 минут",
    duration: "60 мин",
    price: 18500,
    description: "Интенсивная техника для улучшения лимфодренажа и подтяжки кожи.",
    group: "massage",
  },
  {
    id: "anticellulite-90",
    name: "Антицеллюлитный массаж Slim, 90 минут",
    duration: "90 мин",
    price: 25500,
    description: "Интенсивная техника для улучшения лимфодренажа и подтяжки кожи.",
    group: "massage",
  },
  {
    id: "herbal-pouch-60",
    name: "Массаж тела травяными мешочками, 60 минут",
    duration: "60 мин",
    price: 22500,
    description:
      "Горячие мешочки со сборами целебных тайских трав. Ароматерапия и глубокий прогрев снимают мышечное напряжение.",
    group: "massage",
  },
  {
    id: "herbal-pouch-90",
    name: "Массаж тела травяными мешочками, 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Горячие мешочки со сборами целебных тайских трав. Ароматерапия и глубокий прогрев снимают мышечное напряжение.",
    group: "massage",
  },
  {
    id: "herbal-pouch-120",
    name: "Массаж тела травяными мешочками, 120 минут",
    duration: "120 мин",
    price: 36500,
    description:
      "Горячие мешочки со сборами целебных тайских трав. Ароматерапия и глубокий прогрев снимают мышечное напряжение.",
    group: "massage",
  },
  {
    id: "mom-to-be-60",
    name: "Массаж для будущих мам, 60 минут",
    duration: "60 мин",
    price: 18000,
    description:
      "Бережная забота о будущей маме: снятие нагрузки с поясницы и ног, положение на боку со специальной подушкой.",
    group: "massage",
  },
  {
    id: "mom-to-be-90",
    name: "Массаж для будущих мам, 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Бережная забота о будущей маме: снятие нагрузки с поясницы и ног, положение на боку со специальной подушкой.",
    group: "massage",
  },
  {
    id: "paraffin-hands",
    name: "Парафинотерапия для рук",
    duration: "",
    price: 5000,
    description: "Тёплый парафиновый кокон для рук — глубокое питание кожи.",
    group: "massage",
  },

  {
    id: "complex-calm-harmony",
    name: "«Спокойствие и гармония»",
    duration: "90 мин",
    price: 28000,
    description:
      "Массаж спины и шейно-воротниковой зоны 45 минут и тайский массаж ног 45 минут. Идеальный баланс для тех, кто живёт в высоком ритме.",
    group: "complex",
  },
  {
    id: "complex-energy-90",
    name: "«Источник энергии», 90 минут",
    duration: "90 мин",
    price: 26500,
    description: "Oil-массаж 60 минут и тайский массаж ног 30 минут — снимает хроническую усталость.",
    group: "complex",
  },
  {
    id: "complex-energy-120",
    name: "«Источник энергии», 120 минут",
    duration: "120 мин",
    price: 34500,
    description: "Oil-массаж 60 минут и тайский массаж ног 60 минут — снимает хроническую усталость.",
    group: "complex",
  },
  {
    id: "complex-serenity",
    name: "«Покой и безмятежность»",
    duration: "120 мин",
    price: 36500,
    description:
      "Традиционный тайский массаж 60 минут и oil-массаж 60 минут. Снятие мышечных блоков и полный релакс.",
    group: "complex",
  },

  {
    id: "thai-bath-1",
    name: "Баня по-тайски, 1 персона",
    duration: "60 мин",
    price: 26000,
    description:
      "Хамам или сауна с ароматерапией, пилинг рукавичкой кесе, скрабирование, мытьё головы и чайная церемония.",
    group: "spa",
  },
  {
    id: "thai-bath-2",
    name: "Баня по-тайски, 2 персоны",
    duration: "60 мин",
    price: 52000,
    description:
      "Хамам или сауна с ароматерапией, пилинг рукавичкой кесе, скрабирование, мытьё головы и чайная церемония.",
    group: "spa",
  },
  {
    id: "thai-bath-3",
    name: "Баня по-тайски, 3 персоны",
    duration: "60 мин",
    price: 78000,
    description:
      "Хамам или сауна с ароматерапией, пилинг рукавичкой кесе, скрабирование, мытьё головы и чайная церемония.",
    group: "spa",
  },
  {
    id: "reload",
    name: "SPA-программа «Перезагрузка»",
    duration: "120 мин",
    price: 42500,
    description:
      "Самая популярная программа Rai Thai: хамам, пилинг, скрабирование, мытьё головы, чайная церемония и расслабляющий oil-массаж 60 минут.",
    group: "spa",
  },
  {
    id: "date-raithai",
    name: "«Свидание в Райтай», 2 персоны",
    duration: "120 мин",
    price: 83000,
    description:
      "Романтическая программа для двоих: хамам, пилинг, скрабирование, пенное омовение, чайная церемония и арома-oil массаж.",
    group: "spa",
  },
  {
    id: "paradise-recovery-1",
    name: "«Райское восстановление», 1 персона",
    duration: "150 мин",
    price: 46500,
    description:
      "Хамам, пилинг кесе, скрабирование, бережное очищение, пенный массаж, мытьё головы, чайная церемония и oil-массаж 60 минут.",
    group: "spa",
  },
  {
    id: "paradise-recovery-2",
    name: "«Райское восстановление», 2 персоны",
    duration: "150 мин",
    price: 93000,
    description:
      "Хамам, пилинг кесе, скрабирование, бережное очищение, пенный массаж, мытьё головы, чайная церемония и oil-массаж 60 минут.",
    group: "spa",
  },
  {
    id: "paradise-recovery-3",
    name: "«Райское восстановление», 3 персоны",
    duration: "150 мин",
    price: 139500,
    description:
      "Хамам, пилинг кесе, скрабирование, бережное очищение, пенный массаж, мытьё головы, чайная церемония и oil-массаж 60 минут.",
    group: "spa",
  },
  {
    id: "mom-and-child",
    name: "«Мама и ребёнок», 2 персоны",
    duration: "90 мин",
    price: 56500,
    description:
      "Хамам, пилинг кесе, мытьё головы, oil-массаж 60 минут, маска для лица и чайная церемония на двоих.",
    group: "spa",
  },
  {
    id: "luxury-for-two",
    name: "«Роскошь для двоих», 2 персоны",
    duration: "180 мин",
    price: 107500,
    description:
      "Хамам, пилинг, скрабирование, шоколадное обёртывание, пенный массаж, арома-oil массаж и массаж лица. Бонус — романтическое оформление комнаты.",
    group: "spa",
  },
  {
    id: "hen-party",
    name: "«Девичник», 3 персоны",
    duration: "120 мин",
    price: 125500,
    description:
      "Хамам, пилинг кесе, скрабирование, мытьё головы, расслабляющий oil-массаж и чайная церемония. Бонус — маска для лица.",
    group: "spa",
  },

  {
    id: "journey-thailand-1",
    name: "«Путешествие в Таиланд», 1 персона",
    duration: "150 мин",
    price: 47500,
    description:
      "Хамам или сауна, пилинг, скрабирование, мытьё головы, чайная церемония и традиционный тайский массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-thailand-2",
    name: "«Путешествие в Таиланд», 2 персоны",
    duration: "150 мин",
    price: 93500,
    description:
      "Хамам или сауна, пилинг, скрабирование, мытьё головы, чайная церемония и традиционный тайский массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-bali-1",
    name: "«Путешествие на Бали», 1 персона",
    duration: "180 мин",
    price: 53000,
    description:
      "Хамам, пилинг, скрабирование, обёртывание тела, чайная церемония, массаж лица травяными мешочками и балийский массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-bali-2",
    name: "«Путешествие на Бали», 2 персоны",
    duration: "180 мин",
    price: 105000,
    description:
      "Хамам, пилинг, скрабирование, обёртывание тела, чайная церемония, массаж лица травяными мешочками и балийский массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-bali-3",
    name: "«Путешествие на Бали», 3 персоны",
    duration: "180 мин",
    price: 155000,
    description:
      "Хамам, пилинг, скрабирование, обёртывание тела, чайная церемония, массаж лица травяными мешочками и балийский массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-malaysia-1",
    name: "«Путешествие в Малайзию», 1 персона",
    duration: "240 мин",
    price: 62000,
    description:
      "Хамам, пилинг, скрабирование, обёртывание, чайная церемония, массаж лица травяными мешочками и арома-oil массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-malaysia-2",
    name: "«Путешествие в Малайзию», 2 персоны",
    duration: "240 мин",
    price: 122000,
    description:
      "Хамам, пилинг, скрабирование, обёртывание, чайная церемония, массаж лица травяными мешочками и арома-oil массаж 60 минут.",
    group: "travel",
  },
  {
    id: "journey-malaysia-3",
    name: "«Путешествие в Малайзию», 3 персоны",
    duration: "240 мин",
    price: 180000,
    description:
      "Хамам, пилинг, скрабирование, обёртывание, чайная церемония, массаж лица травяными мешочками и арома-oil массаж 60 минут.",
    group: "travel",
  },

  {
    id: "kids-thai-60",
    name: "Детский тайский массаж «Тайская сказка», 60 минут",
    duration: "60 мин",
    price: 18000,
    description:
      "Для детей от 5 лет. Мягкая пассивная гимнастика в хлопковой пижаме: снимает гипертонус и формирует осанку.",
    group: "kids",
  },
  {
    id: "kids-thai-90",
    name: "Детский тайский массаж «Тайская сказка», 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Для детей от 5 лет. Мягкая пассивная гимнастика в хлопковой пижаме: снимает гипертонус и формирует осанку.",
    group: "kids",
  },
  {
    id: "kids-oil-60",
    name: "Детский oil-массаж, 60 минут",
    duration: "60 мин",
    price: 18000,
    description:
      "Для детей от 5 лет. Плавные движения с тёплым маслом снимают тревожность и переутомление, дарят здоровый сон.",
    group: "kids",
  },
  {
    id: "kids-oil-90",
    name: "Детский oil-массаж, 90 минут",
    duration: "90 мин",
    price: 26500,
    description:
      "Для детей от 5 лет. Плавные движения с тёплым маслом снимают тревожность и переутомление, дарят здоровый сон.",
    group: "kids",
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
