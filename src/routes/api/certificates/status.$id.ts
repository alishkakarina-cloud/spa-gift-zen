import { createFileRoute } from "@tanstack/react-router";
import { categorizeApipayErrorCode } from "@/lib/apipay";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Лёгкий публичный статус для клиентского поллинга на шаге 4 оплаты
 * (certificate.tsx) — пока src/routes/api/webhooks/apipay.ts не проставит
 * payment_status: "paid", шаг 5 не открывается. Отдаёт только статус, номер
 * и (при payment_status: "failed") безопасную категорию причины — никогда
 * сырой provider_error_code от ApiPay. Без PII (имя/контакты покупателя),
 * GET без авторизации ок.
 */
export const Route = createFileRoute("/api/certificates/status/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const { data, error } = await supabase
          .from("certificates")
          .select("payment_status, certificate_number, provider_error_code")
          .eq("id", params.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load certificate status:", error);
          return Response.json({ error: "load_failed" }, { status: 500 });
        }
        if (!data) return Response.json({ error: "not_found" }, { status: 404 });

        return Response.json({
          paymentStatus: data.payment_status,
          certificateNumber: data.certificate_number,
          ...(data.payment_status === "failed"
            ? { errorCategory: categorizeApipayErrorCode(data.provider_error_code) }
            : {}),
        });
      },
    },
  },
});
