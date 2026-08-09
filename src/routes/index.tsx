import { createFileRoute, Link } from "@tanstack/react-router";
import heroTexture from "@/assets/texture-green.jpg";
import interiorImg from "@/assets/interior-candles.jpg";
import teaImg from "@/assets/detail-tea.jpg";
import logoLight from "@/assets/logo-light.png";
import { Motif } from "@/components/Motif";
import { Divider } from "@/components/Divider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rai Thai Spa — подарочные сертификаты онлайн" },
      {
        name: "description",
        content:
          "Электронные подарочные сертификаты Rai Thai Spa: тайский массаж и SPA-программы в Петропавловске и Кокшетау. Оформление за 2 минуты, сертификат приходит сразу после оплаты.",
      },
      { property: "og:title", content: "Rai Thai Spa — подарочные сертификаты онлайн" },
      {
        property: "og:description",
        content:
          "Подарите настоящее тайское SPA. Сертификат на услугу или на сумму — оформление за 2 минуты.",
      },
    ],
  }),
  component: Index,
});

const points = [
  { t: "Сеть тайских SPA", d: "Салоны в Петропавловске и Кокшетау, ежедневно с 10:00 до 22:00." },
  { t: "Мастера из Таиланда", d: "Настоящие тайские техники в исполнении сертифицированных мастеров." },
  { t: "Массаж и SPA-программы", d: "От Oil-массажа до фирменных ритуалов «Королева» и «Король Таиланда»." },
  { t: "Сертификат за 2 минуты", d: "Онлайн-оплата, автоматическая выдача и отправка получателю." },
];

function Index() {
  return (
    <main>
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={heroTexture}
          alt="Текстура тёмно-зелёной стены интерьера RaiThai Massage & Spa"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,22,16,0.82),rgba(10,22,16,0.6)_45%,rgba(18,36,27,0.96))]" />
        <Motif
          name="lotusCrown"
          className="pointer-events-none absolute -top-16 -right-24 h-[26rem] w-[26rem] text-gold sm:h-[34rem] sm:w-[34rem]"
          style={{ opacity: 0.06 }}
        />
        <Motif
          name="palmFrond"
          className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 text-cream sm:h-96 sm:w-96"
          style={{ opacity: 0.05 }}
        />
        <div className="relative mx-auto flex min-h-[92vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            className="w-52 sm:w-64"
          />
          <Divider motif="waveCrown" className="mt-10" />
          <h1 className="mt-9 font-display text-4xl leading-[1.12] sm:text-6xl">
            Подарите тишину,
            <br />
            тепло и настоящий Таиланд
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/70">
            Электронный подарочный сертификат Rai Thai Spa — на любую услугу или на
            сумму. Оформите онлайн за пару минут: сертификат придёт получателю сразу
            после оплаты.
          </p>
          <Link to="/certificate" className="btn-gold mt-11">
            Выбрать сертификат
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Motif name="waterLines" className="h-5 w-6 text-gold" />
              <p className="eyebrow">О салоне</p>
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl">
              Аутентичное тайское SPA рядом с домом
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {points.map((p) => (
                <div key={p.t}>
                  <p className="font-display text-xl text-gold">{p.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
          <img
            src={interiorImg}
            alt="Тёмно-зелёные панели, свечи и терраццо в интерьере RaiThai"
            width={1280}
            height={1600}
            loading="lazy"
            className="h-[540px] w-full object-cover"
          />
        </div>
      </section>

      <section>
        <Divider motif="paisleyDrop" className="pt-16" />
        <div className="mx-auto grid max-w-6xl gap-14 px-6 pt-10 pb-24 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <img
            src={teaImg}
            alt="Чайная церемония — часть тайской философии RaiThai"
            width={1280}
            height={1600}
            loading="lazy"
            className="h-[520px] w-full object-cover"
          />
          <div>
            <div className="flex items-center gap-3">
              <Motif name="offeringBowl" className="h-6 w-5 text-gold" />
              <p className="eyebrow">Ритуал</p>
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl">
              Место, где начинается любовь к себе
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-cream/70">
              Тёплое масло, свечи, тишина и чайная церемония. Мы работаем с деталями:
              температурой, ароматом, ритмом дыхания — чтобы время в RaiThai
              замирало.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <Divider motif="flowerBurst" className="pt-16" />
        <Motif
          name="lotusBloom"
          className="pointer-events-none absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-gold"
          style={{ opacity: 0.05 }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pt-10 pb-20 text-center">
          <div className="flex items-center gap-3">
            <Motif name="lotusBloom" className="h-6 w-6 text-gold" />
            <p className="eyebrow">Сертификат</p>
          </div>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl">
            Два варианта подарка
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/70">
            Сертификат на конкретную услугу — массаж или SPA-программу. Либо
            сертификат на сумму от 20 000 ₸, которую получатель потратит на что
            захочет.
          </p>
          <Link to="/certificate" className="btn-ghost mt-9">
            Оформить за 2 минуты
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-14 text-xs text-cream/50">
        <img
          src={logoLight}
          alt="RaiThai Massage & Spa"
          width={700}
          height={560}
          loading="lazy"
          className="h-14 w-auto opacity-70"
        />
        <span>Петропавловск · Кокшетау</span>
        <span>Ежедневно 10:00 — 22:00</span>
      </footer>
    </main>
  );
}
