import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminShell";
import type { Branch } from "@/data/branches";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({ meta: [{ title: "SPA-меню — админка RAI THAI SPA" }] }),
  component: () => (
    <AdminGuard>
      <MenuPage />
    </AdminGuard>
  ),
});

const BRANCH_LABELS: Record<Branch, string> = {
  petropavlovsk: "Петропавловск",
  kokshetau: "Кокшетау",
};

function BranchMenuUpload({ branch }: { branch: Branch }) {
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
      form.append("branch", branch);
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
    <form onSubmit={submit} className="mt-6 rounded border border-zinc-800 p-4">
      <h2 className="text-sm font-medium text-zinc-200">{BRANCH_LABELS[branch]}</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-3 block w-full text-sm text-zinc-300 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900"
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
  );
}

function MenuPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">SPA-меню</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Загрузите новый PDF по каждому филиалу — кнопка «Скачать SPA-меню» на сайте сразу начнёт
        вести на него, без участия разработчика. Пока файл для филиала не загружен, кнопка ведёт на
        общее меню (или на прежний статический файл, если не загружено вообще ничего).
      </p>

      <BranchMenuUpload branch="petropavlovsk" />
      <BranchMenuUpload branch="kokshetau" />
    </div>
  );
}
