import { createFileRoute } from "@tanstack/react-router";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Поиск СВОИХ уже оплаченных сертификатов по номеру телефона — без
 * регистрации/пароля (СРОЧНАЯ ЗАДАЧА 2026-09-04, Блок 3: клиентка оплатила,
 * но сайт "завис" из-за отклонённого вебхука — нужен способ самостоятельно
 * забрать сертификат повторно, не только через поддержку).
 *
 * Публичный GET без авторизации — намеренно, тот же выбор, что и у
 * /api/certificates/status/$id (см. его комментарий). Компромисс по
 * безопасности: телефон — не пароль, знание чужого номера технически даёт
 * доступ к истории покупок на этот номер. Отдаём только payment_status:
 * "paid" (ничего pending/failed — не раскрываем незавершённые заказы) и
 * только поля, нужные для показа/скачивания самого сертификата — без
 * buyer_contact/recipient_contact целиком.
 *
 * buyer_contact хранится как введено на шаге 2 ("+7 700 111 22 33" и т.п.,
 * см. certificate.tsx) — не нормализовано в БД. Сравниваем по последним 10
 * цифрам (без учёта 8/+7 и форматирования) на стороне сервера, а не через
 * SQL ilike по сырой строке — иначе "87001112233" не найдёт "+7 700 111 22 33".
 */
const digitsOnly = (s: string) => s.replace(/\D/g, "");

export const Route = createFileRoute("/api/certificates/lookup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const rawPhone = url.searchParams.get("phone") ?? "";
        const phoneDigits = digitsOnly(rawPhone);
        // Последние 10 цифр однозначно определяют казахстанский мобильный
        // номер независимо от 8/+7/7 в начале — то же соглашение, что и в
        // PAY_PHONE_RE на фронтенде (8XXXXXXXXXX, 11 знаков с "8").
        const last10 = phoneDigits.slice(-10);
        if (last10.length !== 10) {
          return Response.json({ error: "invalid_phone" }, { status: 400 });
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
          .select(
            "id, certificate_number, amount, certificate_type, buyer_contact, recipient_name, message, services, design_id, branch, created_at",
          )
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(500);

        if (error) {
          console.error("Failed to look up certificates by phone:", error);
          return Response.json({ error: "lookup_failed" }, { status: 500 });
        }

        const matches = (data ?? [])
          .filter((row) => digitsOnly(row.buyer_contact ?? "").includes(last10))
          .map((row) => ({
            id: row.id,
            certificateNumber: row.certificate_number,
            amount: row.amount,
            certificateType: row.certificate_type,
            recipientName: row.recipient_name,
            message: row.message,
            services: row.services,
            designId: row.design_id,
            branch: row.branch,
            createdAt: row.created_at,
          }));

        return Response.json({ certificates: matches });
      },
    },
  },
});
