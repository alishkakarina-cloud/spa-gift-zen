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
import { FAQ_NUMBERS } from "@/data/faq";
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

/** Категория ошибки ApiPay (см. categorizeApipayErrorCode, src/lib/apipay.ts)
 *  -> ключ перевода. Сырой provider_error_code клиенту никогда не приходит —
 *  только эти безопасные категории (Блок 2.2: "если код ошибки понятен
 *  пользователю, например «Проверьте номер телефона»"). */
const ERROR_CATEGORY_KEY: Record<string, string> = {
  phone_not_registered: "cert.errPhoneNotRegistered",
  not_configured: "cert.errApipayNotConfigured",
  rate_limited: "cert.errRateLimited",
  validation: "cert.errPaymentValidation",
};
const payErrorMessage = (t: (path: string) => string, errorCategory?: string | null) =>
  t(errorCategory && ERROR_CATEGORY_KEY[errorCategory] ? ERROR_CATEGORY_KEY[errorCategory]! : "cert.errInvoiceCreateFailed");

type Kind = "service" | "amount";
/** 1 — выбор, 2 — оформление со сводкой, 3 — дизайн, 4 — оплата, 5 — готово.
 *  Порядок 2/3 поменян местами 2026-08-22 — сверка с layan.kz вживую
 *  подтвердила, что там данные получателя заполняются раньше выбора
 *  дизайна (см. отчёт задачи), у нас было наоборот. */
type Step = 1 | 2 | 3 | 4 | 5;
/** Арка на бланке маленькая — длинный текст туда физически не влезает. */
const MESSAGE_MAX_LENGTH = 140;
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
  // (данные покупателя/получателя, после правки 2026-08-22) пользователь
  // должен увидеть всегда — раньше здесь стояло `? 3 : 1`, и так как почти
  // все ссылки на сайте уже несут предвыбор (из hero, каталога, карточек
  // услуг), следующий за выбором шаг фактически никогда не показывался.
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
  const [buyerFirstName, setBuyerFirstName] = useState("");
  const [buyerLastName, setBuyerLastName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [forSelf, setForSelf] = useState(false);
  const [sender, setSender] = useState("");
  const [recipientFirstName, setRecipientFirstName] = useState("");
  const [recipientLastName, setRecipientLastName] = useState("");
  const [message, setMessage] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // ── Оплата (ApiPay.kz, Kaspi Pay) — шаг 4 ─────────────────────────────
  type PayChannel = "qr" | "phone";
  type InvoicePhase = "choose" | "creating" | "awaiting" | "error" | "timeout";
  const PAY_PHONE_RE = /^8\d{10}$/;
  const [payChannel, setPayChannel] = useState<PayChannel>("qr");
  // Предзаполняем из buyerPhone (шаг 2), только если он уже похож на нужный
  // формат — иначе пусто, поле обязательно проверяется отдельно (Блок 2.2).
  const [payPhone, setPayPhone] = useState("");
  // Предзаполняем из buyerPhone (шаг 2) при входе на шаг 4, только если поле
  // ещё пустое — buyerPhone на момент монтирования компонента (шаг 1) всегда
  // пуст, так что делать это в инициализаторе useState бессмысленно.
  useEffect(() => {
    if (step !== 4 || payPhone) return;
    const digits = buyerPhone.replace(/\D/g, "");
    // "+7 700 545 8008" -> 11 цифр "77005458008" (код страны "7") -> Kaspi
    // хочет "8" вместо "7"; "700 545 8008" без кода страны -> 10 цифр,
    // просто добавляем "8" спереди.
    const normalized =
      digits.length === 11 && digits.startsWith("7")
        ? `8${digits.slice(1)}`
        : digits.length === 10
          ? `8${digits}`
          : digits;
    if (PAY_PHONE_RE.test(normalized)) setPayPhone(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  const [invoicePhase, setInvoicePhase] = useState<InvoicePhase>("choose");
  const [invoiceData, setInvoiceData] = useState<{
    id: string;
    qrCode: string | null;
    payUrl: string | null;
  } | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

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
  const buyerFullName = `${buyerFirstName} ${buyerLastName}`.trim();
  // «Покупаю для себя» — получатель и отправитель берутся из данных покупателя.
  const recipientFullName = (
    forSelf ? buyerFullName : `${recipientFirstName} ${recipientLastName}`.trim()
  ).trim();
  const senderName = (forSelf ? buyerFullName : sender).trim();
  // Город приходит из сценария покупки и на этом шаге не меняется. Если
  // пользователь попал сюда прямой ссылкой, минуя выбор, — не подставляем
  // филиал молча, а честно показываем, что он не выбран.
  const branch = presetBranch ?? null;
  const branchInfo = branch ? BRANCHES.find((b) => b.id === branch) : undefined;
  const branchLabel = branchInfo ? t(branchInfo.labelKey) : t("cert.branchNotChosen");

  // Issued only once payment is confirmed (see the polling effect below), not on page load.
  const [certificateNumber, setCertificateNumber] = useState<string | null>(null);

  // Карточка сертификата на шаге 5 — узел, с которого рендерим PNG для
  // скачивания на телефон и для «Отправить в WhatsApp» (тот же файл, чтобы
  // не собирать картинку дважды по-разному).
  const certificateCardRef = useRef<HTMLDivElement>(null);
  const [preparingImage, setPreparingImage] = useState<"download" | "whatsapp" | null>(null);

  const certificateFileName = `raithai-sertifikat-${certificateNumber ?? "spa"}.png`;

  /**
   * pixelRatio: 2 — карточка компактная (461×818 у.е.), без масштабирования
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
    if (!buyerFirstName.trim()) e.push(t("cert.errBuyerNameRequired"));
    if (!buyerLastName.trim()) e.push(t("cert.errBuyerLastNameRequired"));
    if (!/^[+()\d\s-]{10,}$/.test(buyerPhone)) e.push(t("cert.errBuyerPhoneRequired"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyerEmail)) e.push(t("cert.errBuyerEmailRequired"));
    if (!forSelf) {
      // Фамилия получателя — необязательна (правка владельца 2026-08-21):
      // не все хотят её указывать, а имени обычно достаточно, чтобы найти
      // получателя на ресепшене.
      if (!recipientFirstName.trim()) e.push(t("cert.errRecipientRequired"));
      if (!sender.trim()) e.push(t("cert.errSenderRequired"));
    }
    return e;
  };

  const validateStep4 = () => {
    const e: string[] = [];
    if (!consentAccepted) e.push(t("cert.errConsentRequired"));
    if (payChannel === "phone" && !PAY_PHONE_RE.test(payPhone)) e.push(t("cert.errPayPhoneInvalid"));
    return e;
  };

  const next = async () => {
    // Данные покупателя/получателя теперь заполняются на шаге 2 (правка
    // 2026-08-22: порядок «Оформление» → «Дизайн» подтверждён сверкой с
    // layan.kz — validateStep3 по названию функции, но привязана к шагу 2.
    const e = step === 1 ? validateStep1() : step === 2 ? validateStep3() : [];
    setErrors(e);
    if (e.length > 0) return;
    setStep((s) => Math.min(5, s + 1) as Step);
  };

  /**
   * Шаг 4 больше не идёт через общий `next()`/нижнюю кнопку — выбор способа
   * оплаты и создание счёта живут внутри самого шага (см. JSX ниже).
   * Создаёт certificate-строку (payment_status: "pending", номер уже
   * зарезервирован) + счёт в ApiPay в одном запросе; шаг 5 открывается
   * только когда поллинг (см. useEffect ниже) увидит payment_status: "paid".
   */
  const startPayment = async () => {
    const e = validateStep4();
    setErrors(e);
    if (e.length > 0) return;

    setInvoicePhase("creating");
    setInvoiceError(null);
    try {
      const response = await fetch("/api/certificates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          certificateType: kind,
          buyerName: buyerFullName,
          buyerContact: [buyerPhone, buyerEmail].filter(Boolean).join(" · ") || null,
          recipientName: recipientFullName || null,
          recipientContact: null,
          branch: branchInfo ? branchLabel : null,
          paymentMethod: "kaspi",
          paymentChannel: payChannel,
          payPhone: payChannel === "phone" ? payPhone : null,
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
      const data = (await response.json()) as {
        id?: string;
        certificateNumber?: string;
        invoice?: { qrCode: string | null; payUrl: string | null } | null;
        error?: string;
        errorCategory?: string;
      };
      if (!response.ok || !data.id || !data.certificateNumber) {
        setInvoiceError(
          data.error === "apipay_not_configured"
            ? t("cert.errApipayNotConfigured")
            : payErrorMessage(t, data.errorCategory),
        );
        setInvoicePhase("error");
        return;
      }
      setCertificateNumber(data.certificateNumber);
      setInvoiceData({
        id: data.id,
        qrCode: data.invoice?.qrCode ?? null,
        payUrl: data.invoice?.payUrl ?? null,
      });
      setInvoicePhase("awaiting");
    } catch {
      // Сетевой сбой (fetch сам бросил, до ответа сервера не дошло).
      setInvoiceError(t("cert.errInvoiceCreateFailed"));
      setInvoicePhase("error");
    }
  };

  // Поллинг статуса, пока ждём вебхук от ApiPay — каждые 3с, максимум ~100
  // попыток (~5 мин), затем предлагаем проверить вручную вместо бесконечных
  // запросов. Останавливается при уходе с "awaiting" или размонтировании.
  useEffect(() => {
    if (invoicePhase !== "awaiting" || !invoiceData) return;
    let attempts = 0;
    const id = invoiceData.id;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/certificates/status/${id}`);
        if (res.ok) {
          const data = (await res.json()) as { paymentStatus: string; errorCategory?: string };
          if (data.paymentStatus === "paid") {
            clearInterval(interval);
            setStep(5);
            return;
          }
          if (data.paymentStatus === "failed") {
            clearInterval(interval);
            setInvoiceError(payErrorMessage(t, data.errorCategory));
            setInvoicePhase("error");
            return;
          }
        }
      } catch {
        // Сетевой сбой одного опроса — не страшно, попробуем на следующем тике.
      }
      if (attempts >= 100) {
        clearInterval(interval);
        setInvoicePhase("timeout");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [invoicePhase, invoiceData, t]);

  const back = () => {
    setErrors([]);
    if (step === 4) {
      setInvoicePhase("choose");
      setInvoiceData(null);
    }
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

          {step === 3 && (
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
                    {/* Новые фото дизайна (2026-08-21) — без золотой плашки
                        с названием внизу, поэтому название снова выводится
                        текстом на сайте, а не как часть картинки. */}
                    <p className="py-2.5 text-center text-[0.62rem] tracking-[0.14em] text-cream/70 uppercase">
                      {t(`designs.${d.id}.title`)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="max-w-xl">
              <h1 className="font-display text-3xl">{t("cert.step3Title")}</h1>
              <p className="text-cream/65 mt-3 text-sm leading-relaxed">{t("cert.step3Text")}</p>

              {/* Данные покупателя */}
              <p className="eyebrow mt-8">{t("cert.buyerSection")}</p>
              <div className="mt-4 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("cert.buyerNameLabel")}>
                    <input
                      value={buyerFirstName}
                      onChange={(e) => setBuyerFirstName(e.target.value)}
                      maxLength={80}
                      autoComplete="given-name"
                      className="input"
                    />
                  </Field>
                  <Field label={t("cert.buyerLastNameLabel")}>
                    <input
                      value={buyerLastName}
                      onChange={(e) => setBuyerLastName(e.target.value)}
                      maxLength={80}
                      autoComplete="family-name"
                      className="input"
                    />
                  </Field>
                </div>
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
                        placeholder={t("cert.optionalPlaceholder")}
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
              <p className="mt-4 text-sm leading-relaxed text-cream/70">{t("cert.payIntro")}</p>
              <p className="font-display text-gold mt-2 text-2xl">{formatPrice(total)}</p>

              {(invoicePhase === "choose" ||
                invoicePhase === "creating" ||
                invoicePhase === "error") && (
                <>
                  <p className="text-cream/60 mt-8 text-[0.65rem] tracking-[0.2em] uppercase">
                    {t("cert.payMethodTitle")}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(["qr", "phone"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPayChannel(c)}
                        aria-pressed={payChannel === c}
                        className={`rounded-md border px-4 py-3 text-sm transition-colors ${
                          payChannel === c
                            ? "border-gold bg-gold text-primary-foreground"
                            : "border-border bg-card text-cream/80 hover:border-gold/60"
                        }`}
                      >
                        {t(c === "qr" ? "cert.payMethodQr" : "cert.payMethodPhone")}
                      </button>
                    ))}
                  </div>

                  {payChannel === "phone" &&
                    (() => {
                      // Подсказка прямо у поля (Блок 2.1) — красная, как
                      // только видно, что формат не сойдётся (не просто
                      // "недописано"), не только в общем списке ошибок внизу.
                      const phoneInvalid = payPhone.length === 11 && !PAY_PHONE_RE.test(payPhone);
                      return (
                        <label className="mt-4 block">
                          <span className="text-cream/70 text-xs">{t("cert.payPhoneLabel")}</span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={payPhone}
                            onChange={(e) => setPayPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                            placeholder={t("cert.payPhonePlaceholder")}
                            aria-invalid={phoneInvalid}
                            className={`input mt-1.5 ${phoneInvalid ? "border-destructive" : ""}`}
                          />
                          <span
                            className={`mt-1 block text-xs ${phoneInvalid ? "text-destructive" : "text-cream/45"}`}
                          >
                            {phoneInvalid ? t("cert.errPayPhoneInvalid") : t("cert.payPhoneHint")}
                          </span>
                        </label>
                      );
                    })()}

                  <label className="text-cream/70 hover:text-cream mt-6 flex cursor-pointer items-start gap-2.5 text-sm transition-colors">
                    <input
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="accent-gold mt-0.5 h-4 w-4 shrink-0"
                    />
                    {t("cert.consentLabel")}
                  </label>
                  <p className="text-cream/45 mt-2 pl-[1.625rem] text-xs">
                    <Link to="/offer" target="_blank" className="hover:text-gold underline">
                      {t("footer.legalOffer")}
                    </Link>
                    {" · "}
                    <Link to="/certificate-rules" target="_blank" className="hover:text-gold underline">
                      {t("footer.legalCertRules")}
                    </Link>
                  </p>

                  <button
                    type="button"
                    onClick={startPayment}
                    disabled={invoicePhase === "creating"}
                    className="btn-gold mt-6 inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {invoicePhase === "creating" && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                    )}
                    {invoicePhase === "creating"
                      ? t("cert.savingButton")
                      : t(payChannel === "qr" ? "cert.showQrButton" : "cert.sendPhoneRequestButton")}
                  </button>

                  {invoicePhase === "error" && invoiceError && (
                    <p className="text-destructive mt-4 text-sm">{invoiceError}</p>
                  )}
                </>
              )}

              {(invoicePhase === "awaiting" || invoicePhase === "timeout") && invoiceData && (
                <div className="surface mt-8 flex flex-col items-center gap-4 p-8 text-center">
                  {payChannel === "qr" &&
                    (invoiceData.qrCode ? (
                      <div className="bg-cream p-3">
                        <QRCodeSVG
                          value={invoiceData.qrCode}
                          size={160}
                          bgColor="#f4efe6"
                          fgColor="#12241b"
                          level="M"
                        />
                      </div>
                    ) : invoiceData.payUrl ? (
                      <a href={invoiceData.payUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">
                        {t("cert.showQrButton")}
                      </a>
                    ) : null)}

                  <p className="text-cream/70 text-sm leading-relaxed">
                    {payChannel === "qr"
                      ? t("cert.payAwaitingQr")
                      : (() => {
                          const [before, after] = t("cert.payAwaitingPhone").split("{phone}");
                          return (
                            <>
                              {before}
                              <span className="text-gold">{payPhone}</span>
                              {after}
                            </>
                          );
                        })()}
                  </p>

                  {invoicePhase === "awaiting" ? (
                    <p className="text-cream/45 flex items-center gap-2 text-xs">
                      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />
                      {t("cert.payAwaitingNote")}
                    </p>
                  ) : (
                    <>
                      <p className="text-cream/70 text-sm">{t("cert.payTimeoutMessage")}</p>
                      <button
                        type="button"
                        onClick={() => setInvoicePhase("awaiting")}
                        className="btn-beige"
                      >
                        {t("cert.checkStatusButton")}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setInvoicePhase("choose");
                      setInvoiceData(null);
                    }}
                    className="text-cream/45 hover:text-gold text-xs underline"
                  >
                    {t("cert.changeMethodButton")}
                  </button>
                </div>
              )}
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
            // Раньше превью не имело ограничения ширины и на мобильном
            // занимало весь экран по высоте (380px-колонка десктопа
            // растягивалась на всю ширину экрана). 200px (~30-37% высоты
            // экрана на типичном мобильном, при aspect-ratio 461/697) —
            // карточка ещё хорошо читается, но не доминирует над экраном.
            // lg:max-w-none — на десктопе снова во всю 380px-колонку.
            className="mx-auto max-w-[200px] sm:max-w-[240px] lg:max-w-none"
          />
          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
            <span className="text-cream/60">{t("cert.payTotal")}</span>
            <span className="font-display text-2xl text-gold">
              {formatPrice(total || 0)}
            </span>
          </div>
        </aside>
      </div>

      {/* Кнопки навигации — раньше жили в конце <section> (левая колонка),
          из-за чего на некоторых экранах читались ниже превью сертификата
          и даже ниже FAQ (та же сетка, но с длинным шагом слева и коротким
          FAQ ниже неё). Вынесены сюда, сразу после сетки превью+"К оплате",
          но перед FAQ — так кнопка "Далее" видна сразу после суммы на любой
          ширине экрана, а не после блока частых вопросов. */}
      {/* Шаг 4 не проходит через эту панель — у него своя кнопка оплаты и
          своя логика внутри блока выше (startPayment, invoicePhase). Кнопка
          "Назад" на шаге 4 доступна, только пока счёт ещё не создан — уйти
          со страницы посреди ожидания оплаты не должно быть так же легко,
          как между обычными шагами. */}
      {step < 5 && step !== 4 && (
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
                  : t("cert.nextButton")}
          </button>
        </div>
      )}
      {step === 4 && invoicePhase === "choose" && (
        <div className="mt-6">
          <button type="button" onClick={back} className="btn-ghost">
            {t("cert.backButton")}
          </button>
        </div>
      )}

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
