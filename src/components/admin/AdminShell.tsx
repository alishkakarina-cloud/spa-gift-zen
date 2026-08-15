import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";

/**
 * Внутренний рабочий инструмент — без фирменной айдентики сайта, обычная
 * простая тёмная админка на нейтральных цветах Tailwind. Задача явно
 * говорит: "не нужно визуальных изысков, но должен быть удобным".
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ok" | "anon">("checking");
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d: { authenticated: boolean }) => {
        if (cancelled) return;
        if (d.authenticated) {
          setStatus("ok");
        } else {
          setStatus("anon");
          void navigate({ to: "/admin/login" });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("anon");
          void navigate({ to: "/admin/login" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (status !== "ok") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Проверяем доступ…
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    void navigate({ to: "/admin/login" });
  };

  const linkClass =
    "rounded px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors [&.active]:bg-zinc-800 [&.active]:text-white";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-3 text-sm font-semibold tracking-wide text-zinc-400">RAI THAI · admin</span>
            <Link to="/admin" className={linkClass}>
              Заказы
            </Link>
            <Link to="/admin/services" className={linkClass}>
              Услуги
            </Link>
            <Link to="/admin/menu" className={linkClass}>
              SPA-меню
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Выйти
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
