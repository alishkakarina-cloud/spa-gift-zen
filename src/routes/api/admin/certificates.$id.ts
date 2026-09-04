import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const VALID_STATUSES = ["active", "used", "cancelled"] as const;
type CertStatus = (typeof VALID_STATUSES)[number];

export const Route = createFileRoute("/api/admin/certificates/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

        if (error) {
          console.error("Failed to load certificate:", error);
          return Response.json({ error: "load_failed" }, { status: 500 });
        }
        if (!data) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({ certificate: data });
      },

      PATCH: async ({ request, params }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const b = body as Record<string, unknown>;

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        // Ручное подтверждение оплаты (СРОЧНАЯ ЗАДАЧА 2026-09-04 — реальный
        // клиент оплатил, но вебхук ApiPay был отклонён по подписи, заказ
        // навсегда завис в payment_status: "pending"). Отдельный флаг, а не
        // просто "разрешить любой payment_status через тот же путь, что и
        // status" — это осознанное ручное действие админа в обход обычного
        // вебхука, должно быть explicit и залогировано, а не тихая замена
        // одного поля на другое. Идемпотентно: уже "paid" — не трогаем
        // (не перезаписываем существующий paid_at повторным вызовом).
        if (b["markPaidManually"] === true) {
          const { data: existing, error: loadError } = await supabase
            .from("certificates")
            .select("id, payment_status")
            .eq("id", params.id)
            .maybeSingle();
          if (loadError) {
            console.error("Failed to load certificate before manual paid override:", loadError);
            return Response.json({ error: "load_failed" }, { status: 500 });
          }
          if (!existing) return Response.json({ error: "not_found" }, { status: 404 });
          if (existing.payment_status === "paid") {
            return Response.json({ certificate: existing, note: "already_paid" });
          }
          console.error(
            `MANUAL PAYMENT OVERRIDE: certificate ${params.id} marked "paid" by admin action (was "${existing.payment_status}"). Verify this was checked against the real ApiPay dashboard before use.`,
          );
          const { data, error } = await supabase
            .from("certificates")
            .update({ payment_status: "paid", paid_at: new Date().toISOString() })
            .eq("id", params.id)
            .select("id, payment_status, paid_at")
            .maybeSingle();
          if (error) {
            console.error("Failed to apply manual paid override:", error);
            return Response.json({ error: "update_failed" }, { status: 500 });
          }
          return Response.json({ certificate: data });
        }

        const status = b["status"];
        if (typeof status !== "string" || !VALID_STATUSES.includes(status as CertStatus)) {
          return Response.json({ error: "invalid_status" }, { status: 400 });
        }

        const { data, error } = await supabase
          .from("certificates")
          .update({ status })
          .eq("id", params.id)
          .select("id, status")
          .maybeSingle();

        if (error) {
          console.error("Failed to update certificate status:", error);
          return Response.json({ error: "update_failed" }, { status: 500 });
        }
        if (!data) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({ certificate: data });
      },
    },
  },
});
