import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import { CertificateCard } from "@/components/CertificateCard";
import { Motif } from "@/components/Motif";
import { Divider } from "@/components/Divider";
import { ServiceChooser } from "@/components/ServiceChooser";
import { BRANCHES, type Branch } from "@/data/branches";
import type { CatalogGroup } from "@/data/serviceGroups";
import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { MIN_AMOUNT, designs, fixedAmounts, formatPrice } from "@/data/catalog";
import { SelectionSummary } from "@/components/SelectionSummary";
import {
  parseServiceIds,
  selectedServices,
  selectionTotal,
  serializeServiceIds,
  toggleServiceId,
} from "@/data/selection";

type CertificateSearch = {
  /**
   * Услуги, отмеченные на /catalog или на главной, — id через запятую.
   * Сертификат может содержать несколько программ, стоимость складывается.
   */
  services?: string;
  /** «Сумма» или «услуга» — какой из двух вариантов открыть на шаге 1. */
  kind?: "amount" | "service";
  /** Номинал, выбранный в коммерческом блоке главной. */
  amount?: number;
  /** Город, выбранный на главной, — подставляем в форму заказа. */
  branch?: Branch;
};

export const Route = createFileRoute("/certificate")({
  validateSearch: (search: Record<string, unknown>): CertificateSearch => {
    const out: CertificateSearch = {};
    // `service` в единственном числе — прежний формат ссылок на одну услугу.
    // Продолжаем его понимать, чтобы старые ссылки и закладки не сломались.
    const rawServices =
      typeof search["services"] === "string"
        ? search["services"]
        : typeof search["service"] === "string"
          ? search["service"]
          : "";
    const ids = parseServiceIds(rawServices);
    if (ids.length > 0) out.services = serializeServiceIds(ids);
    if (search["kind"] === "amount" || search["kind"] === "service") out.kind = search["kind"];
    const amount = Number(search["amount"]);
    if (Number.isFinite(amount) && amount > 0) out.amount = amount;
    if (search["branch"] === "petropavlovsk" || search["branch"] === "kokshetau")
      out.branch = search["branch"];
    return out;
  },
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
/** 1 — выбор, 2 — дизайн, 3 — оформление со сводкой, 4 — оплата, 5 — готово. */
type Step = 1 | 2 | 3 | 4 | 5;
/** Арка на бланке маленькая — длинный текст туда физически не влезает. */
const MESSAGE_MAX_LENGTH = 140;
/** FAQ из официального ТЗ (блок 18) — 9 вопросов, ключи home.faq1Q..faq9A. */
const FAQ_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

function CertificateFlow() {
  const { t, lang } = useLanguage();
  const {
    services: presetServices,
    kind: presetKind,
    amount: presetAmount,
    branch: presetBranch,
  } = Route.useSearch();
  // Пришли с /catalog или из коммерческого блока главной — открываем шаг 1
  // сразу на нужном варианте и с отмеченными услугами либо номиналом.
  const presetIds = parseServiceIds(presetServices);
  const presetFirst = selectedServices(presetIds)[0] ?? null;
  const steps = translations[lang].cert.steps;
  // Пришли с готовым выбором («Подарить» под сводкой) — пропускаем только
  // экран выбора услуги/суммы (шаг 1), а не весь путь целиком. Шаг 2
  // (дизайн сертификата) пользователь должен увидеть всегда — раньше здесь
  // стояло `? 3 : 1`, и так как почти все ссылки на сайте уже несут
  // предвыбор (из hero, каталога, карточек услуг), шаг дизайна фактически
  // никогда не показывался.
  const hasPreset = Boolean(presetIds.length > 0 || presetAmount);
  const [step, setStep] = useState<Step>(hasPreset ? 2 : 1);

  /**
   * Переключение шага (next/back) — это setStep, а не переход по роуту, URL
   * не меняется. Встроенный scrollRestoration роутера тут ни при чём: он
   * реагирует только на навигацию между страницами (там всё уже работает
   * штатно), а между шагами скролл раньше оставался как есть. Из-за этого
   * при переходе с длинного шага 1 (полный список услуг) на короткий шаг 2/3
   * браузер зажимал scrollY у нижней границы новой, более короткой страницы —
   * пользователя визуально бросало к футеру/FAQ, а не к началу формы.
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  const [kind, setKind] = useState<Kind>(presetKind ?? (presetAmount ? "amount" : "service"));
  const [groupId, setGroupId] = useState<CatalogGroup>(presetFirst?.group ?? "massage");
  const [serviceIds, setServiceIds] = useState<string[]>(presetIds);
  const [amount, setAmount] = useState<number>(presetAmount ?? fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");
  const [designId, setDesignId] = useState(designs[0]!.id);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [forSelf, setForSelf] = useState(false);
  const [sender, setSender] = useState("");
  const [recipientFirstName, setRecipientFirstName] = useState("");
  const [recipientLastName, setRecipientLastName] = useState("");
  const [message, setMessage] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  // Stable per-visit reference for the Kaspi QR demo payload below — not a real order/payment id.
  const [kaspiDemoRef] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());
  const [saving, setSaving] = useState(false);

  const design = designs.find((d) => d.id === designId)!;
  const chosen = selectedServices(serviceIds);
  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const total = kind === "service" ? selectionTotal(serviceIds) : effectiveAmount;
  // На бланке сертификата состав печатается списком названий; сертификат на
  // сумму — одной строкой с номиналом.
  const cardItems =
    kind === "service" && chosen.length > 0
      ? chosen.map((s) => t(`services.${s.id}.name`))
      : undefined;
  const valueLabel = formatPrice(total || 0);
  // «Покупаю для себя» — получатель и отправитель берутся из данных покупателя.
  // У получателя — имя и фамилия (оба поля), у покупателя — только имя.
  const recipientFullName = (
    forSelf ? buyerName : `${recipientFirstName} ${recipientLastName}`.trim()
  ).trim();
  const senderName = (forSelf ? buyerName : sender).trim();
  // Город приходит из сценария покупки и на этом шаге не меняется. Если
  // пользователь попал сюда прямой ссылкой, минуя выбор, — не подставляем
  // филиал молча, а честно показываем, что он не выбран.
  const branch = presetBranch ?? null;
  const branchInfo = branch ? BRANCHES.find((b) => b.id === branch) : undefined;
  const branchLabel = branchInfo ? t(branchInfo.labelKey) : t("cert.branchNotChosen");

  /**
   * DEMO payload only — not a real Kaspi Pay payment request. A production
   * integration needs a backend call to the Kaspi Pay API to obtain a signed
   * payment link/QR payload for this specific order, then a webhook or
   * polling to confirm the payment before the step 4 -> 5 transition (in
   * `next`, below) can be trusted.
   */
  const kaspiQrValue = `RAITHAI-DEMO;ref=${kaspiDemoRef};amount=${total}`;

  // Issued only once payment is confirmed (see `next`), not on page load.
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);

  // Карточка сертификата на шаге 5 — узел, с которого рендерим PNG для
  // скачивания на телефон и для «Отправить в WhatsApp» (тот же файл, чтобы
  // не собирать картинку дважды по-разному).
  const certificateCardRef = useRef<HTMLDivElement>(null);
  const [preparingImage, setPreparingImage] = useState<"download" | "whatsapp" | null>(null);

  const certificateFileName = `raithai-sertifikat-${certificateNumber ?? "spa"}.png`;

  /**
   * pixelRatio: 2 — карточка компактная (457×915 у.е.), без масштабирования
   * картинка получалась бы слишком мелкой для печати/шаринга. cacheBust
   * нужен, т.к. фон дизайна — imported-ассет с хэшем в имени, без него
   * html-to-image иногда кэширует старый кадр между разными дизайнами.
   */
  const renderCertificatePng = async () => {
    if (!certificateCardRef.current) return null;
    return toPng(certificateCardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#f4efe6",
    });
  };

  const downloadCertificateImage = async () => {
    setPreparingImage("download");
    try {
      const dataUrl = await renderCertificatePng();
      if (!dataUrl) return;
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = certificateFileName;
      a.click();
    } catch (err) {
      console.error("Failed to render certificate image:", err);
      setErrors([t("cert.errImageFailed")]);
    } finally {
      setPreparingImage(null);
    }
  };

  /**
   * Веб-версии WhatsApp (в отличие от мобильного приложения) нельзя передать
   * готовый файл через wa.me-ссылку — там принимается только текст. Поэтому
   * поведение по устройствам разное:
   *  - Есть Web Share API с поддержкой файлов (большинство мобильных
   *    браузеров, включая мобильный Safari/Chrome) — открывается системный
   *    шаринг, где WhatsApp обычно есть в списке получателей, картинка
   *    уходит как вложение.
   *  - Нет поддержки файлового Web Share (десктоп) — картинка скачивается
   *    на диск, а следом открывается wa.me с текстом-подсказкой, чтобы
   *    пользователь сам прикрепил уже скачанный файл в чате.
   */
  const shareCertificateToWhatsApp = async () => {
    setPreparingImage("whatsapp");
    try {
      const dataUrl = await renderCertificatePng();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], certificateFileName, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: t("cert.whatsappShareText") });
        return;
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = certificateFileName;
      a.click();
      window.open(
        `https://wa.me/?text=${encodeURIComponent(t("cert.whatsappShareText"))}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (err) {
      // AbortError — пользователь сам закрыл системное окно шаринга, это не ошибка.
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Failed to share certificate:", err);
      setErrors([t("cert.errImageFailed")]);
    } finally {
      setPreparingImage(null);
    }
  };

  const validateStep1 = () => {
    if (kind === "service" && chosen.length === 0) return [t("cert.errServiceRequired")];
    if (kind === "amount" && (!total || total < MIN_AMOUNT))
      return [t("cert.errMinAmount", { amount: formatPrice(MIN_AMOUNT) })];
    return [];
  };

  const validateStep3 = () => {
    const e: string[] = [];
    if (!buyerName.trim()) e.push(t("cert.errBuyerNameRequired"));
    if (!/^[+()\d\s-]{10,}$/.test(buyerPhone)) e.push(t("cert.errBuyerPhoneRequired"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyerEmail)) e.push(t("cert.errBuyerEmailRequired"));
    if (!forSelf) {
      if (!recipientFirstName.trim()) e.push(t("cert.errRecipientRequired"));
      if (!recipientLastName.trim()) e.push(t("cert.errRecipientLastNameRequired"));
      if (!sender.trim()) e.push(t("cert.errSenderRequired"));
    }
    return e;
  };

  // Generic consent — no named/linked documents yet (see chat: legal texts
  // still pending from the owner), so this only confirms "I agree to the
  // terms of service", not five specific policies like layan.kz does.
  const validateStep4 = () => (consentAccepted ? [] : [t("cert.errConsentRequired")]);

  const next = async () => {
    const e =
      step === 1
        ? validateStep1()
        : step === 3
          ? validateStep3()
          : step === 4
            ? validateStep4()
            : [];
    setErrors(e);
    if (e.length > 0) return;

    if (step === 4) {
      // Payment confirmed (step 4 → 5): persist the certificate to Supabase
      // first, and only advance once that succeeds — the number shown to the
      // user is whatever the server actually saved, not a client guess.
      setSaving(true);
      try {
        const response = await fetch("/api/certificates/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            certificateType: kind,
            buyerName,
            buyerContact: [buyerPhone, buyerEmail].filter(Boolean).join(" · ") || null,
            recipientName: recipientFullName || null,
            recipientContact: null,
            branch: branchInfo ? branchLabel : null,
            paymentMethod: "kaspi",
            designId,
            message: message.trim() || null,
            // Состав сертификата на момент покупки — раньше нигде не
            // сохранялся, хотя форма его собирает (chosen).
            services:
              kind === "service" && chosen.length > 0
                ? chosen.map((s) => ({
                    id: s.id,
                    name: t(`services.${s.id}.name`),
                    price: s.price,
                  }))
                : null,
          }),
        });
        if (!response.ok) throw new Error("save_failed");
        const data = (await response.json()) as { certificateNumber: string };
        setCertificateNumber(data.certificateNumber);
        setStep(5);
      } catch {
        setErrors([t("cert.errCertificateSaveFailed")]);
      } finally {
        setSaving(false);
      }
      return;
    }

    setStep((s) => Math.min(5, s + 1) as Step);
  };

  const back = () => {
    setErrors([]);
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Прогресс-бар: ряд прямых сегментов вместо кружков со стрелками —
          по образцу layan.kz (там ряд полосок + подпись "N / всего"), но в
          нашей палитре: пройденные и активный сегмент — золотые, активный
          дополнительно светится (box-shadow), непройденные — тусклые. */}
      <div className="border-border -mx-6 border-y px-6 py-4 sm:mx-0 sm:px-0 sm:py-5">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-gold text-base">{steps[step - 1]}</span>
          <span className="text-cream/40 text-xs tracking-[0.15em]">
            {step} / {steps.length}
          </span>
        </p>
        <div className="mt-3 flex gap-1.5 sm:gap-2">
          {steps.map((s, i) => {
            const n = i + 1;
            const filled = n <= step;
            const active = n === step;
            return (
              <span
                key={s}
                aria-hidden="true"
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  filled ? "bg-gold" : "bg-cream/15"
                } ${active ? "shadow-[0_0_10px_2px_rgba(180,151,117,0.65)]" : ""}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* key={step} размонтирует и заново монтирует блок при смене шага —
            это и запускает step-fade-in заново на каждом переходе, раньше
            переключение шагов было мгновенным. */}
        <section className="min-w-0 step-fade-in" key={step}>
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
                <div className="mt-10">
                  <ServiceChooser
                    groupId={groupId}
                    onGroupChange={setGroupId}
                    selectedIds={serviceIds}
                    onToggle={(id) => {
                      setServiceIds((ids) => toggleServiceId(ids, id));
                      setErrors([]);
                    }}
                    t={t}
                  />
                  {/* Сводка выбранного — та же, что в витрине; переход к
                      оформлению делает кнопка внизу шага. */}
                  <SelectionSummary
                    ids={serviceIds}
                    onRemove={(id) => setServiceIds((ids) => toggleServiceId(ids, id))}
                    onClear={() => setServiceIds([])}
                    t={t}
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          setErrors([]);
                          setStep(2);
                        }}
                        className="btn-gold"
                      >
                        {t("cert.giftButton")}
                      </button>
                    }
                  />
                </div>
              ) : (
                <div className="mt-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Motif name="petalDiamond" className="text-gold h-7 w-7" />
                      <p className="eyebrow">{t("cert.amountEyebrow")}</p>
                    </div>
                    {/* Точка бессрочности рядом с выбором номинала. */}
                    <span className="border-gold/45 text-gold rounded-full border px-3 py-1 text-[0.62rem] tracking-[0.2em] uppercase">
                      {t("cert.endless")}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {fixedAmounts.map((a) => {
                      const active = !customAmount && amount === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            setAmount(a);
                            setCustomAmount("");
                          }}
                          aria-pressed={active}
                          className={`rounded-md border px-6 py-3 text-sm transition-colors ${active ? "border-gold bg-gold/10 text-gold" : "border-border text-cream/75 hover:border-gold/60"}`}
                        >
                          {formatPrice(a)}
                        </button>
                      );
                    })}
                  </div>
                  {/* Своя сумма подсвечивается так же, как выбранный номинал,
                      иначе клик по ней выглядит как «ничего не произошло». */}
                  <label
                    className={`mt-6 block max-w-xs rounded-md border p-4 transition-colors ${customAmount ? "border-gold bg-gold/10" : "border-border"}`}
                  >
                    <span
                      className={`text-xs transition-colors ${customAmount ? "text-gold" : "text-cream/60"}`}
                    >
                      {t("cert.customAmountLabel")}
                    </span>
                    <input
                      type="number"
                      min={MIN_AMOUNT}
                      step={1000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="20000"
                      className={`border-input mt-2 w-full border bg-transparent px-4 py-3 text-sm outline-none focus:border-gold ${customAmount ? "border-gold text-gold" : ""}`}
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
              {/* Горизонтальный ряд из 3 — на телефоне тоже, не только с sm:.
                  Раньше карточки шли в 1 колонку на мобильном (sm:grid-cols-2
                  начинал работать только от планшета) и растягивались на всю
                  высоту экрана. */}
              <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
                {designs.map((d) => (
                  // Рамка идёт впритык к фото — раньше между border и картинкой
                  // был зазор p-1.5, из-за него казалось, что фото обрезано
                  // не по рамке. overflow-hidden + один и тот же радиус на
                  // кнопке и на карточке — скругление рамки и фото совпадают.
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDesignId(d.id)}
                    className={`w-full overflow-hidden rounded-2xl border text-left transition-colors ${designId === d.id ? "border-gold" : "border-border/40 hover:border-gold/60"}`}
                  >
                    <CertificateCard design={d} valueLabel={valueLabel} items={cardItems} compact />
                    <span
                      className={`block px-1.5 py-2 text-center text-[0.52rem] leading-tight tracking-[0.08em] uppercase sm:px-3 sm:py-3 sm:text-[0.68rem] sm:tracking-[0.28em] ${designId === d.id ? "text-gold" : "text-cream/65"}`}
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
              <p className="text-cream/65 mt-3 text-sm leading-relaxed">{t("cert.step3Text")}</p>

              {/* Данные покупателя */}
              <p className="eyebrow mt-8">{t("cert.buyerSection")}</p>
              <div className="mt-4 grid gap-5">
                <Field label={t("cert.buyerNameLabel")}>
                  <input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    maxLength={80}
                    autoComplete="given-name"
                    className="input"
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("cert.buyerPhoneLabel")}>
                    <input
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      maxLength={30}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+7 700 000 00 00"
                      className="input"
                    />
                  </Field>
                  <Field label={t("cert.buyerEmailLabel")}>
                    <input
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      maxLength={80}
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@mail.com"
                      className="input"
                    />
                  </Field>
                </div>
              </div>

              {/* Данные получателя */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow">{t("cert.recipientSection")}</p>
                <label className="text-cream/70 hover:text-cream flex cursor-pointer items-center gap-2 text-sm transition-colors">
                  <input
                    type="checkbox"
                    checked={forSelf}
                    onChange={(e) => setForSelf(e.target.checked)}
                    className="accent-gold h-4 w-4"
                  />
                  {t("cert.forSelfLabel")}
                </label>
              </div>

              {forSelf ? (
                <p className="surface mt-4 rounded-md p-4 text-sm text-cream/70">
                  {t("cert.forSelfNote")}
                </p>
              ) : (
                <div className="mt-4 grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
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
                  <Field label={t("cert.senderLabel")}>
                    <input
                      value={sender}
                      onChange={(e) => setSender(e.target.value)}
                      maxLength={60}
                      className="input"
                    />
                  </Field>
                  <Field label={t("cert.messageLabel")}>
                    {/* Арка на бланке маленькая — 400 символов туда физически
                        не помещались бы даже мелким кеглем. 140 укладывается
                        в 3–4 строки и остаётся читаемым. */}
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={MESSAGE_MAX_LENGTH}
                      rows={3}
                      className="input resize-none"
                    />
                    <span className="text-cream/40 mt-1 block text-right text-[0.65rem]">
                      {message.length}/{MESSAGE_MAX_LENGTH}
                    </span>
                  </Field>
                </div>
              )}

              {/* Филиал здесь не выбирается: город указывается один раз в
                  начале сценария, на главной. Ниже он только показан в сводке. */}

              {/* Сводка перед оплатой */}
              <p className="eyebrow mt-8">{t("cert.summarySection")}</p>
              <dl className="divide-border border-border mt-4 divide-y border-y text-sm">
                <Row
                  k={t("cert.rowCertificate")}
                  v={kind === "service" ? t("cert.choiceServiceTitle") : t("cert.rowByAmount")}
                />
                {kind === "service" ? (
                  // Каждая программа — отдельной строкой со своей ценой,
                  // чтобы покупатель видел, из чего сложился итог.
                  chosen.map((s) => (
                    <Row
                      key={s.id}
                      k={t(`services.${s.id}.name`)}
                      v={formatPrice(s.price)}
                    />
                  ))
                ) : (
                  <Row k={t("cert.rowNominal")} v={formatPrice(total || 0)} />
                )}
                <Row k={t("cert.rowBranch")} v={branchLabel} />
                <Row k={t("cert.rowTotal")} v={formatPrice(total || 0)} />
              </dl>
            </div>
          )}

          {step === 4 && (
            <div className="max-w-md">
              <h1 className="font-display text-3xl">{t("cert.step5Title")}</h1>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                {(() => {
                  const [before, after] = t("cert.kaspiQrIntro").split("{amount}");
                  return (
                    <>
                      {before}
                      <span className="text-gold">{formatPrice(total)}</span>
                      {after}
                    </>
                  );
                })()}
              </p>

              <div className="surface mt-8 flex flex-col items-center gap-4 p-8">
                <div className="bg-cream p-3">
                  <QRCodeSVG value={kaspiQrValue} size={160} bgColor="#f4efe6" fgColor="#12241b" level="M" />
                </div>
                <p className="text-[0.65rem] tracking-[0.28em] text-cream/50 uppercase">
                  {t("cert.kaspiQrCaption")}
                </p>
              </div>
              <p className="mt-4 text-xs text-cream/50">{t("cert.kaspiQrNote")}</p>

              <label className="text-cream/70 hover:text-cream mt-6 flex cursor-pointer items-start gap-2.5 text-sm transition-colors">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="accent-gold mt-0.5 h-4 w-4 shrink-0"
                />
                {t("cert.consentLabel")}
              </label>
            </div>
          )}

          {step === 5 && (
            <div>
              <Motif name="flowerBurst" className="text-gold h-16 w-16 print:hidden" />
              <p className="eyebrow mt-4 print:hidden">{t("cert.step6Eyebrow")}</p>
              <h1 className="font-display mt-4 text-3xl print:hidden">{t("cert.step6Title")}</h1>
              <p className="text-cream/70 mt-3 text-sm print:hidden">
                {t("cert.step6Text", {
                  number: certificateNumber ?? "",
                  status: t("cert.step6SentNow"),
                })}
              </p>

              {/* Готовый сертификат — он же уходит на печать и на нём же
                  строится PNG для скачивания/WhatsApp (certificateCardRef). */}
              <div className="print-sheet mt-8" ref={certificateCardRef}>
                <CertificateCard
                  design={design}
                  valueLabel={valueLabel}
                  items={cardItems}
                  recipient={recipientFullName || undefined}
                  sender={senderName || undefined}
                  message={message || undefined}
                  number={certificateNumber ?? undefined}
                  branch={branchInfo ? branchLabel : undefined}
                  bookingNote={t("cert.bookingNote")}
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-3 print:hidden">
                <button
                  type="button"
                  onClick={downloadCertificateImage}
                  disabled={preparingImage !== null}
                  className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {preparingImage === "download" && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                  )}
                  {preparingImage === "download" ? t("cert.preparingButton") : t("cert.downloadButton")}
                </button>
                <button
                  type="button"
                  onClick={shareCertificateToWhatsApp}
                  disabled={preparingImage !== null}
                  className="btn-beige inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {preparingImage === "whatsapp" && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                  )}
                  {preparingImage === "whatsapp"
                    ? t("cert.preparingButton")
                    : t("cert.whatsappShareButton")}
                </button>
                <Link to="/" className="btn-ghost">
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

          {step < 5 && (
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
                className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
                {saving
                  ? t("cert.savingButton")
                  : step === 1
                    ? // Кнопка сразу после выбора суммы или программы — «Подарить».
                      t("cert.giftButton")
                    : step === 3
                      ? t("cert.payButton")
                      : step === 4
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
            items={cardItems}
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

      {/* FAQ перенесён сюда с главной — по структуре layan.kz вопросы о
          сертификате живут рядом со страницей покупки, а не на главной. */}
      <section className="relative overflow-hidden print:hidden">
        <Divider motif="dottedWave" className="pt-16 sm:pt-20" />
        <div className="relative mx-auto max-w-3xl px-0 pt-10 pb-16 sm:pt-12 sm:pb-20">
          <div className="flex items-center gap-3">
            <Motif name="waveCrown" className="text-gold h-7 w-9" />
            <p className="eyebrow">{t("home.faqEyebrow")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl">{t("home.faqTitle")}</h2>
          <div className="border-border mt-8 border-t">
            {/* Полный список из официального ТЗ (блок 18) — 9 вопросов,
                дословно. Первый открыт по умолчанию, как и раньше при одном
                вопросе; остальные — обычный аккордеон <details>.
                faq-accordion — плавное появление ответа при раскрытии (см.
                styles.css); раньше ответ показывался без анимации. */}
            {FAQ_NUMBERS.map((n) => (
              <details
                key={n}
                className="border-border faq-accordion group border-b"
                open={n === 1}
              >
                <summary className="font-display marker:content-none flex cursor-pointer items-center justify-between gap-4 py-5 text-lg">
                  {t(`home.faq${n}Q`)}
                  <span className="text-gold text-sm transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="text-cream/70 pb-5 text-sm leading-relaxed">{t(`home.faq${n}A`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
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
