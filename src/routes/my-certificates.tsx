import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Loader2, Search } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { SiteFooter } from "@/components/SiteFooter";
import { CertificateCard } from "@/components/CertificateCard";
import { designs, formatPrice } from "@/data/catalog";

/**
 * Найти и скачать свой сертификат по номеру телефона — без регистрации
 * (СРОЧНАЯ ЗАДАЧА 2026-09-04, Блок 3). Появилась после реального случая:
 * клиентка оплатила, но сайт "завис" из-за отклонённого вебхука ApiPay —
 * этой страницы тогда не было, и получить сертификат повторно можно было
 * только через поддержку вручную. Показывает только уже ОПЛАЧЕННЫЕ
 * сертификаты (см. src/routes/api/certificates/lookup.ts) — не раскрывает
 * незавершённые заказы.
 */
export const Route = createFileRoute("/my-certificates")({
  head: () => ({
    meta: [{ title: "Мои сертификаты — Rai Thai Spa" }],
  }),
  component: MyCertificatesPage,
});

type LookupResult = {
  id: string;
  certificateNumber: string;
  amount: number;
  certificateType: string | null;
  recipientName: string | null;
  message: string | null;
  services: Array<{ id: string; name: string; price: number }> | null;
  designId: string | null;
  branch: string | null;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU");
}

function CertificateResult({ cert }: { cert: LookupResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<"saved" | "manual" | null>(null);
  const design = designs.find((d) => d.id === cert.designId) ?? designs[0]!;
  const fileName = `raithai-sertifikat-${cert.certificateNumber}.png`;

  const save = async () => {
    if (!ref.current) return;
    setBusy(true);
    setToast(null);
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f4efe6",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          setToast("saved");
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === "AbortError") return;
          // Реальный сбой шаринга — пробуем обычное скачивание как резерв, не сдаёмся.
        }
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.click();
      setToast("manual");
    } catch (err) {
      console.error("Failed to render certificate:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface flex flex-col items-center gap-4 rounded-lg p-6">
      <div ref={ref} className="w-full max-w-[280px]">
        <CertificateCard
          design={design}
          valueLabel={formatPrice(cert.amount)}
          items={cert.services?.map((s) => s.name)}
          showValue={cert.certificateType !== "service"}
          recipient={cert.recipientName ?? undefined}
          message={cert.message ?? undefined}
          number={cert.certificateNumber}
          issuedAt={formatDate(cert.createdAt)}
          branch={cert.branch ?? undefined}
        />
      </div>
      <p className="text-cream/60 text-xs">{formatDate(cert.createdAt)}</p>
      <button
        type="button"
        onClick={() => void save()}
        disabled={busy}
        className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
        {busy ? "Готовим файл…" : "Скачать сертификат"}
      </button>
      {toast === "saved" && (
        <p className="text-cream/60 text-xs">Сохранено в галерее</p>
      )}
      {toast === "manual" && (
        <p className="text-cream/60 text-xs">Файл скачан — сохраните его в галерею вручную</p>
      )}
    </div>
  );
}

function MyCertificatesPage() {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [results, setResults] = useState<LookupResult[]>([]);

  const search = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/certificates/lookup?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = (await res.json()) as { certificates: LookupResult[] };
      setResults(data.certificates);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-3xl">Мои сертификаты</h1>
      <p className="text-cream/70 mt-3 text-sm leading-relaxed">
        Введите номер телефона, который указывали при покупке — покажем ваши
        оплаченные сертификаты, их можно скачать заново в любой момент.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 700 000 00 00"
          className="input flex-1"
        />
        <button
          type="button"
          onClick={() => void search()}
          disabled={status === "loading" || phone.trim().length < 10}
          className="btn-gold inline-flex shrink-0 items-center justify-center gap-2 disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          Найти
        </button>
      </div>

      {status === "error" && (
        <p className="text-destructive mt-4 text-sm">
          Не удалось выполнить поиск, попробуйте ещё раз.
        </p>
      )}

      {status === "done" && results.length === 0 && (
        <p className="text-cream/60 mt-6 text-sm">
          Оплаченных сертификатов на этот номер не нашлось. Если платёж совсем
          недавний — подождите пару минут и попробуйте снова, либо напишите
          нам в WhatsApp.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {results.map((cert) => (
            <CertificateResult key={cert.id} cert={cert} />
          ))}
        </div>
      )}

      <SiteFooter t={t} />
    </main>
  );
}
