import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ServiceBody = {
  slug?: string | null;
  name: string;
  description?: string | null;
  duration?: string | null;
  price: number;
  groupName?: string | null;
  photoUrl?: string | null;
  isActive?: boolean;
};

function isValidServiceBody(body: unknown): body is ServiceBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return typeof b["name"] === "string" && b["name"].trim().length > 0 && typeof b["price"] === "number" && b["price"] >= 0;
}

export const Route = createFileRoute("/api/admin/services")({
  server: {
    handlers: {
      GET: async () => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to list services:", error);
          return Response.json({ error: "list_failed" }, { status: 500 });
        }
        return Response.json({ services: data });
      },

      POST: async ({ request }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        if (!isValidServiceBody(body)) {
          return Response.json({ error: "invalid_payload" }, { status: 400 });
        }

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const { data, error } = await supabase
          .from("services")
          .insert({
            slug: body.slug?.trim() || null,
            name: body.name.trim(),
            description: body.description?.trim() || null,
            duration: body.duration?.trim() || null,
            price: body.price,
            group_name: body.groupName?.trim() || null,
            photo_url: body.photoUrl?.trim() || null,
            is_active: body.isActive ?? true,
          })
          .select("*")
          .single();

        if (error) {
          console.error("Failed to create service:", error);
          return Response.json({ error: "create_failed" }, { status: 500 });
        }
        return Response.json({ service: data });
      },
    },
  },
});
