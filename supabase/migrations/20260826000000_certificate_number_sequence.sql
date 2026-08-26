-- Последовательный номер сертификата RT0001, RT0002, RT0003... (правка
-- владельца 2026-08-26) — раньше был случайный RTS-{год}-{5 цифр} с
-- проверкой уникальности через SELECT-перед-INSERT. Postgres sequence даёт
-- ту же гарантию уникальности честно, на уровне самой базы: nextval() под
-- конкурентной нагрузкой физически не может выдать одно и то же значение
-- дважды (это встроенный механизм СУБД, а не проверка в коде приложения) —
-- закрывает и по возрастанию, и по race condition при одновременных
-- покупках.
--
-- Выполнить один раз в Supabase Dashboard -> SQL Editor -> New query.

create sequence if not exists public.certificate_number_seq start 1;

-- Обёрнуто в SQL-функцию, а не голый nextval() из кода приложения — тонкий
-- клиент (supabase-js) не умеет выполнять произвольный SQL, только вызывать
-- функции (.rpc()) или ходить через REST в таблицы. lpad до 4 знаков — по
-- заданному формату RT0001..RT9999; после RT9999 просто продолжит расти в
-- 5 знаков (RT10000) — sequence для этого ничего специально делать не нужно.
create or replace function public.next_certificate_number()
returns text
language sql
as $$
  select 'RT' || lpad(nextval('public.certificate_number_seq')::text, 4, '0');
$$;

-- Как и certificates/services (см. предыдущие миграции) — доступ только
-- серверу через service_role, не anon/authenticated (в этом приложении их
-- никто не использует, ключ во фронтенд не попадает).
revoke execute on function public.next_certificate_number() from public;
grant execute on function public.next_certificate_number() to service_role;
