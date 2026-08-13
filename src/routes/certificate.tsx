import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CertificateCard } from "@/components/CertificateCard";
import { Motif, type MotifName } from "@/components/Motif";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import logoLight from "@/assets/logo-light.png";
import {
  MIN_AMOUNT,
  designs,
  fixedAmounts,
  formatPrice,
  services,
  type Service,
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
type PaymentMethod = "card" | "kaspi";

/**
 * Service groups in the order they are shown on step 1, mirroring how the
 * RaiThai price list itself is split (raithai-spa.kamiqr.com).
 */
const SERVICE_GROUPS: ReadonlyArray<{
  id: Service["group"];
  motif: MotifName;
  labelKey: string;
}> = [
  { id: "massage", motif: "paisleyDrop", labelKey: "cert.groupMassage" },
  { id: "complex", motif: "waveCrown", labelKey: "cert.groupComplex" },
  { id: "spa", motif: "offeringBowl", labelKey: "cert.groupSpa" },
  { id: "travel", motif: "templeArch", labelKey: "cert.groupTravel" },
  { id: "kids", motif: "flowerBurst", labelKey: "cert.groupKids" },
];

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatCardExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const formatCardCvv = (value: string) => value.replace(/\D/g, "").slice(0, 3);

const dateLocales = { ru: "ru-RU", kz: "kk-KZ", en: "en-GB" } as const;

function CertificateFlow() {
  const { t, lang } = useLanguage();
  const steps = translations[lang].cert.steps;
  const [step, setStep] = useState<Step>(1);
  const [kind, setKind] = useState<Kind>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");
  const [designId, setDesignId] = useState(designs[0]!.id);
  const [sender, setSender] = useState("");
  const [recipientFirstName, setRecipientFirstName] = useState("");
  const [recipientLastName, setRecipientLastName] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sendMode, setSendMode] = useState<"now" | "later">("now");
  const [sendAt, setSendAt] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  // Stable per-visit reference for the Kaspi QR demo payload below — not a real order/payment id.
  const [kaspiDemoRef] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());
  const [saving, setSaving] = useState(false);

  const design = designs.find((d) => d.id === designId)!;
  const service = services.find((s) => s.id === serviceId) ?? null;
  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const total = kind === "service" ? (service?.price ?? 0) : effectiveAmount;
  const valueLabel =
    kind === "service" && service ? t(`services.${service.id}.name`) : formatPrice(total || 0);
  const recipientFullName = [recipientFirstName, recipientLastName].filter(Boolean).join(" ").trim();

  /**
   * DEMO payload only — not a real Kaspi Pay payment request. A production
   * integration needs a backend call to the Kaspi Pay API to obtain a signed
   * payment link/QR payload for this specific order, then a webhook or
   * polling to confirm the payment before the step 5 -> 6 transition (in
   * `next`, below) can be trusted the same way `generateCertificateNumber`
   * already is for Freedom Pay.
   */
  const kaspiQrValue = `RAITHAI-DEMO;ref=${kaspiDemoRef};amount=${total}`;

  // Issued only once payment is confirmed (see `next`), not on page load.
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);

  const validateStep1 = () => {
    if (kind === "service" && !service) return [t("cert.errServiceRequired")];
    if (kind === "amount" && (!total || total < MIN_AMOUNT))
      return [t("cert.errMinAmount", { amount: formatPrice(MIN_AMOUNT) })];
    return [];
  };

  const validateStep3 = () => {
    const e: string[] = [];
    if (!sender.trim()) e.push(t("cert.errSenderRequired"));
    if (!recipientFirstName.trim()) e.push(t("cert.errRecipientRequired"));
    if (!recipientLastName.trim()) e.push(t("cert.errRecipientLastNameRequired"));
    if (contactType === "phone" && !/^[+()\d\s-]{10,}$/.test(contact))
      e.push(t("cert.errPhoneInvalid"));
    if (contactType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact))
      e.push(t("cert.errEmailInvalid"));
    if (sendMode === "later" && !sendAt) e.push(t("cert.errSendDateRequired"));
    return e;
  };

  const next = async () => {
    const e = step === 1 ? validateStep1() : step === 3 ? validateStep3() : [];
    setErrors(e);
    if (e.length > 0) return;

    if (step === 5) {
      // Payment confirmed (step 5 → 6): persist the certificate to Supabase
      // first, and only advance once that succeeds — the number shown to the
      // user is whatever the server actually saved, not a client guess.
      setSaving(true);
      try {
        const response = await fetch("/api/certificates/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            buyerName: sender,
            recipientName: recipientFullName || null,
            recipientContact: contact || null,
            paymentMethod: paymentMethod === "kaspi" ? "kaspi" : "freedom_pay",
          }),
        });
        if (!response.ok) throw new Error("save_failed");
        const data = (await response.json()) as { certificateNumber: string };
        setCertificateNumber(data.certificateNumber);
        setStep(6);
      } catch {
        setErrors([t("cert.errCertificateSaveFailed")]);
      } finally {
        setSaving(false);
      }
      return;
    }

    setStep((s) => Math.min(6, s + 1) as Step);
  };

  const back = () => {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link to="/" aria-label={t("cert.backHomeLink")}>
          <img
            src={logoLight}
            alt="RaiThai Massage & Spa"
            width={700}
            height={560}
            className="h-12 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-[0.65rem] tracking-[0.28em] text-cream/50 uppercase sm:inline">
            {t("cert.stepOf", { step, name: steps[step - 1]! })}
          </span>
          <LanguageSwitcher />
        </div>
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
              <h1 className="font-display text-3xl">{t("cert.step1Title")}</h1>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Choice
                  active={kind === "service"}
                  title={t("cert.choiceServiceTitle")}
                  desc={t("cert.choiceServiceDesc")}
                  onClick={() => setKind("service")}
                />
                <Choice
                  active={kind === "amount"}
                  title={t("cert.choiceAmountTitle")}
                  desc={t("cert.choiceAmountFrom", { amount: formatPrice(MIN_AMOUNT) })}
                  onClick={() => setKind("amount")}
                />
              </div>

              {kind === "service" ? (
                <div className="mt-10 space-y-8">
                  {SERVICE_GROUPS.map(({ id: group, motif, labelKey }) => (
                    <div key={group}>
                      <div className="flex items-center gap-3">
                        <Motif name={motif} className="h-7 w-7 text-gold" />
                        <p className="eyebrow">{t(labelKey)}</p>
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
                                <span className="font-display text-xl">
                                  {t(`services.${s.id}.name`)}
                                </span>
                                <span className="text-sm text-gold">
                                  {formatPrice(s.price)}
                                </span>
                              </div>
                              <span className="text-[0.65rem] tracking-[0.2em] text-cream/50 uppercase">
                                {t(`services.${s.id}.duration`)}
                              </span>
                              <span className="text-sm leading-relaxed text-cream/70">
                                {t(`services.${s.id}.description`)}
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
                    <Motif name="petalDiamond" className="h-7 w-7 text-gold" />
                    <p className="eyebrow">{t("cert.amountEyebrow")}</p>
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
                    <span className="text-xs text-cream/60">{t("cert.customAmountLabel")}</span>
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
              <h1 className="font-display text-3xl">{t("cert.step2Title")}</h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/65">
                {t("cert.step2Text")}
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
                      {t(`designs.${d.id}.title`)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="max-w-xl">
              <h1 className="font-display text-3xl">{t("cert.step3Title")}</h1>
              <div className="mt-8 grid gap-5">
                <Field label={t("cert.senderLabel")}>
                  <input
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    maxLength={60}
                    className="input"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-5">
                  <Field label={t("cert.recipientFirstNameLabel")}>
                    <input
                      value={recipientFirstName}
                      onChange={(e) => setRecipientFirstName(e.target.value)}
                      maxLength={60}
                      className="input"
                    />
                  </Field>
                  <Field label={t("cert.recipientLastNameLabel")}>
                    <input
                      value={recipientLastName}
                      onChange={(e) => setRecipientLastName(e.target.value)}
                      maxLength={60}
                      className="input"
                    />
                  </Field>
                </div>
                <div>
                  <div className="flex gap-2">
                    {(["phone", "email"] as const).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => setContactType(ct)}
                        className={`border px-4 py-2 text-xs tracking-[0.2em] uppercase transition-colors ${contactType === ct ? "border-gold text-gold" : "border-border text-cream/60"}`}
                      >
                        {ct === "phone" ? t("cert.contactTypePhone") : t("cert.contactTypeEmail")}
                      </button>
                    ))}
                  </div>
                  <Field
                    label={
                      contactType === "phone" ? t("cert.recipientPhoneLabel") : t("cert.recipientEmailLabel")
                    }
                  >
                    <input
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      maxLength={80}
                      placeholder={contactType === "phone" ? "+7 700 000 00 00" : "name@mail.com"}
                      className="input"
                    />
                  </Field>
                </div>
                <Field label={t("cert.messageLabel")}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={400}
                    rows={4}
                    className="input resize-none"
                  />
                </Field>
                <div>
                  <p className="text-xs text-cream/60">{t("cert.sendDateLabel")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["now", "later"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSendMode(m)}
                        className={`border px-4 py-2 text-xs tracking-[0.2em] uppercase transition-colors ${sendMode === m ? "border-gold text-gold" : "border-border text-cream/60"}`}
                      >
                        {m === "now" ? t("cert.sendNow") : t("cert.sendLater")}
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
              <h1 className="font-display text-3xl">{t("cert.step4Title")}</h1>
              <dl className="mt-8 divide-y divide-border border-y border-border text-sm">
                <Row
                  k={t("cert.rowCertificate")}
                  v={kind === "service" ? t(`services.${service!.id}.name`) : t("cert.rowByAmount")}
                />
                {kind === "service" && (
                  <Row k={t("cert.rowDuration")} v={t(`services.${service!.id}.duration`)} />
                )}
                <Row k={t("cert.rowDesign")} v={t(`designs.${design.id}.title`)} />
                <Row k={t("cert.rowAmount")} v={formatPrice(total)} />
                <Row k={t("cert.rowFrom")} v={sender} />
                <Row k={t("cert.rowRecipient")} v={recipientFullName} />
                <Row k={contactType === "phone" ? t("cert.contactTypePhone") : t("cert.contactTypeEmail")} v={contact} />
                <Row
                  k={t("cert.rowSending")}
                  v={sendMode === "now" ? t("cert.rowSendingNow") : new Date(sendAt).toLocaleString(dateLocales[lang])}
                />
                {message && <Row k={t("cert.rowWish")} v={message} />}
              </dl>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-md">
              <h1 className="font-display text-3xl">{t("cert.step5Title")}</h1>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                {(() => {
                  const [before, after] = t(
                    paymentMethod === "card" ? "cert.paymentIntro" : "cert.kaspiQrIntro",
                  ).split("{amount}");
                  return (
                    <>
                      {before}
                      <span className="text-gold">{formatPrice(total)}</span>
                      {after}
                    </>
                  );
                })()}
              </p>

              <p className="mt-6 text-[0.65rem] tracking-[0.2em] text-cream/50 uppercase">
                {t("cert.paymentMethodLabel")}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`surface flex items-center justify-between gap-3 p-5 text-left transition-colors ${paymentMethod === "card" ? "border-gold" : "hover:border-gold/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 32 24"
                      className="h-6 w-8 shrink-0 text-gold"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect x="1" y="1" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="1" y="6.5" width="30" height="3.5" fill="currentColor" />
                      <rect x="4" y="15" width="8" height="2" rx="1" fill="currentColor" opacity="0.7" />
                    </svg>
                    <span className="font-display text-lg tracking-wide">Freedom Pay</span>
                  </div>
                  <span className="text-[0.55rem] tracking-[0.2em] text-cream/45 uppercase">
                    {t("cert.paymentByCard")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("kaspi")}
                  className={`surface flex items-center justify-between gap-3 p-5 text-left transition-colors ${paymentMethod === "kaspi" ? "border-gold" : "hover:border-gold/60"}`}
                >
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-gold" fill="none" aria-hidden="true">
                      <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="15" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="2" y="15" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                      <rect x="19" y="14" width="3" height="3" fill="currentColor" />
                      <rect x="14" y="19" width="3" height="3" fill="currentColor" />
                      <rect x="19" y="19" width="3" height="3" fill="currentColor" />
                    </svg>
                    <span className="font-display text-lg tracking-wide">Kaspi QR</span>
                  </div>
                  <span className="text-[0.55rem] tracking-[0.2em] text-cream/45 uppercase">
                    {t("cert.paymentByKaspi")}
                  </span>
                </button>
              </div>

              {paymentMethod === "card" ? (
                <>
                  <div className="mt-6 grid gap-5">
                    <Field label={t("cert.cardNumberLabel")}>
                      <input
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="input"
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-5">
                      <Field label={t("cert.cardExpiryLabel")}>
                        <input
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                          placeholder="ММ/ГГ"
                          className="input"
                        />
                      </Field>
                      <Field label={t("cert.cardCvvLabel")}>
                        <input
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(formatCardCvv(e.target.value))}
                          placeholder="•••"
                          className="input"
                        />
                      </Field>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-cream/50">{t("cert.paymentNote")}</p>
                </>
              ) : (
                <>
                  <div className="surface mt-6 flex flex-col items-center gap-4 p-8">
                    <div className="bg-cream p-3">
                      <QRCodeSVG value={kaspiQrValue} size={160} bgColor="#f4efe6" fgColor="#12241b" level="M" />
                    </div>
                    <p className="text-[0.65rem] tracking-[0.28em] text-cream/50 uppercase">
                      {t("cert.kaspiQrCaption")}
                    </p>
                  </div>
                  <p className="mt-4 text-xs text-cream/50">{t("cert.kaspiQrNote")}</p>
                </>
              )}
            </div>
          )}

          {step === 6 && (
            <div>
              <Motif name="flowerBurst" className="h-16 w-16 text-gold" />
              <p className="eyebrow mt-4">{t("cert.step6Eyebrow")}</p>
              <h1 className="mt-4 font-display text-3xl">{t("cert.step6Title")}</h1>
              <p className="mt-3 text-sm text-cream/70">
                {t("cert.step6Text", {
                  number: certificateNumber ?? "",
                  status:
                    sendMode === "now"
                      ? t("cert.step6SentNow")
                      : t("cert.step6SentLater", {
                          date: new Date(sendAt).toLocaleString(dateLocales[lang]),
                        }),
                })}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-gold"
                >
                  {t("cert.downloadButton")}
                </button>
                <Link
                  to="/"
                  className="btn-ghost"
                >
                  {t("cert.backHomeLink")}
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
                  disabled={saving}
                  className="btn-ghost disabled:opacity-50"
                >
                  {t("cert.backButton")}
                </button>
              )}
              <button
                type="button"
                onClick={next}
                disabled={saving}
                className="btn-gold disabled:opacity-60"
              >
                {saving
                  ? t("cert.savingButton")
                  : step === 4
                    ? t("cert.payButton")
                    : step === 5
                      ? t("cert.paidButton")
                      : t("cert.nextButton")}
              </button>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-10">
          <CertificateCard
            design={design}
            valueLabel={valueLabel}
            recipient={recipientFullName || undefined}
            sender={sender || undefined}
            message={message || undefined}
            number={certificateNumber ?? undefined}
          />
          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
            <span className="text-cream/60">{t("cert.payTotal")}</span>
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
