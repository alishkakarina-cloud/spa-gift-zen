import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-spa.jpg";
import ritualImg from "@/assets/ritual.jpg";

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
          src={heroImg}
          alt="Интерьер тайского SPA-салона Rai Thai Spa"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.18_0.03_155/0.75),oklch(0.18_0.03_155/0.55)_45%,oklch(0.2_0.035_155/0.95))]" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="font-display text-3xl tracking-[0.3em] text-gold uppercase">
            Rai Thai
          </p>
          <p className="mt-1 text-[0.65rem] tracking-[0.5em] text-cream/70 uppercase">
            Spa · Thailand
          </p>
          <div className="gold-rule mt-8 w-24" />
          <h1 className="mt-8 font-display text-4xl leading-[1.1] sm:text-6xl">
            Подарите тишину,
            <br />
            тепло и настоящий Таиланд
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-cream/75">
            Электронный подарочный сертификат Rai Thai Spa — на любую услугу или на
            сумму. Оформите онлайн за пару минут: сертификат придёт получателю сразу
            после оплаты.
          </p>
          <Link
            to="/certificate"
            className="mt-10 inline-flex items-center gap-3 border border-gold bg-gold px-9 py-4 text-[0.7rem] tracking-[0.28em] text-primary-foreground uppercase transition-colors hover:bg-transparent hover:text-gold"
          >
            Выбрать сертификат
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow">О салоне</p>
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
            src={ritualImg}
            alt="Тайский ритуал с ароматическим маслом"
            width={1280}
            height={1600}
            loading="lazy"
            className="h-[520px] w-full rounded-sm object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center">
          <p className="eyebrow">Сертификат</p>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl">
            Два варианта подарка
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/70">
            Сертификат на конкретную услугу — массаж или SPA-программу. Либо
            сертификат на сумму от 20 000 ₸, которую получатель потратит на что
            захочет.
          </p>
          <Link
            to="/certificate"
            className="mt-9 inline-flex items-center border border-gold px-9 py-4 text-[0.7rem] tracking-[0.28em] text-gold uppercase transition-colors hover:bg-gold hover:text-primary-foreground"
          >
            Оформить за 2 минуты
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-14 text-xs text-cream/50">
        <div className="flex flex-wrap justify-between gap-4">
          <span>Rai Thai Spa · Петропавловск · Кокшетау</span>
          <span>Ежедневно 10:00 — 22:00</span>
        </div>
      </footer>
    </main>
  );
}
