import { createFileRoute } from "@tanstack/react-router";
import { getAdminSession } from "@/lib/admin-session";

type LoginBody = { username?: unknown; password?: unknown };

/**
 * Простое сравнение с постоянным временем выполнения — обычное `===` на
 * секретных строках теоретически позволяет timing-атаку (чем длиннее общий
 * префикс, тем дольше сравнение). Для одной пары логин/пароль внутреннего
 * инструмента это не критично, но раз всё равно пишем — делаем правильно.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Защита от перебора пароля — 5 попыток за 15 минут на IP. Best-effort: живёт
 * в памяти одного edge-изолята (деплой на Cloudflare Workers через nitro
 * cloudflare-module preset, см. src/server.ts) — не общий счётчик на все
 * инстансы/регионы, изолят может пересоздаться и сбросить счётчик раньше
 * срока. Для единственной пары логин/пароль внутреннего инструмента этого
 * достаточно, чтобы сбить массовый автоматический перебор; не защита от
 * целенаправленной распределённой атаки (для неё нужно внешнее хранилище
 * состояния, которого в проекте пока нет).
 */
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  return entry !== undefined && Date.now() < entry.resetAt && entry.count >= LOGIN_ATTEMPT_LIMIT;
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_ATTEMPT_WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = clientIp(request);
        if (isRateLimited(ip)) {
          return Response.json({ error: "too_many_attempts" }, { status: 429 });
        }

        let body: LoginBody;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const username = typeof body.username === "string" ? body.username : "";
        const password = typeof body.password === "string" ? body.password : "";

        const expectedUsername = process.env["ADMIN_USERNAME"];
        const expectedPassword = process.env["ADMIN_PASSWORD"];
        if (!expectedUsername || !expectedPassword) {
          console.error("ADMIN_USERNAME / ADMIN_PASSWORD are not configured as server env vars.");
          return Response.json({ error: "admin_not_configured" }, { status: 500 });
        }

        const ok =
          timingSafeEqual(username, expectedUsername) && timingSafeEqual(password, expectedPassword);
        if (!ok) {
          recordFailedAttempt(ip);
          return Response.json({ error: "invalid_credentials" }, { status: 401 });
        }
        loginAttempts.delete(ip);

        let session: Awaited<ReturnType<typeof getAdminSession>>;
        try {
          session = await getAdminSession();
        } catch (err) {
          console.error("Admin session is not configured:", err);
          return Response.json({ error: "admin_not_configured" }, { status: 500 });
        }
        await session.update({ authenticated: true, username });
        return Response.json({ ok: true });
      },
    },
  },
});
