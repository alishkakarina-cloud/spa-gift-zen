import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { AdminGuard } from "@/components/admin/AdminShell";
import { CertificateCard } from "@/components/CertificateCard";
import { designs, formatPrice } from "@/data/catalog";

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

  // Ручное подтверждение оплаты (СРОЧНАЯ ЗАДАЧА 2026-09-04) — только для
  // случая, когда реальная оплата подтверждена в личном кабинете ApiPay, а
  // вебхук по какой-то причине (например несовпадение подписи) не проставил
  // payment_status сам. confirm() — намеренно отдельный, «тяжёлый» шаг, не
  // рядом со STATUS_OPTIONS выше: это не рутинная правка, а обход обычного
  // потока, ошибиться тут дороже.
  const [markingPaid, setMarkingPaid] = useState(false);
  const markPaidManually = async () => {
    if (
      !window.confirm(
        "Подтвердите: вы ЛИЧНО проверили в кабинете ApiPay, что этот платёж реально прошёл (по сумме и времени). Пометить заказ оплаченным вручную?",
      )
    ) {
      return;
    }
    setMarkingPaid(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markPaidManually: true }),
      });
      if (!res.ok) {
        setError("Не удалось подтвердить оплату.");
        return;
      }
      await load();
    } finally {
      setMarkingPaid(false);
    }
  };

  // Генерация файла сертификата тем же способом, что и на самом сайте
  // (html-to-image поверх CertificateCard) — доступно только когда
  // payment_status реально "paid", это и есть готовый файл для отправки
  // клиенту вручную (Блок 1 задачи).
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const design = cert ? (designs.find((d) => d.id === cert.design_id) ?? designs[0]!) : null;
  const downloadCertificate = async () => {
    if (!certRef.current || !cert) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f4efe6",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `raithai-sertifikat-${cert.certificate_number}.png`;
      a.click();
    } finally {
      setDownloading(false);
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

          {cert.payment_status !== "paid" && (
            <div className="mt-4 rounded border border-amber-800 bg-amber-950/40 p-4">
              <p className="text-sm text-amber-200">
                Оплата не подтверждена автоматически. Перед ручным подтверждением
                проверьте реальный платёж в личном кабинете ApiPay — только после
                этого используйте кнопку ниже.
              </p>
              <button
                type="button"
                disabled={markingPaid}
                onClick={markPaidManually}
                className="mt-3 rounded border border-amber-600 px-3 py-1.5 text-sm text-amber-100 transition-colors hover:border-amber-400 disabled:cursor-default disabled:opacity-60"
              >
                {markingPaid ? "Подтверждаем…" : "Подтвердить оплату вручную"}
              </button>
            </div>
          )}

          {cert.payment_status === "paid" && design && (
            <div className="mt-5">
              <button
                type="button"
                disabled={downloading}
                onClick={downloadCertificate}
                className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-100 transition-colors hover:border-zinc-500 disabled:cursor-default disabled:opacity-60"
              >
                {downloading ? "Готовим файл…" : "Скачать сертификат"}
              </button>
              {/* Вне экрана, но не display:none — html-to-image не может
                  отрендерить элемент, который вообще не занимает места. */}
              <div className="pointer-events-none fixed top-0 left-[-9999px]" aria-hidden="true">
                <div ref={certRef} className="w-[461px]">
                  <CertificateCard
                    design={design}
                    valueLabel={formatPrice(cert.amount)}
                    items={cert.services?.map((s) => s.name)}
                    showValue={cert.certificate_type !== "service"}
                    recipient={cert.recipient_name ?? undefined}
                    message={cert.message ?? undefined}
                    number={cert.certificate_number}
                    issuedAt={new Date(cert.created_at).toLocaleDateString("ru-RU")}
                    branch={cert.branch ?? undefined}
                  />
                </div>
              </div>
            </div>
          )}

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
