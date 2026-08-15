import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type PaymentMethod = "kaspi" | "freedom_pay";
type CertificateType = "service" | "amount";

type ServiceLine = { id: string; name: string; price: number };

type CreateCertificateBody = {
  amount: number;
  certificateType: CertificateType;
  buyerName: string;
  buyerContact?: string | null;
  recipientName?: string | null;
  recipientContact?: string | null;
  branch?: string | null;
  paymentMethod: PaymentMethod;
  designId?: string | null;
  message?: string | null;
  services?: ReadonlyArray<ServiceLine> | null;
};

const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `RTS-${year}-${seq}`;
};

async function findUniqueCertificateNumber(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  maxAttempts = 5,
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = generateCertificateNumber();
    const { data, error } = await supabase
      .from("certificates")
      .select("id")
      .eq("certificate_number", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
  }
  throw new Error("could_not_generate_unique_certificate_number");
}

function isValidServiceLine(v: unknown): v is ServiceLine {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return typeof s["id"] === "string" && typeof s["name"] === "string" && typeof s["price"] === "number";
}

function isValidBody(body: unknown): body is CreateCertificateBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (
    typeof b["amount"] !== "number" ||
    (b["amount"] as number) < 0 ||
    (b["certificateType"] !== "service" && b["certificateType"] !== "amount") ||
    typeof b["buyerName"] !== "string" ||
    (b["buyerName"] as string).trim().length === 0 ||
    (b["paymentMethod"] !== "kaspi" && b["paymentMethod"] !== "freedom_pay")
  ) {
    return false;
  }
  if (b["services"] != null && !Array.isArray(b["services"])) return false;
  if (Array.isArray(b["services"]) && !b["services"].every(isValidServiceLine)) return false;
  return true;
}

export const Route = createFileRoute("/api/certificates/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

        // Belt-and-suspenders uniqueness: pre-check via SELECT, then rely on the
        // table's UNIQUE constraint as the real guarantee (closes the race
        // window between the check and the insert below).
        for (let attempt = 0; attempt < 5; attempt++) {
          let certificateNumber: string;
          try {
            certificateNumber = await findUniqueCertificateNumber(supabase);
          } catch (err) {
            console.error("Failed to generate a unique certificate number:", err);
            return Response.json({ error: "number_generation_failed" }, { status: 500 });
          }

          const { data, error } = await supabase
            .from("certificates")
            .insert({
              certificate_number: certificateNumber,
              amount: body.amount,
              certificate_type: body.certificateType,
              buyer_name: body.buyerName.trim(),
              buyer_contact: body.buyerContact?.trim() || null,
              recipient_name: body.recipientName?.trim() || null,
              recipient_contact: body.recipientContact?.trim() || null,
              branch: body.branch?.trim() || null,
              payment_method: body.paymentMethod,
              design_id: body.designId?.trim() || null,
              message: body.message?.trim() || null,
              services: body.services && body.services.length > 0 ? body.services : null,
              // Ни Kaspi Pay, ни Freedom Pay ещё не подключены (это отдельная
              // будущая задача) — "paid" здесь означало бы то же, что и
              // раньше означал клиентский мок: пользователь дошёл до кнопки
              // "Оплатить" и нажал её, а не то, что платёжный провайдер
              // подтвердил поступление денег. sandbox_paid — честная пометка
              // тестового платежа, чтобы её можно было отличить от настоящей
              // 'paid', когда реальный шлюз (webhook/статус-полл) появится.
              payment_status: "sandbox_paid",
              status: "active",
            })
            .select("id, certificate_number")
            .single();

          if (!error) {
            return Response.json({
              id: data.id,
              certificateNumber: data.certificate_number,
            });
          }

          // Postgres unique_violation — another request grabbed this number
          // between our check and insert. Retry with a fresh number.
          if (error.code === "23505") continue;

          console.error("Failed to insert certificate:", error);
          return Response.json({ error: "save_failed" }, { status: 500 });
        }

        return Response.json({ error: "save_failed_after_retries" }, { status: 500 });
      },
    },
  },
});
