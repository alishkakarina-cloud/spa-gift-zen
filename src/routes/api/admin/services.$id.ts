import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ServicePatchBody = Partial<{
  slug: string | null;
  name: string;
  description: string | null;
  duration: string | null;
  price: number;
  groupName: string | null;
  photoUrl: string | null;
  isActive: boolean;
}>;

export const Route = createFileRoute("/api/admin/services/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let body: ServicePatchBody;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        if (body.price != null && (typeof body.price !== "number" || body.price < 0)) {
          return Response.json({ error: "invalid_price" }, { status: 400 });
        }

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (body.slug !== undefined) update["slug"] = body.slug?.trim() || null;
        if (body.name !== undefined) update["name"] = body.name.trim();
        if (body.description !== undefined) update["description"] = body.description?.trim() || null;
        if (body.duration !== undefined) update["duration"] = body.duration?.trim() || null;
        if (body.price !== undefined) update["price"] = body.price;
        if (body.groupName !== undefined) update["group_name"] = body.groupName?.trim() || null;
        if (body.photoUrl !== undefined) update["photo_url"] = body.photoUrl?.trim() || null;
        if (body.isActive !== undefined) update["is_active"] = body.isActive;

        const { data, error } = await supabase
          .from("services")
          .update(update)
          .eq("id", params.id)
          .select("*")
          .maybeSingle();

        if (error) {
          console.error("Failed to update service:", error);
          return Response.json({ error: "update_failed" }, { status: 500 });
        }
        if (!data) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({ service: data });
      },

      DELETE: async ({ params }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const { error } = await supabase.from("services").delete().eq("id", params.id);
        if (error) {
          console.error("Failed to delete service:", error);
          return Response.json({ error: "delete_failed" }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
