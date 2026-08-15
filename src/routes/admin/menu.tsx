import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({ meta: [{ title: "SPA-меню — админка RAI THAI SPA" }] }),
  component: () => (
    <AdminGuard>
      <MenuPage />
    </AdminGuard>
  ),
});

function MenuPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus("saving");
    setErrorDetail(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/menu", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string; detail?: string } | null;
        setErrorDetail(
          body?.error === "upload_failed"
            ? `Не удалось загрузить файл в хранилище (${body.detail ?? "неизвестная ошибка"}). Проверьте, что в Supabase создан публичный bucket "site-assets".`
            : "Не удалось сохранить файл.",
        );
        setStatus("error");
        return;
      }
      setStatus("ok");
      setFile(null);
    } catch {
      setStatus("error");
      setErrorDetail("Не удалось связаться с сервером.");
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">SPA-меню</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Загрузите новый PDF — кнопка «Скачать SPA-меню» на сайте сразу начнёт вести на него, без участия
        разработчика.
      </p>

      <form onSubmit={submit} className="mt-6 rounded border border-zinc-800 p-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900"
        />
        <button
          type="submit"
          disabled={!file || status === "saving"}
          className="mt-4 rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "saving" ? "Загружаем…" : "Заменить меню"}
        </button>
        {status === "ok" && <p className="mt-3 text-sm text-emerald-400">Готово, меню заменено.</p>}
        {status === "error" && <p className="mt-3 text-sm text-red-400">{errorDetail}</p>}
      </form>
    </div>
  );
}
