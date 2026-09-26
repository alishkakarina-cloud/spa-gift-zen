import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const Route = createFileRoute("/api/admin/certificates")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        const url = new URL(request.url);
        // q ищет и по номеру сертификата, и по телефону/контакту покупателя —
        // это два способа поиска, явно перечисленных в задаче, одним полем
        // ввода на UI.
        const q = url.searchParams.get("q")?.trim() ?? "";
        const status = url.searchParams.get("status")?.trim() ?? "";
        // Тестовые сертификаты (см. /api/admin/certificates/test-create) не
        // должны попадать в обычный список заказов/статистику продаж по
        // умолчанию — только когда МОП явно включил фильтр "Показать
        // тестовые" (?includeTest=1) на странице заказов.
        const includeTest = url.searchParams.get("includeTest") === "1";

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        let query = supabase
          .from("certificates")
          .select(
            "id, certificate_number, amount, certificate_type, buyer_name, buyer_contact, buyer_phone, buyer_email, recipient_name, branch, payment_method, payment_status, status, redeemed_at, created_at, services, is_test",
          )
          .order("created_at", { ascending: false })
          .limit(200);

        if (!includeTest) query = query.eq("is_test", false);
        if (status) query = query.eq("status", status);
        if (q) {
          // certificate_number + buyer_contact (склейка "телефон · email")
          // покрывают старые записи; buyer_phone/buyer_email — то же самое
          // раздельно для записей после 2026-09-14 (см. миграцию
          // 20260914000000_add_buyer_split_and_tracking_fields).
          query = query.or(
            `certificate_number.ilike.%${q}%,buyer_contact.ilike.%${q}%,buyer_phone.ilike.%${q}%,buyer_email.ilike.%${q}%`,
          );
        }

        const { data, error } = await query;
        if (error) {
          console.error("Failed to list certificates:", error);
          return Response.json({ error: "list_failed" }, { status: 500 });
        }
        return Response.json({ certificates: data });
      },
    },
  },
});
