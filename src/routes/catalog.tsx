import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /catalog упразднён как отдельная страница — витрина услуг живёт якорной
 * секцией #services на /offers (главная "/" теперь отдельный hero-лендинг
 * без каталога, по референсу layan.kz). Маршрут оставлен редиректом, чтобы
 * старые ссылки и закладки на /catalog не превращались в 404.
 */
export const Route = createFileRoute("/catalog")({
  beforeLoad: () => {
    throw redirect({ to: "/offers", hash: "services" });
  },
});
