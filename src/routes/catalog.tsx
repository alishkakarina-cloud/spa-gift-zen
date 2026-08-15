import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /catalog упразднён как отдельная страница — витрина услуг переехала на
 * главную якорной секцией #services (по структуре layan.kz, где весь прайс
 * живёт прямо на главной). Маршрут оставлен редиректом, чтобы старые ссылки
 * и закладки на /catalog не превращались в 404.
 */
export const Route = createFileRoute("/catalog")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "services" });
  },
});
