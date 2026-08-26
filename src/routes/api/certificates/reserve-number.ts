import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Резервирует следующий номер сертификата (RT0001, RT0002...) через
 * Postgres sequence (см. миграцию 20260826000000 и next_certificate_number
 * в БД) — вызывается с клиента в момент выбора дизайна (certificate.tsx,
 * до оплаты), чтобы номер был виден в превью и не менялся дальше по флоу.
 * Никакая строка в certificates при этом не создаётся — только
 * зарезервирован сам номер; сама запись о заказе появляется как и раньше,
 * в момент оплаты (POST /api/certificates/create), с этим же номером.
 * Не требует авторизации — номер сам по себе не PII, страница дизайна
 * доступна анонимно.
 */
export const Route = createFileRoute("/api/certificates/reserve-number")({
  server: {
    handlers: {
      POST: async () => {
        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const { data, error } = await supabase.rpc("next_certificate_number");
        if (error || typeof data !== "string") {
          console.error("Failed to reserve certificate number:", error);
          return Response.json({ error: "reserve_failed" }, { status: 500 });
        }

        return Response.json({ certificateNumber: data });
      },
    },
  },
});
