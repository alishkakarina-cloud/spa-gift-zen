import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Заказы — админка RAI THAI SPA" }] }),
  component: () => (
    <AdminGuard>
      <OrdersPage />
    </AdminGuard>
  ),
});

type CertificateRow = {
  id: string;
  certificate_number: string;
  amount: number;
  certificate_type: string | null;
  buyer_name: string;
  buyer_contact: string | null;
  recipient_name: string | null;
  branch: string | null;
  payment_method: string;
  payment_status: string;
  status: "active" | "used" | "cancelled";
  created_at: string;
  services: Array<{ id: string; name: string; price: number }> | null;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Активен",
  used: "Использован",
  cancelled: "Отменён",
};

const BRANCH_LABEL: Record<string, string> = {
  petropavlovsk: "Петропавловск",
  kokshetau: "Кокшетау",
};

/** ТЗ (Блок 8): «видеть программу» — в списке заказов раньше не было видно
 *  ни состава, ни того, что это сертификат на сумму (только в карточке
 *  заказа). Показываем то же самое коротко прямо в таблице. */
function programLabel(r: Pick<CertificateRow, "certificate_type" | "services">): string {
  if (r.certificate_type === "amount") return "На сумму";
  if (r.services && r.services.length > 0) return r.services.map((s) => s.name).join(", ");
  return "—";
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Не оплачен",
  sandbox_paid: "Тест. оплата",
  paid: "Оплачен",
  failed: "Ошибка оплаты",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrdersPage() {
  const [rows, setRows] = useState<CertificateRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = async (query: string, statusFilter: string) => {
    setError(null);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/certificates?${params.toString()}`);
    if (!res.ok) {
      setError("Не удалось загрузить список заказов.");
      return;
    }
    const data = (await res.json()) as { certificates: CertificateRow[] };
    setRows(data.certificates);
  };

  useEffect(() => {
    void load("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load(q, status);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Заказы</h1>
        <a
          href="/api/admin/certificates/export"
          className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:border-zinc-500"
        >
          Выгрузить CSV
        </a>
      </div>

      <form onSubmit={submitSearch} className="mt-5 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Номер сертификата или телефон покупателя"
          className="min-w-[260px] flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        >
          <option value="">Все статусы</option>
          <option value="active">Активен</option>
          <option value="used">Использован</option>
          <option value="cancelled">Отменён</option>
        </select>
        <button
          type="submit"
          className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-opacity hover:opacity-90"
        >
          Найти
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded border border-zinc-800">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">Номер</th>
              <th className="px-3 py-2 font-medium">Дата</th>
              <th className="px-3 py-2 font-medium">Покупатель</th>
              <th className="px-3 py-2 font-medium">Получатель</th>
              <th className="px-3 py-2 font-medium">Услуга</th>
              <th className="px-3 py-2 font-medium">Филиал</th>
              <th className="px-3 py-2 font-medium">Сумма</th>
              <th className="px-3 py-2 font-medium">Оплата</th>
              <th className="px-3 py-2 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows === null && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-zinc-500">
                  Загрузка…
                </td>
              </tr>
            )}
            {rows?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-zinc-500">
                  Ничего не найдено.
                </td>
              </tr>
            )}
            {rows?.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-900/60">
                <td className="px-3 py-2">
                  <Link to="/admin/orders/$id" params={{ id: r.id }} className="text-zinc-100 underline-offset-2 hover:underline">
                    {r.certificate_number}
                  </Link>
                </td>
                <td className="px-3 py-2 text-zinc-400">{formatDate(r.created_at)}</td>
                <td className="px-3 py-2">
                  {r.buyer_name}
                  {r.buyer_contact && <div className="text-xs text-zinc-500">{r.buyer_contact}</div>}
                </td>
                <td className="px-3 py-2 text-zinc-300">{r.recipient_name ?? "—"}</td>
                <td className="px-3 py-2 text-zinc-300">{programLabel(r)}</td>
                <td className="px-3 py-2 text-zinc-400">{r.branch ? (BRANCH_LABEL[r.branch] ?? r.branch) : "—"}</td>
                <td className="px-3 py-2">{r.amount.toLocaleString("ru-RU")} ₸</td>
                <td className="px-3 py-2 text-zinc-400">{PAYMENT_STATUS_LABEL[r.payment_status] ?? r.payment_status}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      r.status === "active"
                        ? "bg-emerald-950 text-emerald-400"
                        : r.status === "used"
                          ? "bg-zinc-800 text-zinc-300"
                          : "bg-red-950 text-red-400"
                    }`}
                  >
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
