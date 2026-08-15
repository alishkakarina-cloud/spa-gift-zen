-- Расширение схемы под задачи ревизии по ТЗ (2026-08-15):
-- 1) certificates — сейчас реально не оплачиваются (нет подключённого платёжного
--    шлюза), а форма собирает больше данных, чем сохранялось. Добавляем
--    недостающие поля и честный статус вместо захардкоженного payment_status='paid'.
-- 2) services — новая таблица под базовый CRUD услуг в админке. Живая витрина
--    сайта продолжает читать из src/data/catalog.ts (см. заметку в README админки/
--    отчёте) — эта таблица пока не является источником данных для покупателей,
--    только для управления в /admin.
--
-- Выполнить один раз в Supabase Dashboard -> SQL Editor -> New query.

alter table public.certificates
  -- Честный статус подтверждения оплаты. 'paid' раньше проставлялся всегда и
  -- ничего не значил — теперь при отсутствии реального платёжного шлюза
  -- используется 'sandbox_paid', чтобы явно отличать тестовые записи от
  -- будущих настоящих ('paid' зарезервировано под реальное подтверждение
  -- от Kaspi Pay/Freedom Pay).
  drop constraint if exists certificates_payment_status_check,
  alter column payment_status set default 'pending';

alter table public.certificates
  add constraint certificates_payment_status_check
    check (payment_status in ('pending', 'sandbox_paid', 'paid', 'failed'));

alter table public.certificates
  -- Раньше форма собирала эти данные, но при сохранении они либо не
  -- отправлялись (message, дизайн, услуги), либо жёстко обнулялись
  -- (recipient_contact всегда слался как null).
  add column if not exists certificate_type text check (certificate_type in ('service', 'amount')),
  add column if not exists design_id text,
  add column if not exists message text,
  -- Список выбранных услуг (сертификат «на услугу» может включать несколько
  -- программ сразу) — id и название на момент покупки, чтобы запись не
  -- «поплыла», если каталог потом изменится.
  add column if not exists services jsonb,
  -- Бизнес-статус самого сертификата, отдельно от payment_status (который
  -- про оплату). is_redeemed остаётся для обратной совместимости, но новая
  -- колонка — то, что реально показывает и меняет админка.
  add column if not exists status text not null default 'active'
    check (status in ('active', 'used', 'cancelled'));

comment on column public.certificates.status is
  'Бизнес-статус сертификата для админки: active/used/cancelled. is_redeemed сохранён отдельно и не заменяется автоматически.';
comment on column public.certificates.payment_status is
  'pending — не оплачен; sandbox_paid — прошёл тестовый/эмулированный платёж (реального шлюза ещё нет); paid — подтверждён настоящим платёжным провайдером; failed — оплата не прошла.';

-- Услуги для базового CRUD в /admin. Не связана с публичной витриной сайта —
-- см. комментарий в начале файла.
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  -- Человекочитаемый slug, аналог id из src/data/catalog.ts — не уникален
  -- принудительно на уровне БД, т.к. эта таблица не подменяет каталог сайта.
  slug text,
  name text not null,
  description text,
  duration text,
  price numeric(12, 2) not null check (price >= 0),
  group_name text,
  photo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;
alter table public.certificates enable row level security;
-- Как и у certificates, политик для anon/authenticated не создаётся — доступ
-- только через сервер с SUPABASE_SERVICE_ROLE_KEY (см. src/lib/supabase-server.ts
-- и новые /api/admin/* роуты).

-- Простой key-value для настроек, заменяемых из админки без релиза кода.
-- Сейчас единственное применение — ссылка на текущий файл SPA-меню (см.
-- /admin/menu и GET /api/menu-pdf): по умолчанию сайт продолжает отдавать
-- статический /menu/spa-menu.pdf, пока админ не загрузит новый файл.
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- ВАЖНО (ручной шаг, не выполняется этой миграцией): для загрузки PDF-меню
-- из админки нужен публичный Storage-бакет с именем "site-assets"
-- (Supabase Dashboard -> Storage -> New bucket -> Public bucket = on).
-- Без него POST /api/admin/menu будет возвращать ошибку загрузки файла.
