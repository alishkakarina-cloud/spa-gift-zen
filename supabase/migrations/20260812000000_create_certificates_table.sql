-- Certificates table: one row per issued gift certificate.
--
-- Run this once in the Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).
-- The app itself never creates/alters this table at runtime — only reads/writes rows,
-- through a server-side route using a key with write access (see app README/chat notes
-- on SUPABASE_SERVICE_ROLE_KEY vs SUPABASE_ANON_KEY).

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),

  -- Format: RTS-{year}-{5 digits}, e.g. RTS-2026-04213. Generated server-side,
  -- checked for uniqueness before insert; this constraint is the hard backstop.
  certificate_number text not null unique,

  amount numeric(12, 2) not null check (amount >= 0),

  -- Person completing the purchase ("от кого"/sender in the current wizard).
  buyer_name text not null,
  -- Not collected by the current purchase form (no buyer phone/email field exists
  -- yet) — column exists for when that's added, nullable until then.
  buyer_contact text,

  -- Recipient of the gift, if different from the buyer.
  recipient_name text,
  -- Not in the originally requested column list, but the current form always
  -- collects a recipient phone or e-mail (used for delivering the certificate) —
  -- added so that data isn't silently dropped. Remove if not wanted.
  recipient_contact text,

  -- Salon branch, if/when the purchase flow collects one. No branch-selection
  -- step exists in the certificate wizard today (only the unrelated WhatsApp
  -- button has a branch picker) — nullable until such a step is added.
  branch text,

  payment_method text not null check (payment_method in ('kaspi', 'freedom_pay')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),

  is_redeemed boolean not null default false,

  created_at timestamptz not null default now()
);

create index if not exists certificates_certificate_number_idx
  on public.certificates (certificate_number);

-- Locked down by default: no policies are created below, so with RLS enabled
-- the anon/authenticated roles have zero access. The app's server route is
-- expected to use SUPABASE_SERVICE_ROLE_KEY (bypasses RLS, server-only secret,
-- never sent to the browser) for reads/writes. If you'd rather use the anon
-- key even from the server, you must add explicit INSERT/SELECT policies for
-- the "anon" role here — ask before doing that, since it also means any client
-- holding the anon key could write/read certificates directly.
alter table public.certificates enable row level security;
