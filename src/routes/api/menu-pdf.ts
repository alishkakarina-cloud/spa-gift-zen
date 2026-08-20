import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const STATIC_FALLBACK = "/menu/spa-menu.pdf";

/**
 * Публичный редирект на актуальный файл SPA-меню, теперь раздельно по
 * филиалам (`?branch=petropavlovsk|kokshetau`, Block 1.1 ТЗ — кнопки
 * «Скачать СПА-меню» по городам).
 *
 * Порядок поиска: файл, загруженный под конкретный филиал
 * (`spa_menu_pdf_url_{branch}`) → общий файл, загруженный до разделения по
 * городам (`spa_menu_pdf_url`) → статический /menu/spa-menu.pdf. Так ничего
 * не ломается, если админ ещё не загрузил файлы по отдельности — обе кнопки
 * просто ведут на то же меню, что и раньше.
 *
 * Сделано отдельным редиректом (а не прямой ссылкой на файл в разметке),
 * чтобы замена PDF не требовала правки src/data/branches.ts или релиза.
 */
export const Route = createFileRoute("/api/menu-pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const branch = new URL(request.url).searchParams.get("branch");
        try {
          const supabase = getSupabaseServerClient();
          const keys = branch ? [`spa_menu_pdf_url_${branch}`, "spa_menu_pdf_url"] : ["spa_menu_pdf_url"];
          const { data } = await supabase
            .from("site_settings")
            .select("key, value")
            .in("key", keys);
          for (const key of keys) {
            const found = data?.find((row) => row.key === key)?.value;
            if (found) return Response.redirect(found, 302);
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
