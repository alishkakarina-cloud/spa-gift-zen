import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-session";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Тестовая (без реальной оплаты через ApiPay) выдача сертификата для МОПа —
 * СТРОГАЯ ЗАДАЧА 2026-09-26. Не переиспользует /api/certificates/create:
 * там намеренно нет пути "создать оплаченным сразу" (иначе он был бы дырой
 * для реальных покупателей), а здесь наоборот — единственная точка входа
 * защищена isAdminAuthenticated(), обхода оплаты для сайта нет вообще.
 *
 * Номер сертификата резервируется тем же next_certificate_number(), что и в
 * обычном флоу (см. reserveCertificateNumber в create.ts) — логика
 * генерации номера не меняется, просто вызывается из другого места.
 */
type CertificateType = "service" | "amount";
type ServiceLine = { id: string; name: string; price: number };

type TestCreateBody = {
  certificateType: CertificateType;
  amount?: number;
  services?: ReadonlyArray<ServiceLine> | null;
  recipientName: string;
  recipientPhone?: string | null;
  branch?: "petropavlovsk" | "kokshetau" | null;
  designId?: string | null;
  message?: string | null;
};

function isValidServiceLine(v: unknown): v is ServiceLine {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return typeof s["id"] === "string" && typeof s["name"] === "string" && typeof s["price"] === "number";
}

function isValidBody(body: unknown): body is TestCreateBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (b["certificateType"] !== "service" && b["certificateType"] !== "amount") return false;
  if (typeof b["recipientName"] !== "string" || b["recipientName"].trim().length === 0) return false;

  if (b["certificateType"] === "amount") {
    if (typeof b["amount"] !== "number" || !Number.isInteger(b["amount"]) || (b["amount"] as number) <= 0)
      return false;
  } else {
    if (!Array.isArray(b["services"]) || b["services"].length === 0) return false;
    if (!b["services"].every(isValidServiceLine)) return false;
  }

  if (
    b["branch"] != null &&
    b["branch"] !== "petropavlovsk" &&
    b["branch"] !== "kokshetau"
  )
    return false;
  return true;
}

async function reserveCertificateNumber(supabase: ReturnType<typeof getSupabaseServerClient>) {
  const { data, error } = await supabase.rpc("next_certificate_number");
  if (error || typeof data !== "string") {
    throw error ?? new Error("next_certificate_number returned no data");
  }
  return data;
}

export const Route = createFileRoute("/api/admin/certificates/test-create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isAdminAuthenticated())) return unauthorizedResponse();

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        if (!isValidBody(body)) {
          return Response.json({ error: "invalid_payload" }, { status: 400 });
        }

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        const amount =
          body.certificateType === "amount"
            ? body.amount!
            : body.services!.reduce((sum, s) => sum + s.price, 0);

        for (let attempt = 0; attempt < 2; attempt++) {
          let certificateNumber: string;
          try {
            certificateNumber = await reserveCertificateNumber(supabase);
          } catch (err) {
            console.error("Failed to reserve a certificate number:", err);
            return Response.json({ error: "number_generation_failed" }, { status: 500 });
          }

          const recipientName = body.recipientName.trim();
          const recipientPhone = body.recipientPhone?.trim() || null;
          const now = new Date().toISOString();

          console.error(
            `TEST CERTIFICATE: ${certificateNumber} created by admin action, no real payment (is_test: true).`,
          );

          const { data, error } = await supabase
            .from("certificates")
            .insert({
              certificate_number: certificateNumber,
              amount,
              certificate_type: body.certificateType,
              // Тестовому сертификату отдельного "покупателя" нет — тот же
              // человек, что и получатель (аналог "Покупаю для себя" в
              // обычном визарде), чтобы /my-certificates по телефону тоже
              // находил тестовые сертификаты при демонстрации.
              buyer_name: recipientName,
              buyer_contact: recipientPhone,
              buyer_phone: recipientPhone,
              recipient_name: recipientName,
              branch: body.branch ?? null,
              payment_method: "kaspi",
              design_id: body.designId?.trim() || "standard",
              message: body.message?.trim() || null,
              services: body.certificateType === "service" ? body.services : null,
              payment_channel: null,
              payment_provider: null,
              provider_invoice_id: null,
              // Оплата не проходит через ApiPay в принципе — сразу "paid",
              // без промежуточного "pending" (там нечего ждать).
              payment_status: "paid",
              paid_at: now,
              status: "active",
              is_test: true,
            })
            .select("id, certificate_number, created_at")
            .single();

          if (!error) {
            return Response.json({
              id: data.id,
              certificateNumber: data.certificate_number,
              createdAt: data.created_at,
            });
          }

          // unique_violation на certificate_number — практически невозможно
          // (sequence), но на случай гонки — повторная попытка со свежим
          // номером, тот же паттерн, что и в create.ts.
          if (error.code === "23505") continue;

          console.error("Failed to insert test certificate:", error);
          return Response.json({ error: "save_failed" }, { status: 500 });
        }

        return Response.json({ error: "save_failed_after_retries" }, { status: 500 });
      },
    },
  },
});
