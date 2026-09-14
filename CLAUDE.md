# Заметки по проекту RaiThai Spa

## Обновление 2026-09-14 — Supabase починен, ключ рабочий

Старый ключ в `.env.local` давал `401` не потому что был ротирован — PowerShell
слал User-Agent, похожий на браузер (`Mozilla/5.0 ...`), и новый механизм
Supabase «secret key» блокирует такие запросы как потенциальную утечку ключа в
браузер (`Forbidden use of secret API key in browser`). С явным
`-UserAgent "curl/..."` тот же ключ отработал нормально.

Актуальные рабочие значения (владелец прислал их в чате 2026-09-14):
`SUPABASE_URL=https://potxhqqfuddnqsncbkxc.supabase.co`, ключ — `secret key`
(новый формат `sb_secret_...`, аналог `service_role`) из Dashboard → Settings →
API → Secret keys. Записаны в `thai massage/.env.local`.

**Сквозной тест пройден**: вставка тестовой строки в `public.certificates` и
последующее удаление через REST (`/rest/v1/certificates`) с этим ключом —
успешно. Значит связка сервер → Supabase рабочая, при условии что и в Vercel
(Project Settings → Environment Variables, продакшен) стоят те же два
значения — **это ещё не проверено и не обновлено**, см. TODO ниже.

**SPA-меню по филиалам сделано**: оба PDF (`docs/pricing/raithai-price-*.pdf`)
залиты в Storage-бакет `site-assets` и прописаны в `site_settings`
(`spa_menu_pdf_url_petropavlovsk`, `spa_menu_pdf_url_kokshetau`) — кнопки
«Скачать SPA-меню» на `/services` должны отдавать их, опять же при условии
рабочего ключа в Vercel.

**Миграция `20260914000000_add_buyer_split_and_tracking_fields.sql`** (новые
поля `buyer_phone`, `buyer_email`, `redeemed_at`, `promo_code`, `utm_*`,
`sale_source`) — файл создан и код под неё написан (см. `create.ts`,
`certificate.tsx`, `certificates.$id.ts`, админка), но **сама миграция ещё не
выполнена** в Supabase (SQL нужно применить через Dashboard → SQL Editor, REST
API не даёт выполнять произвольный DDL) — до этого шага вставка новых полей
в БД будет тихо игнорироваться PostgREST (лишние поля в insert он просто не
примет/не найдёт колонку).

### TODO (осталось)
- Прогнать миграцию `20260914000000_...` в Supabase Dashboard → SQL Editor.
- Обновить `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` в Vercel (Project
  Settings → Environment Variables, Production) на актуальные значения выше —
  без этого прод так и будет падать на `401`/`supabase_not_configured`,
  несмотря на то что сама Supabase-сторона уже рабочая.
- Закоммитить и запушить изменения кода — в этой рабочей среде нет `git`/
  `npm`, делает владелец вручную.

## Открытые вопросы (вернуться в следующей части)

Отложено сознательно — не начинать без отдельного подтверждения владельца.

### 2. `payment_status` всегда `paid`

Похоже, уже исправлено более поздней правкой, чем эта заметка: сейчас
`src/routes/api/certificates/create.ts` вставляет `payment_status: "pending"`,
реальный статус ставит вебхук ApiPay (`src/routes/api/webhooks/apipay.ts`)
или ручное подтверждение админом (`markPaidManually` в
`api/admin/certificates.$id.ts`, с логированием). Перепроверить на живых
данных после фикса ключа выше, но по коду выглядит закрытым.

### 4. Почта администратора и почтовый сервис

Для уведомлений (письмо покупателю с сертификатом + письмо администратору о новом
заказе) нужно:

- адрес администратора — в задании остался незаполненный placeholder;
- выбрать сервис отправки: Resend / SendGrid / SMTP.

## Платежи

**PAYMENT: sandbox-режим ещё не реализован.** Реальных ключей Kaspi Pay и Freedom Pay
нет, интеграции нет — экран оплаты сейчас чисто визуальный (форма карты никуда не
отправляется, Kaspi QR — демо-payload). Реализация вынесена в следующую часть.

## Что нельзя ломать

Уже согласовано и переделке не подлежит без отдельной просьбы: бренд (логотип,
палитра брендбука, шрифты), первый экран и его тексты, форма оформления заказа,
карусель категорий, состав и цены услуг, два филиала (Петропавловск, Кокшетау).
