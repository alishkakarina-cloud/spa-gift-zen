import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CertificateCard } from "@/components/CertificateCard";
import { Motif } from "@/components/Motif";
import logoLight from "@/assets/logo-light.png";
import {
  MIN_AMOUNT,
  designs,
  fixedAmounts,
  formatPrice,
  services,
} from "@/data/catalog";

export const Route = createFileRoute("/certificate")({
  head: () => ({
    meta: [
      { title: "Оформить подарочный сертификат — Rai Thai Spa" },
      {
        name: "description",
        content:
          "Выберите сертификат Rai Thai Spa на услугу или на сумму, оформление и дизайн, данные получателя и оплатите онлайн. Сертификат выдаётся автоматически.",
      },
      { property: "og:title", content: "Оформить подарочный сертификат — Rai Thai Spa" },
      {
        property: "og:description",
        content:
          "Сертификат на тайский массаж или SPA-программу. Оформление за 2 минуты, мгновенная выдача.",
      },
    ],
  }),
  component: CertificateFlow,
});

type Kind = "service" | "amount";
type Step = 1 | 2 | 3 | 4 | 5 | 6;

const steps = ["Сертификат", "Дизайн", "Данные", "Проверка", "Оплата", "Готово"];

function CertificateFlow() {
  const [step, setStep] = useState<Step>(1);
  const [kind, setKind] = useState<Kind>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");
  const [designId, setDesignId] = useState(designs[0]!.id);
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sendMode, setSendMode] = useState<"now" | "later">("now");
  const [sendAt, setSendAt] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const design = designs.find((d) => d.id === designId)!;
  const service = services.find((s) => s.id === serviceId) ?? null;
  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const total = kind === "service" ? (service?.price ?? 0) : effectiveAmount;
  const valueLabel =
    kind === "service" && service ? service.name : formatPrice(total || 0);

  const number = useMemo(
    () => "RT-" + Math.random().toString(36).slice(2, 7).toUpperCase() + "-" + new Date().getFullYear(),
    [],
  );

  const validateStep1 = () => {
    if (kind === "service" && !service) return ["Выберите услугу"];
    if (kind === "amount" && (!total || total < MIN_AMOUNT))
      return [`Минимальная сумма сертификата — ${formatPrice(MIN_AMOUNT)}`];
    return [];
  };

  const validateStep3 = () => {
    const e: string[] = [];
    if (!sender.trim()) e.push("Укажите имя отправителя");
    if (!recipient.trim()) e.push("Укажите имя получателя");
    if (contactType === "phone" && !/^[+()\d\s-]{10,}$/.test(contact))
      e.push("Укажите корректный телефон получателя");
    if (contactType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact))
      e.push("Укажите корректный e-mail получателя");
    if (sendMode === "later" && !sendAt) e.push("Выберите дату и время отправки");
    return e;
  };

  const next = () => {
    const e = step === 1 ? validateStep1() : step === 3 ? validateStep3() : [];
    setErrors(e);
    if (e.length === 0) setStep((s) => Math.min(6, s + 1) as Step);
  };

  const back = () => {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between">
        <Link to="/" aria-label="RaiThai Massage & Spa — на главную">
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            className="h-12 w-auto"
          />
        </Link>
        <span className="text-[0.65rem] tracking-[0.28em] text-cream/50 uppercase">
          Шаг {step} из 6 · {steps[step - 1]}
        </span>
      </header>

      <div className="mt-6 flex gap-1">
        {steps.map((s, i) => (
          <span
            key={s}
            className={`h-px flex-1 ${i < step ? "bg-gold" : "bg-border"}`}
          />
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
        <section>
          {step === 1 && (
            <div>
              <h1 className="font-display text-3xl">Выберите сертификат</h1>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Choice
                  active={kind === "service"}
                  title="На любую услугу"
                  desc="Массаж или SPA-программа на выбор"
                  onClick={() => setKind("service")}
                />
                <Choice
                  active={kind === "amount"}
                  title="На сумму"
                  desc={`От ${formatPrice(MIN_AMOUNT)}`}
                  onClick={() => setKind("amount")}
                />
              </div>

              {kind === "service" ? (
                <div className="mt-10 space-y-8">
                  {(["massage", "spa"] as const).map((group) => (
                    <div key={group}>
                      <div className="flex items-center gap-3">
                        <Motif
                          name={group === "massage" ? "paisleyDrop" : "offeringBowl"}
                          className="h-5 w-5 text-gold"
                        />
                        <p className="eyebrow">
                          {group === "massage" ? "Массаж" : "SPA-программы"}
                        </p>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {services
                          .filter((s) => s.group === group)
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setServiceId(s.id)}
                              className={`surface flex flex-col gap-2 p-5 text-left transition-colors ${serviceId === s.id ? "border-gold" : "hover:border-gold/60"}`}
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-3">
                                <span className="font-display text-xl">{s.name}</span>
                                <span className="text-sm text-gold">
                                  {formatPrice(s.price)}
                                </span>
                              </div>
                              <span className="text-[0.65rem] tracking-[0.2em] text-cream/50 uppercase">
                                {s.duration}
                              </span>
                              <span className="text-sm leading-relaxed text-cream/70">
                                {s.description}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10">
                  <div className="flex items-center gap-3">
                    <Motif name="petalDiamond" className="h-5 w-5 text-gold" />
                    <p className="eyebrow">Сумма сертификата</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {fixedAmounts.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          setAmount(a);
                          setCustomAmount("");
                        }}
                        className={`border px-6 py-3 text-sm transition-colors ${!customAmount && amount === a ? "border-gold text-gold" : "border-border text-cream/75 hover:border-gold/60"}`}
                      >
                        {formatPrice(a)}
                      </button>
                    ))}
                  </div>
                  <label className="mt-6 block max-w-xs">
                    <span className="text-xs text-cream/60">Своя сумма, ₸</span>
                    <input
                      type="number"
                      min={MIN_AMOUNT}
                      step={1000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="20000"
                      className="mt-2 w-full border border-input bg-transparent px-4 py-3 text-sm outline-none focus:border-gold"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-3xl">Выберите дизайн сертификата</h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/65">
                Каждое оформление собрано в фирменной айдентике RaiThai — плотные
                текстуры, золотая рамка и логотип салона.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {designs.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDesignId(d.id)}
                    className={`border p-1.5 text-left transition-colors ${designId === d.id ? "border-gold" : "border-border/40 hover:border-gold/60"}`}
                  >
                    <CertificateCard design={d} valueLabel={valueLabel} compact />
                    <span
                      className={`block px-3 py-3 text-[0.68rem] tracking-[0.28em] uppercase ${designId === d.id ? "text-gold" : "text-cream/65"}`}
                    >
                      {d.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-xl">
              <h1 className="font-display text-3xl">Данные сертификата</h1>
              <div className="mt-8 grid gap-5">
                <Field label="Ваше имя (от кого)">
                  <input
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    maxLength={60}
                    className="input"
                  />
                </Field>
                <Field label="Имя получателя">
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    maxLength={60}
                    className="input"
                  />
                </Field>
                <div>
                  <div className="flex gap-2">
                    {(["phone", "email"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setContactType(t)}
                        className={`border px-4 py-2 text-xs tracking-[0.2em] uppercase transition-colors ${contactType === t ? "border-gold text-gold" : "border-border text-cream/60"}`}
                      >
                        {t === "phone" ? "Телефон" : "E-mail"}
                      </button>
                    ))}
                  </div>
                  <Field label={contactType === "phone" ? "Телефон получателя" : "E-mail получателя"}>
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      maxLength={80}
                      placeholder={contactType === "phone" ? "+7 700 000 00 00" : "name@mail.com"}
                      className="input"
                    />
                  </Field>
                </div>
                <Field label="Поздравительный текст">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={400}
                    rows={4}
                    className="input resize-none"
                  />
                </Field>
                <div>
                  <p className="text-xs text-cream/60">Дата отправки</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["now", "later"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSendMode(m)}
                        className={`border px-4 py-2 text-xs tracking-[0.2em] uppercase transition-colors ${sendMode === m ? "border-gold text-gold" : "border-border text-cream/60"}`}
                      >
                        {m === "now" ? "Отправить сразу" : "Выбрать дату"}
                      </button>
                    ))}
                  </div>
                  {sendMode === "later" && (
                    <input
                      type="datetime-local"
                      value={sendAt}
                      onChange={(e) => setSendAt(e.target.value)}
                      className="input mt-3 max-w-xs"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-xl">
              <h1 className="font-display text-3xl">Проверьте заказ</h1>
              <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
                <Row k="Сертификат" v={kind === "service" ? service!.name : "На сумму"} />
                {kind === "service" && <Row k="Длительность" v={service!.duration} />}
                <Row k="Оформление" v={design.title} />
                <Row k="Сумма" v={formatPrice(total)} />
                <Row k="От кого" v={sender} />
                <Row k="Получатель" v={recipient} />
                <Row k={contactType === "phone" ? "Телефон" : "E-mail"} v={contact} />
                <Row
                  k="Отправка"
                  v={sendMode === "now" ? "Сразу после оплаты" : new Date(sendAt).toLocaleString("ru-RU")}
                />
                {message && <Row k="Пожелание" v={message} />}
              </dl>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-md">
              <h1 className="font-display text-3xl">Оплата</h1>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                Отсканируйте QR-код в приложении Kaspi.kz и подтвердите платёж на{" "}
                <span className="text-gold">{formatPrice(total)}</span>. Сертификат
                сформируется автоматически.
              </p>
              <div className="surface mt-8 flex flex-col items-center gap-4 p-8">
                <div className="grid h-40 w-40 grid-cols-8 grid-rows-8 gap-[2px] bg-cream p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <span
                      key={i}
                      className={(i * 7) % 3 === 0 ? "bg-forest-deep" : "bg-transparent"}
                    />
                  ))}
                </div>
                <p className="text-[0.65rem] tracking-[0.28em] text-cream/50 uppercase">
                  Kaspi QR · демо-режим
                </p>
              </div>
              <p className="mt-4 text-xs text-cream/50">
                Приём платежей Kaspi подключается после получения доступа к Kaspi Pay
                API. Сейчас шаг работает в тестовом режиме.
              </p>
            </div>
          )}

          {step === 6 && (
            <div>
              <Motif name="flowerBurst" className="h-12 w-12 text-gold" />
              <p className="eyebrow mt-4">Оплачено</p>
              <h1 className="mt-4 font-display text-3xl">Сертификат готов</h1>
              <p className="mt-3 text-sm text-cream/70">
                Номер сертификата — {number}.{" "}
                {sendMode === "now"
                  ? "Отправлен получателю."
                  : `Будет отправлен ${new Date(sendAt).toLocaleString("ru-RU")}.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-gold"
                >
                  Скачать сертификат
                </button>
                <Link
                  to="/"
                  className="btn-ghost"
                >
                  На главную
                </Link>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <ul className="mt-6 space-y-1 text-sm text-destructive">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          {step < 6 && (
            <div className="mt-10 flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="btn-ghost"
                >
                  Назад
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="btn-gold"
              >
                {step === 4 ? "Оплатить" : step === 5 ? "Я оплатил" : "Далее"}
              </button>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-10">
          <CertificateCard
            design={design}
            valueLabel={valueLabel}
            recipient={recipient || undefined}
            sender={sender || undefined}
            message={message || undefined}
            number={step === 6 ? number : undefined}
          />
          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
            <span className="text-cream/60">К оплате</span>
            <span className="font-display text-2xl text-gold">
              {formatPrice(total || 0)}
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Choice({
  active,
  title,
  desc,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`surface p-6 text-left transition-colors ${active ? "border-gold" : "hover:border-gold/60"}`}
    >
      <span className="block font-display text-2xl">{title}</span>
      <span className="mt-2 block text-sm text-cream/65">{desc}</span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-cream/60">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-6 py-3">
      <dt className="text-cream/55">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
