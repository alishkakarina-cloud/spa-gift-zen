-- Тестовые сертификаты для МОПа (демонстрация/обучение, без реальной оплаты
-- через ApiPay) — СТРОГАЯ ЗАДАЧА 2026-09-26. Отдельный булев флаг, а не
-- отдельная таблица: сертификат создаётся и читается тем же кодом
-- (генерация номера через next_certificate_number, рендер через
-- CertificateCard/скачивание в админке), различие нужно только для
-- фильтрации в списке заказов/CSV-выгрузке и статистике продаж.
--
-- Выполнить один раз в Supabase Dashboard -> SQL Editor -> New query.

alter table public.certificates
  add column if not exists is_test boolean not null default false;

-- Список заказов в админке по умолчанию всегда фильтрует is_test = false —
-- частый запрос, стоит проиндексировать; частичный индекс маленький, т.к.
-- тестовых сертификатов ожидается на порядки меньше настоящих.
create index if not exists certificates_is_test_idx
  on public.certificates (is_test)
  where is_test = true;
