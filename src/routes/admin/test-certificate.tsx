import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminGuard } from "@/components/admin/AdminShell";
import { designs, services } from "@/data/catalog";

export const Route = createFileRoute("/admin/test-certificate")({
  head: () => ({ meta: [{ title: "Тестовый сертификат — админка RAI THAI SPA" }] }),
  component: () => (
    <AdminGuard>
      <TestCertificatePage />
    </AdminGuard>
  ),
});

type Kind = "amount" | "service";

/**
 * Быстрая форма для МОПа — выдать сертификат сразу оплаченным, без реального
 * платежа через ApiPay (СТРОГАЯ ЗАДАЧА 2026-09-26). Отдельная точка входа,
 * не переиспользует /certificate: там весь визард на 5 шагов рассчитан на
 * покупателя сайта, здесь — минимум полей для внутреннего использования.
 * Помечается is_test: true на сервере (см. certificates.test-create.ts) —
 * не попадает в обычный список заказов/CSV/статистику продаж.
 */
function TestCertificatePage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<Kind>("amount");
  const [amount, setAmount] = useState("20000");
  const [serviceId, setServiceId] = useState(services[0]!.id);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [branch, setBranch] = useState<"" | "petropavlovsk" | "kokshetau">("");
  const [designId, setDesignId] = useState(designs[0]!.id);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (recipientName.trim().length === 0) {
      setError("Укажите имя получателя.");
      return;
    }
    const amountNum = Number(amount);
    if (kind === "amount" && (!Number.isInteger(amountNum) || amountNum <= 0)) {
      setError("Сумма должна быть целым числом больше нуля.");
      return;
    }

    setSubmitting(true);
    try {
      const service = services.find((s) => s.id === serviceId)!;
      const res = await fetch("/api/admin/certificates/test-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateType: kind,
          ...(kind === "amount"
            ? { amount: amountNum }
            : { services: [{ id: service.id, name: service.name, price: service.price }] }),
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim() || null,
          branch: branch || null,
          designId,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        setError("Не удалось создать тестовый сертификат. Попробуйте ещё раз.");
        return;
      }
      const data = (await res.json()) as { id: string };
      // Сразу на карточку заказа — там же кнопка "Скачать сертификат" уже
      // работает для любого payment_status: "paid" (см. admin/orders/$id.tsx),
      // отдельный экран для теста не нужен.
      void navigate({ to: "/admin/orders/$id", params: { id: data.id } });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500";
  const labelClass = "mb-1.5 block text-sm text-zinc-400";

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Тестовый сертификат</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Для МОПа — выдаёт сертификат сразу помеченным оплаченным, без реального платежа.
        Не попадает в список заказов и CSV-выгрузку по умолчанию, не влияет на статистику продаж.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5">
        <div>
          <span className={labelClass}>Тип сертификата</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind("amount")}
              className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                kind === "amount"
                  ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                  : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              На сумму
            </button>
            <button
              type="button"
              onClick={() => setKind("service")}
              className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                kind === "service"
                  ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                  : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
              }`}
            >
              На услугу
            </button>
          </div>
        </div>

        {kind === "amount" ? (
          <div>
            <label className={labelClass}>Сумма, ₸</label>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Услуга</label>
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputClass}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.price.toLocaleString("ru-RU")} ₸
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass}>Имя получателя</label>
          <input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Как указать на сертификате"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Телефон получателя (необязательно)</label>
          <input
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="Для поиска через «Мои сертификаты»"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Филиал (необязательно)</label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value as typeof branch)}
            className={inputClass}
          >
            <option value="">Не выбран</option>
            <option value="petropavlovsk">Петропавловск</option>
            <option value="kokshetau">Кокшетау</option>
          </select>
        </div>

        <div>
          <span className={labelClass}>Дизайн</span>
          <div className="flex flex-wrap gap-2">
            {designs.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDesignId(d.id)}
                className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                  designId === d.id
                    ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                    : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {d.title}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Поздравительный текст (необязательно)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 140))}
            rows={3}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
        >
          {submitting ? "Создаём…" : "Создать тестовый сертификат"}
        </button>
      </form>
    </div>
  );
}
