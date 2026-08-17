import { createFileRoute } from "@tanstack/react-router";
import { OffersSection } from "@/components/OffersSection";

/**
 * /offers — тот же контент (город/сумма + каталог), что теперь физически
 * встроен и на главную "/" сразу под hero. Маршрут оставлен рабочим для
 * прямых ссылок (см. src/components/OffersSection.tsx — общий компонент,
 * не дублируем разметку в двух файлах).
 */
export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Услуги и сертификаты — Rai Thai Spa" },
      {
        name: "description",
        content:
          "Электронные подарочные сертификаты Rai Thai Spa: тайский массаж и SPA-программы. Оформление за 2 минуты, сертификат приходит сразу после оплаты.",
      },
      { property: "og:title", content: "Услуги и сертификаты — Rai Thai Spa" },
      {
        property: "og:description",
        content:
          "Подарите настоящее тайское SPA. Сертификат на услугу или на сумму — оформление за 2 минуты.",
      },
    ],
  }),
  component: Offers,
});

function Offers() {
  return (
    <main>
      <OffersSection />
    </main>
  );
}
