import { createFileRoute, Link } from "@tanstack/react-router";
import heroPhoto from "@/assets/atmosphere-arch.jpg";
import interiorImg from "@/assets/interior-candles.jpg";
import redNookImg from "@/assets/atmosphere-red.jpg";
import teaImg from "@/assets/detail-tea.jpg";
import logoLight from "@/assets/logo-light.png";
import { Motif } from "@/components/Motif";
import { Divider } from "@/components/Divider";
import { Ribbon } from "@/components/Ribbon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rai Thai Spa — подарочные сертификаты онлайн" },
      {
        name: "description",
        content:
          "Электронные подарочные сертификаты Rai Thai Spa: тайский массаж и SPA-программы. Оформление за 2 минуты, сертификат приходит сразу после оплаты.",
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

function Index() {
  const { t } = useLanguage();
  const points = [
    { title: t("home.point2Title"), desc: t("home.point2Desc") },
    { title: t("home.point3Title"), desc: t("home.point3Desc") },
    { title: t("home.point4Title"), desc: t("home.point4Desc") },
  ];

  return (
    <main>
      <section className="relative min-h-[92vh] overflow-hidden">
        <Ribbon side="left" />
        <LanguageSwitcher className="absolute top-5 right-5 z-20 sm:top-6 sm:right-6" />
        <img
          src={heroPhoto}
          alt="Интерьер RaiThai Massage & Spa — тёмно-зелёные стены, авторская картина, полосатый ковёр"
          width={1080}
          height={1350}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,13,0.88),rgba(8,18,13,0.72)_45%,rgba(14,28,21,0.97))]" />
        <Motif
          name="lotusCrown"
          className="pointer-events-none absolute -top-10 -right-16 h-56 w-56 text-gold sm:-top-20 sm:-right-28 sm:h-[32rem] sm:w-[32rem] lg:h-[42rem] lg:w-[42rem]"
          style={{ opacity: 0.22 }}
        />
        <Motif
          name="palmFrond"
          className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 text-gold-soft sm:-bottom-24 sm:-left-20 sm:h-80 sm:w-80 lg:h-[28rem] lg:w-[28rem]"
          style={{ opacity: 0.2 }}
        />
        <div className="relative mx-auto flex min-h-[92vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center sm:px-6">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            className="w-40 sm:w-52 lg:w-64"
          />
          <Divider motif="waveCrown" className="mt-7 sm:mt-10" />
          <h1 className="mt-7 font-display text-[1.9rem] leading-[1.15] sm:mt-9 sm:text-4xl lg:text-6xl">
            {t("home.heroTitle1")}
            <br />
            {t("home.heroTitle2")}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/70 sm:mt-6">
            {t("home.heroSubtitle")}
          </p>
          <Link to="/certificate" className="btn-gold mt-9 sm:mt-11">
            {t("home.heroCta")}
          </Link>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-12 sm:pt-16 lg:pt-20" />
        <Motif
          name="diamondLattice"
          className="pointer-events-none absolute -top-6 -left-14 h-52 w-52 text-sage sm:-top-10 sm:-left-24 sm:h-72 sm:w-72 lg:h-[26rem] lg:w-[26rem]"
          style={{ opacity: 0.16 }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24 lg:pb-32">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <Motif name="waterLines" className="h-6 w-8 text-gold sm:h-7 sm:w-9" />
                <p className="eyebrow">{t("home.aboutEyebrow")}</p>
              </div>
              <h2 className="mt-4 font-display text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
                {t("home.aboutTitle")}
              </h2>
              <div className="mt-8 grid gap-8 sm:mt-12 sm:grid-cols-2 sm:gap-10">
                {points.map((p) => (
                  <div key={p.title}>
                    <p className="font-display text-lg text-gold sm:text-xl">{p.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-cream/70">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src={interiorImg}
                alt="Тёмно-зелёные панели, свечи и терраццо в интерьере RaiThai"
                width={1280}
                height={1600}
                loading="lazy"
                className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[560px]"
              />
              <img
                src={redNookImg}
                alt="Атмосферная деталь интерьера RaiThai — тёплый свет в нише"
                width={1080}
                height={1350}
                loading="lazy"
                className="ring-background absolute -bottom-8 -left-6 hidden h-36 w-28 object-cover shadow-2xl ring-4 sm:-bottom-10 sm:-left-10 sm:block sm:h-52 sm:w-44 sm:ring-[6px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <Divider motif="paisleyDrop" className="pt-12 sm:pt-16 lg:pt-20" />
        <Motif
          name="templeArch"
          className="pointer-events-none absolute -right-14 -bottom-10 h-56 w-56 text-gold sm:-right-24 sm:-bottom-16 sm:h-72 sm:w-72 lg:h-[26rem] lg:w-[26rem]"
          style={{ opacity: 0.15 }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pt-10 pb-16 sm:gap-12 sm:px-6 sm:pt-12 sm:pb-24 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-16 lg:pb-32">
          <img
            src={teaImg}
            alt="Чайная церемония — часть тайской философии RaiThai"
            width={1280}
            height={1600}
            loading="lazy"
            className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[560px]"
          />
          <div>
            <div className="flex items-center gap-3">
              <Motif name="offeringBowl" className="h-8 w-6 text-gold sm:h-9 sm:w-7" />
              <p className="eyebrow">{t("home.ritualEyebrow")}</p>
            </div>
            <h2 className="mt-4 font-display text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
              {t("home.ritualTitle")}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-cream/70 sm:mt-5">
              {t("home.ritualText")}
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <Divider motif="flowerBurst" className="pt-12 sm:pt-16 lg:pt-20" />
        <Motif
          name="lotusBloom"
          className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 text-gold sm:h-96 sm:w-96 lg:h-[36rem] lg:w-[36rem]"
          style={{ opacity: 0.2 }}
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 pt-10 pb-16 text-center sm:px-6 sm:pt-14 sm:pb-24 lg:pb-28">
          <div className="flex items-center gap-3">
            <Motif name="lotusBloom" className="h-7 w-7 text-gold sm:h-9 sm:w-9" />
            <p className="eyebrow">{t("home.ctaEyebrow")}</p>
          </div>
          <h2 className="mt-4 font-display text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-cream/70">
            {t("home.ctaText")}
          </p>
          <Link to="/certificate" className="btn-ghost mt-8 sm:mt-9">
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>

      <footer className="relative overflow-hidden">
        <Motif
          name="dottedWave"
          className="pointer-events-none absolute top-0 left-1/2 h-24 w-40 -translate-x-1/2 text-gold sm:h-40 sm:w-64"
          style={{ opacity: 0.12 }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-5 py-10 text-center text-xs text-cream/50 sm:py-16">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            loading="lazy"
            className="h-12 w-auto opacity-70 sm:h-14"
          />
        </div>
      </footer>
    </main>
  );
}
