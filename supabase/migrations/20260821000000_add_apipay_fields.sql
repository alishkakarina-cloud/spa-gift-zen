-- ApiPay.kz (Kaspi Pay) — поля для реального счёта на оплату вместо
-- фиктивного payment_status: "sandbox_paid" (см. src/routes/api/certificates/create.ts).
-- Аддитивная миграция: отдельной таблицы заказов/счетов нет, certificates
-- остаётся единственным источником правды по покупкам.
--
-- payment_status ('pending'|'sandbox_paid'|'paid'|'failed') уже поддерживает
-- нужный жизненный цикл (pending -> paid), правку не требует.

alter table public.certificates
  add column payment_provider text,
  add column provider_invoice_id text,
  add column payment_channel text check (payment_channel in ('qr', 'phone')),
  add column paid_at timestamptz;
