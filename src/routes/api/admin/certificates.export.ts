import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const COLUMNS = [
  "certificate_number",
  "created_at",
  "certificate_type",
  "amount",
  "buyer_name",
  "buyer_contact",
  "recipient_name",
  "branch",
  "payment_method",
  "payment_status",
  "status",
] as const;

/** Экранирование по RFC 4180 — оборачивает в кавычки только когда нужно, удваивает внутренние кавычки. */
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const Route = createFileRoute("/api/admin/certificates/export")({
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
          .from("certificates")
          .select(COLUMNS.join(","))
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Failed to export certificates:", error);
          return Response.json({ error: "export_failed" }, { status: 500 });
        }

        // BOM в начале — иначе Excel на Windows показывает кириллицу в CSV битой.
        const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
        const lines = [
          COLUMNS.join(","),
          ...rows.map((row) => COLUMNS.map((c) => csvCell(row[c])).join(",")),
        ];
        const csv = "﻿" + lines.join("\r\n");

        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="raithai-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
      },
    },
  },
});
