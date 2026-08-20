import { createFileRoute } from "@tanstack/react-router";
import { getApipayConfig, verifyApipaySignature } from "@/lib/apipay";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Адрес вписывается в кабинете apipay.kz (Настройки -> Подключение ->
 * карточка ключа -> «Изменить» -> «Адрес для уведомлений»), см. Блок 1
 * задачи: https://spa-gift-zen.vercel.app/api/webhooks/apipay
 *
 * Тело читается как сырой текст ДО любого JSON.parse — подпись считается по
 * сырым байтам, это явно предупреждение из документации ApiPay (частая
 * ошибка №1: подпись сверяют по уже распарсенному JSON).
 *
 * Отвечаем 2xx максимально быстро (одна короткая запись в БД) — вторая
 * частая ошибка из документации: обработчик, который думает дольше 5с.
 *
 * Идемпотентно: если строка уже "paid", повторная доставка (до 11 попыток
 * за ~2 часа в боевом режиме) ничего не перезаписывает.
 */
export const Route = createFileRoute("/api/webhooks/apipay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();

        let secret: string | undefined;
        try {
          secret = getApipayConfig().webhookSecret;
        } catch (err) {
          console.error("ApiPay not configured:", err);
          return Response.json({ error: "apipay_not_configured" }, { status: 500 });
        }
        if (!secret) {
          console.error("APIPAY_WEBHOOK_SECRET is not set");
          return Response.json({ error: "webhook_not_configured" }, { status: 500 });
        }

        const signatureHeader = request.headers.get("X-Webhook-Signature");
        const valid = await verifyApipaySignature(rawBody, signatureHeader, secret);
        if (!valid) {
          console.error("ApiPay webhook: invalid signature");
          return Response.json({ error: "invalid_signature" }, { status: 401 });
        }

        let payload: unknown;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const event = (payload as Record<string, unknown>)?.["event"];
        if (event !== "invoice.status_changed") {
          // webhook.test и прочие события — подтверждаем получение, но не обрабатываем.
          return Response.json({ ok: true });
        }

        const invoice = (payload as Record<string, unknown>)["invoice"] as
          | Record<string, unknown>
          | undefined;
        const externalOrderId = invoice?.["external_order_id"];
        const invoiceStatus = invoice?.["status"];
        if (typeof externalOrderId !== "string" || typeof invoiceStatus !== "string") {
          return Response.json({ error: "invalid_payload" }, { status: 400 });
        }

        let supabase: ReturnType<typeof getSupabaseServerClient>;
        try {
          supabase = getSupabaseServerClient();
        } catch (err) {
          console.error("Supabase not configured:", err);
          return Response.json({ error: "supabase_not_configured" }, { status: 500 });
        }

        // external_order_id — это id самой строки certificates (см.
        // createApipayInvoice в create.ts), отдельная колонка-связка не нужна.
        const { data: existing, error: loadError } = await supabase
          .from("certificates")
          .select("id, payment_status")
          .eq("id", externalOrderId)
          .maybeSingle();

        if (loadError) {
          console.error("ApiPay webhook: failed to load certificate:", loadError);
          return Response.json({ error: "load_failed" }, { status: 500 });
        }
        if (!existing) {
          // Заказ не найден — подтверждаем получение (2xx), чтобы ApiPay не
          // повторял бесконечно доставку события, которое мы всё равно не
          // сможем сопоставить.
          console.error("ApiPay webhook: no certificate for external_order_id", externalOrderId);
          return Response.json({ ok: true, note: "no_matching_certificate" });
        }

        // Уже обработано раньше (повторная доставка) — идемпотентно, ничего не делаем.
        if (existing.payment_status === "paid") {
          return Response.json({ ok: true, note: "already_paid" });
        }

        const nextStatus =
          invoiceStatus === "paid"
            ? "paid"
            : invoiceStatus === "cancelled" || invoiceStatus === "expired" || invoiceStatus === "error"
              ? "failed"
              : null;

        if (nextStatus === null) {
          // processing/pending — промежуточные статусы, ничего не меняем.
          return Response.json({ ok: true });
        }

        const paidAt = invoice?.["paid_at"];
        const { error: updateError } = await supabase
          .from("certificates")
          .update({
            payment_status: nextStatus,
            ...(nextStatus === "paid" ? { paid_at: typeof paidAt === "string" ? paidAt : new Date().toISOString() } : {}),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("ApiPay webhook: failed to update certificate:", updateError);
          return Response.json({ error: "update_failed" }, { status: 500 });
        }

        return Response.json({ ok: true });
      },
    },
  },
});
