import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Услуги — админка RAI THAI SPA" }] }),
  component: () => (
    <AdminGuard>
      <ServicesPage />
    </AdminGuard>
  ),
});

type ServiceRow = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  duration: string | null;
  price: number;
  group_name: string | null;
  photo_url: string | null;
  is_active: boolean;
};

const emptyForm = {
  name: "",
  description: "",
  duration: "",
  price: "",
  groupName: "",
  photoUrl: "",
  isActive: true,
};

/**
 * ВАЖНО: эта таблица — самостоятельное хранилище для админки, витрина
 * сайта (/#services, шаг 1 оформления) продолжает читать услуги из
 * src/data/catalog.ts. Изменения здесь пока НЕ попадают на публичный
 * сайт — это осознанное ограничение первого захода (см. отчёт), полная
 * миграция витрины на БД — отдельная более крупная задача.
 */
function ServicesPage() {
  const [rows, setRows] = useState<ServiceRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/services");
    if (!res.ok) {
      setError("Не удалось загрузить список услуг.");
      return;
    }
    const data = (await res.json()) as { services: ServiceRow[] };
    setRows(data.services);
  };

  useEffect(() => {
    void load();
  }, []);

  const startEdit = (row: ServiceRow) => {
    setEditingId(row.id);
    setForm({
      name: row.name,
      description: row.description ?? "",
      duration: row.duration ?? "",
      price: String(row.price),
      groupName: row.group_name ?? "",
      photoUrl: row.photo_url ?? "",
      isActive: row.is_active,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price < 0) {
      setError("Укажите название и корректную цену.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration: form.duration.trim() || null,
        price,
        groupName: form.groupName.trim() || null,
        photoUrl: form.photoUrl.trim() || null,
        isActive: form.isActive,
      };
      const res = await fetch(editingId ? `/api/admin/services/${editingId}` : "/api/admin/services", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError("Не удалось сохранить услугу.");
        return;
      }
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Удалить услугу?")) return;
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Не удалось удалить услугу.");
      return;
    }
    if (editingId === id) resetForm();
    await load();
  };

  const toggleActive = async (row: ServiceRow) => {
    const res = await fetch(`/api/admin/services/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.is_active }),
    });
    if (!res.ok) {
      setError("Не удалось изменить видимость услуги.");
      return;
    }
    if (editingId === row.id) setForm((f) => ({ ...f, isActive: !row.is_active }));
    await load();
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Услуги</h1>
      <p className="mt-2 max-w-2xl text-sm text-amber-400/90">
        Список ниже хранится отдельно и пока не влияет на публичный каталог сайта (там используется
        уже утверждённый прайс) — это база для управления услугами из админки, вывод на сайт живых
        изменений отсюда — следующий шаг.
      </p>

      <form onSubmit={submit} className="mt-6 grid max-w-2xl gap-3 rounded border border-zinc-800 p-4 sm:grid-cols-2">
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Название"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 sm:col-span-2"
        />
        <input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Описание"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500 sm:col-span-2"
        />
        <input
          value={form.duration}
          onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
          placeholder="Длительность (например «60 мин»)"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <input
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          placeholder="Цена, ₸"
          inputMode="numeric"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <input
          value={form.groupName}
          onChange={(e) => setForm((f) => ({ ...f, groupName: e.target.value }))}
          placeholder="Категория"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <input
          value={form.photoUrl}
          onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
          placeholder="Ссылка на фото"
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <label className="flex items-center gap-2 text-sm text-zinc-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900"
          />
          Показывать (снимите галочку, чтобы временно скрыть услугу)
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {editingId ? "Сохранить изменения" : "Добавить услугу"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Отменить
            </button>
          )}
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded border border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">Название</th>
              <th className="px-3 py-2 font-medium">Категория</th>
              <th className="px-3 py-2 font-medium">Длительность</th>
              <th className="px-3 py-2 font-medium">Цена</th>
              <th className="px-3 py-2 font-medium">Видимость</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows === null && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Загрузка…
                </td>
              </tr>
            )}
            {rows?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Пока нет ни одной услуги в этом списке.
                </td>
              </tr>
            )}
            {rows?.map((r) => (
              <tr key={r.id} className={`hover:bg-zinc-900/60 ${!r.is_active ? "opacity-50" : ""}`}>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-zinc-400">{r.group_name ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-400">{r.duration ?? "—"}</td>
                <td className="px-3 py-2">{r.price.toLocaleString("ru-RU")} ₸</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(r)}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      r.is_active ? "bg-emerald-950 text-emerald-400" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {r.is_active ? "Показана" : "Скрыта"}
                  </button>
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => startEdit(r)} className="text-zinc-400 hover:text-zinc-100">
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="ml-3 text-red-400/80 hover:text-red-400"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
