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
            "id, certificate_number, amount, certificate_type, buyer_name, buyer_contact, recipient_name, branch, payment_method, payment_status, status, created_at, services",
          )
          .order("created_at", { ascending: false })
          .limit(200);

        if (status) query = query.eq("status", status);
        if (q) {
          // certificate_number.ilike + buyer_contact.ilike покрывают оба
          // заявленных способа поиска (номер сертификата, телефон покупателя)
          // одним запросом через OR.
          query = query.or(`certificate_number.ilike.%${q}%,buyer_contact.ilike.%${q}%`);
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
