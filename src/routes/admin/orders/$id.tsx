import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/orders/$id")({
  head: () => ({ meta: [{ title: "Заказ — админка RAI THAI SPA" }] }),
  component: () => (
    <AdminGuard>
      <OrderDetailPage />
    </AdminGuard>
  ),
});

type CertificateDetail = {
  id: string;
  certificate_number: string;
  amount: number;
  certificate_type: string | null;
  buyer_name: string;
  buyer_contact: string | null;
  recipient_name: string | null;
  recipient_contact: string | null;
  branch: string | null;
  design_id: string | null;
  message: string | null;
  services: Array<{ id: string; name: string; price: number }> | null;
  payment_method: string;
  payment_status: string;
  status: "active" | "used" | "cancelled";
  created_at: string;
};

const STATUS_OPTIONS: Array<{ value: CertificateDetail["status"]; label: string }> = [
  { value: "active", label: "Активен" },
  { value: "used", label: "Использован" },
  { value: "cancelled", label: "Отменён" },
];

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-zinc-800 py-2.5 text-sm last:border-0">
      <dt className="text-zinc-500">{k}</dt>
      <dd className="text-right text-zinc-100">{v}</dd>
    </div>
  );
}

function OrderDetailPage() {
  const { id } = Route.useParams();
  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/admin/certificates/${id}`);
    if (!res.ok) {
      setError("Заказ не найден.");
      return;
    }
    const data = (await res.json()) as { certificate: CertificateDetail };
    setCert(data.certificate);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (status: CertificateDetail["status"]) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("Не удалось изменить статус.");
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Link to="/admin" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← Все заказы
      </Link>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {!cert ? (
        <p className="mt-6 text-zinc-500">Загрузка…</p>
      ) : (
        <div className="mt-4 max-w-2xl">
          <h1 className="text-xl font-semibold">{cert.certificate_number}</h1>

          <div className="mt-5 rounded border border-zinc-800">
            <dl className="divide-y divide-zinc-800 px-4">
              <Row k="Дата" v={new Date(cert.created_at).toLocaleString("ru-RU")} />
              <Row k="Тип" v={cert.certificate_type === "amount" ? "На сумму" : "На услугу"} />
              <Row k="Сумма" v={`${cert.amount.toLocaleString("ru-RU")} ₸`} />
              <Row k="Покупатель" v={cert.buyer_name} />
              <Row k="Контакт покупателя" v={cert.buyer_contact ?? "—"} />
              <Row k="Получатель" v={cert.recipient_name ?? "—"} />
              <Row k="Контакт получателя" v={cert.recipient_contact ?? "—"} />
              <Row k="Филиал" v={cert.branch ?? "—"} />
              <Row k="Дизайн" v={cert.design_id ?? "—"} />
              <Row k="Пожелание" v={cert.message ?? "—"} />
              <Row
                k="Способ оплаты"
                v={cert.payment_method === "kaspi" ? "Kaspi QR" : "Freedom Pay"}
              />
              <Row k="Статус оплаты" v={cert.payment_status} />
            </dl>
          </div>

          {cert.services && cert.services.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-zinc-500">Состав сертификата</p>
              <ul className="mt-2 divide-y divide-zinc-800 rounded border border-zinc-800">
                {cert.services.map((s) => (
                  <li key={s.id} className="flex justify-between px-4 py-2.5 text-sm">
                    <span>{s.name}</span>
                    <span className="text-zinc-400">{s.price.toLocaleString("ru-RU")} ₸</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-zinc-500">Статус сертификата</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={saving || cert.status === opt.value}
                  onClick={() => changeStatus(opt.value)}
                  className={`rounded border px-3 py-1.5 text-sm transition-colors disabled:cursor-default ${
                    cert.status === opt.value
                      ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
