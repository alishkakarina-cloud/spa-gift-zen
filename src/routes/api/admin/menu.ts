import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "site-assets";

export const Route = createFileRoute("/api/admin/menu")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "invalid_form" }, { status: 400 });
        }
        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "file_required" }, { status: 400 });
        }
        if (file.type !== "application/pdf") {
          return Response.json({ error: "pdf_required" }, { status: 400 });
        }

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const path = `spa-menu/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: "application/pdf", upsert: false });

        if (uploadError) {
          console.error("Failed to upload menu PDF:", uploadError);
          // Самая частая причина на новом проекте — бакет ещё не создан
          // (см. заметку в миграции 20260815000000_extend_certificates_and_services.sql).
          return Response.json({ error: "upload_failed", detail: uploadError.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

        const { error: settingError } = await supabase
          .from("site_settings")
          .upsert({ key: "spa_menu_pdf_url", value: publicUrlData.publicUrl, updated_at: new Date().toISOString() });

        if (settingError) {
          console.error("Failed to save menu PDF setting:", settingError);
          return Response.json({ error: "save_setting_failed" }, { status: 500 });
        }

        return Response.json({ url: publicUrlData.publicUrl });
      },
    },
  },
});
