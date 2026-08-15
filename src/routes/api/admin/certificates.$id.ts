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
        const status = (body as Record<string, unknown>)?.["status"];
        if (typeof status !== "string" || !VALID_STATUSES.includes(status as CertStatus)) {
          return Response.json({ error: "invalid_status" }, { status: 400 });
        }

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
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
