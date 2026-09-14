-- Аддитивная миграция по открытым пунктам из CLAUDE.md (Блок 1, 2026-09-14).
-- Часть пунктов из исходного списка уже закрыта более поздними миграциями
-- под другими именами и здесь не дублируется:
--   order_number   -> certificate_number уже человекочитаемый (RT0001+),
--   service_id/name -> колонка services jsonb (см. 20260815) хранит и то, и другое,
--   sender_name    -> buyer_name,
--   wish           -> message,
--   status         -> уже добавлен в 20260815 (active/used/cancelled).
--
-- Ниже — то, что реально всё ещё отсутствует.
--
-- Выполнить один раз в Supabase Dashboard -> SQL Editor -> New query.

alter table public.certificates
  -- Телефон и e-mail покупателя раздельно. Сейчас оба склеены в buyer_contact
  -- через " · " (см. certificate.tsx) — колонка остаётся как есть для
  -- обратной совместимости, а buyer_phone/buyer_email заполняются
  -- дополнительно с той же покупки, чтобы поиск/экспорт не зависели от
  -- парсинга разделителя.
  add column if not exists buyer_phone text,
  add column if not exists buyer_email text,

  -- Дата использования сертификата — отдельно от is_redeemed (boolean,
  -- сохранён для обратной совместимости) и status (active/used/cancelled).
  -- Проставляется, когда админ переводит статус в "used".
  add column if not exists redeemed_at timestamptz,

  -- Промокод и UTM-метки — колонки под требование ТЗ (экспорт/аналитика
  -- источника продажи), сейчас ничем не заполняются: ни форма покупки, ни
  -- ссылки на сайт их не собирают. Добавлены заранее, аддитивно и
  -- nullable — заполнение потребует отдельной задачи на сбор этих данных.
  add column if not exists promo_code text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists sale_source text;
