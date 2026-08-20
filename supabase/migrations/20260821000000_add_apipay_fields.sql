-- ApiPay.kz (Kaspi Pay) — поля для реального счёта на оплату вместо
-- фиктивного payment_status: "sandbox_paid" (см. src/routes/api/certificates/create.ts).
-- Аддитивная миграция: отдельной таблицы заказов/счетов нет, certificates
-- остаётся единственным источником правды по покупкам.
--
-- payment_status ('pending'|'sandbox_paid'|'paid'|'failed') уже поддерживает
-- нужный жизненный цикл (pending -> paid), правку не требует.

alter table public.certificates
  add column if not exists payment_provider text,
  add column if not exists provider_invoice_id text,
  add column if not exists payment_channel text,
  add column if not exists paid_at timestamptz,
  -- Код ошибки ApiPay при неуспехе (в т.ч. асинхронной — например
  -- client_not_found приходит только через вебхук, уже после того как счёт
  -- был создан) — нужен, чтобы страница оплаты могла показать не просто
  -- "не получилось", а конкретную причину (см. categorizeApipayErrorCode
  -- в src/lib/apipay.ts). Хранится код ApiPay как есть, наружу клиенту
  -- отдаётся только безопасная категория, не сырой код.
  add column if not exists provider_error_code text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'certificates_payment_channel_check'
  ) then
    alter table public.certificates
      add constraint certificates_payment_channel_check
        check (payment_channel in ('qr', 'phone'));
  end if;
end $$;
