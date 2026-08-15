import { useSession } from "@tanstack/react-start/server";

/**
 * Единая сессия админки поверх штатного механизма TanStack Start
 * (запечатанная/подписанная cookie, без отдельной таблицы сессий в БД).
 * Логин/пароль и секрет для подписи — только серверные переменные
 * окружения (ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET),
 * никогда не попадают в клиентский бандл (без префикса VITE_).
 *
 * ADMIN_SESSION_SECRET должен быть длиной от 32 символов — это минимум,
 * который требует `useSession` для ключа подписи/шифрования.
 */
type AdminSessionData = { authenticated?: boolean; username?: string };

function sessionSecret(): string {
  const secret = process.env["ADMIN_SESSION_SECRET"];
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured (must be a server env var, at least 32 characters long).",
    );
  }
  return secret;
}

export async function getAdminSession() {
  return useSession<AdminSessionData>({
    password: sessionSecret(),
    name: "admin",
    maxAge: 60 * 60 * 12, // 12 часов — рабочая смена администратора, не требует повторного входа весь день.
  });
}

/**
 * true, если у текущего запроса валидная сессия админки. Каждый /api/admin/*
 * хендлер должен явно проверить это первой строкой и вернуть 401 сам —
 * специально без throw-магии, чтобы не зависеть от недокументированного
 * поведения обработки исключений в server.handlers.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return session.data.authenticated === true;
}

export const unauthorizedResponse = () => Response.json({ error: "unauthorized" }, { status: 401 });
