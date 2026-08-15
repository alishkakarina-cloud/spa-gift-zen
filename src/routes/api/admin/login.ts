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

export const Route = createFileRoute("/api/admin/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
          return Response.json({ error: "invalid_credentials" }, { status: 401 });
        }

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
