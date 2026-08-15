import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const STATIC_FALLBACK = "/menu/spa-menu.pdf";

/**
 * Публичный редирект на актуальный файл SPA-меню. Пока админ ни разу не
 * загружал новый файл через /admin/menu — ведёт на тот же статический PDF,
 * что был всегда. После загрузки — на файл в Supabase Storage.
 *
 * Сделано отдельным редиректом (а не прямой ссылкой на файл в разметке),
 * чтобы замена PDF не требовала правки src/data/branches.ts или релиза.
 */
export const Route = createFileRoute("/api/menu-pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const supabase = getSupabaseServerClient();
          const { data } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "spa_menu_pdf_url")
            .maybeSingle();
          if (data?.value) {
            return Response.redirect(data.value, 302);
          }
        } catch (err) {
          // Supabase не настроен или недоступен — не роняем скачивание меню
          // из-за этого, просто отдаём статический файл как раньше.
          console.error("menu-pdf: falling back to static file:", err);
        }
        return Response.redirect(new URL(STATIC_FALLBACK, request.url), 302);
      },
    },
  },
});
