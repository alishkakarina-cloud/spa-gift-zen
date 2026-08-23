import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { QRCodeSVG } from "qrcode.react";
import { CertificateCard } from "@/components/CertificateCard";
import { Motif } from "@/components/Motif";
import { Divider } from "@/components/Divider";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";
import type { CatalogGroup } from "@/data/serviceGroups";
import { useLanguage } from "@/i18n/LanguageContext";
import { translations } from "@/i18n/translations";
import { MIN_AMOUNT, designs, fixedAmounts, formatPrice } from "@/data/catalog";
import { FAQ_NUMBERS } from "@/data/faq";
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
  // Пользователь зашёл в каталог (шаг 1) не с нуля, а через «Выбрать
  // доп.услуги» с шага 2 — показываем плавающую кнопку возврата и не даём
  // обычным кнопкам шага 1 затереть kind/serviceIds уже начатого заказа.
  // Объявлено здесь (выше остальных состояний шага 1), т.к. нужно уже в
  // эффекте скролла ниже.
  const [addingExtraServices, setAddingExtraServices] = useState(false);

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
    // Заход в каталог через «Выбрать доп.услуги» (шаг 2 -> шаг 1) — не в
    // самый верх страницы (там блок город/сумма, уже выбранный и тут не
    // нужный), а сразу к разделу «КАТЕГОРИИ» — та же точка, куда ведёт
    // «Далее» на обычном шаге 1 при выборе города (см. handleStep1Next).
    if (step === 1 && addingExtraServices) {
      document.getElementById("categories-block")?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [step, addingExtraServices]);
  // Пришли с конкретной услугой (?services=) — сразу «service», иначе
  // амаунт по умолчанию; клик по каталогу/сумме на шаге 1 ниже переключает
  // явно (см. кнопки «Подарить»/«Далее»), а не наоборот.
  const [kind, setKind] = useState<Kind>(presetKind ?? (presetIds.length > 0 ? "service" : "amount"));
  const [groupId, setGroupId] = useState<CatalogGroup>(presetFirst?.group ?? "massage");
  const [serviceIds, setServiceIds] = useState<string[]>(presetIds);
  // Доп.услуги, добавленные к уже оформляемому сертификату «на сумму»
  // (кнопка «Выбрать доп.услуги» на шаге 2) — отдельный список, а не тот же
  // serviceIds: тот привязан к режиму «на услугу» и его логику трогать не
  // нужно. Для режима «на услугу» доп.услуги добавляются прямо в serviceIds
  // (см. onToggle каталога ниже) — там расчёт суммы и так уже поддерживает
  // несколько позиций, отдельного списка не требуется.
  const [extraServiceIds, setExtraServiceIds] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(presetAmount ?? fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");
  // Активирует собственную кнопку «Далее» под панелью суммы (см. JSX шага 1)
  // только после явного выбора — открытие панели/дефолтный fixedAmounts[0]
  // сами по себе выбором не считаются (тот же принцип и баг, что уже
  // исправляли в OffersSection, см. src/components/OffersSection.tsx).
  const [amountPicked, setAmountPicked] = useState(false);
  // Аккордеон «Указать сумму» (правка 2026-08-22, возврат на отдельную
  // страницу покупки: город/сумма + каталог снова один непрерывный экран,
  // как уже было реализовано в OffersSection.tsx, — карточка суммы того же
  // компактного размера, что «Петропавловск»/«Кокшетау», пока не раскрыта).
  const [amountOpen, setAmountOpen] = useState(false);
  // Единственная кнопка «Далее» под рядом город/город/сумма ведёт по одному
  // из двух сценариев — город (докрутка к каталогу) или сумма (в
  // оформление) — по тому, что выбрано последним (правка 2026-08-22:
  // эталонная версия этого блока, коммит 755712e, до разделения на 2
  // страницы — восстановлена как есть, 1-в-1, вместо пересборки).
  const [lastChoice, setLastChoice] = useState<"city" | "amount" | null>(null);
  const [designId, setDesignId] = useState(designs[0]!.id);
  const [buyerFirstName, setBuyerFirstName] = useState("");
  const [buyerLastName, setBuyerLastName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [forSelf, setForSelf] = useState(false);
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
  // Доп.услуги поверх сертификата «на сумму» — сумма и услуги хранятся
  // раздельно (номинал остаётся номиналом), но складываются в общий итог.
  const extraChosen = selectedServices(extraServiceIds);
  const extraTotal = selectionTotal(extraServiceIds);
  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const total =
    kind === "service" ? selectionTotal(serviceIds) : effectiveAmount + extraTotal;
  // На бланке сертификата состав печатается списком названий; сертификат на
  // сумму без доп.услуг — одной строкой с номиналом. Если к сертификату «на
  // сумму» добавили доп.услуги — номинал идёт первой строкой списка (Блок 2,
  // «хранить раздельно»), дальше — добавленные услуги, тем же списком, что
  // и у обычного сертификата «на услугу».
  const cardItems =
    kind === "service" && chosen.length > 0
      ? chosen.map((s) => t(`services.${s.id}.name`))
      : extraChosen.length > 0
        ? [
            t("cert.nominalLineLabel", { amount: formatPrice(effectiveAmount) }),
            ...extraChosen.map((s) => t(`services.${s.id}.name`)),
          ]
        : undefined;
  const valueLabel = formatPrice(total || 0);
  const buyerFullName = `${buyerFirstName} ${buyerLastName}`.trim();
  // «Покупаю для себя» — получатель и отправитель берутся из данных покупателя.
  const recipientFullName = (
    forSelf ? buyerFullName : `${recipientFirstName} ${recipientLastName}`.trim()
  ).trim();
  // Город — реальный выбор на шаге 1 (см. JSX ниже), а не только пресет из
  // ссылки. Раньше это был декоративный выбор на главной (OffersSection),
  // никогда не долетавший до /certificate (тамошняя кнопка «Далее» не
  // передавала branch) — теперь выбирается прямо тут, на этой странице, и
  // реально попадает в итоговые данные (строка «Филиал», карточка
  // сертификата, запись в БД). Если пользователь попал сюда прямой ссылкой
  // с ?branch=, подставляем его; иначе — не выбран, пока не кликнут.
  const [branch, setBranch] = useState<Branch | null>(presetBranch ?? null);
  const branchInfo = branch ? BRANCHES.find((b) => b.id === branch) : undefined;
  const branchLabel = branchInfo ? t(branchInfo.labelKey) : t("cert.branchNotChosen");

  // Эталонная логика единой кнопки «Далее» на шаге 1 (коммит 755712e) —
  // город выбран → докрутка к каталогу; сумма выбрана и была последней →
  // переход в оформление; и то, и другое — побеждает то, что выбрано
  // последним (lastChoice), а не «город всегда/сумма всегда».
  const canGoCity1 = branch !== null;
  const canGoAmount1 = amountPicked;
  const canProceedStep1 = canGoCity1 || canGoAmount1;
  const targetIsAmountStep1 = canGoAmount1 && (!canGoCity1 || lastChoice === "amount");
  const handleStep1Next = () => {
    if (!canProceedStep1) return;
    if (targetIsAmountStep1) {
      setErrors([]);
      // В режиме «Выбрать доп.услуги» (addingExtraServices) сюда попадают,
      // только если случайно тронули блок город/сумма — kind уже начатого
      // заказа трогать не нужно, просто вернуться на шаг 2.
      if (!addingExtraServices) setKind("amount");
      setStep(2);
      return;
    }
    document.getElementById("categories-block")?.scrollIntoView({ behavior: "smooth" });
  };

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
    // Доп. защита (Блок 2.2 отчёта о баге "0 ₸"): даже если по каким-то
    // причинам chosen.length > 0, а total всё равно не посчитался (не
    // должно происходить после фикса корня бага, но это последний рубеж
    // перед оплатой) — не пускаем дальше ни при kind "service", ни "amount".
    if (!total || total <= 0) return [t("cert.errMinAmount", { amount: formatPrice(MIN_AMOUNT) })];
    if (kind === "amount" && total < MIN_AMOUNT)
      return [t("cert.errMinAmount", { amount: formatPrice(MIN_AMOUNT) })];
    return [];
  };

  const validateStep3 = () => {
    const e: string[] = [];
    if (!buyerFirstName.trim()) e.push(t("cert.errBuyerNameRequired"));
    if (!buyerLastName.trim()) e.push(t("cert.errBuyerLastNameRequired"));
    if (!/^[+()\d\s-]{10,}$/.test(buyerPhone)) e.push(t("cert.errBuyerPhoneRequired"));
    // E-mail необязателен (правка владельца 2026-08-23) — проверяем формат,
    // только если поле вообще заполнено; пустое поле проходит без ошибки.
    if (buyerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(buyerEmail))
      e.push(t("cert.errBuyerEmailRequired"));
    if (!forSelf) {
      // Фамилия получателя — необязательна (правка владельца 2026-08-21):
      // не все хотят её указывать, а имени обычно достаточно, чтобы найти
      // получателя на ресепшене.
      if (!recipientFirstName.trim()) e.push(t("cert.errRecipientRequired"));
    }
    return e;
  };

  const validateStep4 = () => {
    const e: string[] = [];
    // Последний рубеж перед реальным созданием платежа (Блок 2.2 отчёта о
    // баге "0 ₸") — если сумма всё же оказалась 0/отрицательной, оплату не
    // создаём ни при каких обстоятельствах.
    if (!total || total <= 0) e.push(t("cert.errMinAmount", { amount: formatPrice(MIN_AMOUNT) }));
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
          // сохранялся, хотя форма его собирает (chosen). Для сертификата
          // «на сумму» с добавленными доп.услугами номинал уходит первой
          // строкой состава (та же «раздельно, но в одном списке» логика,
          // что и в cardItems/сводке выше) — amount ниже уже несёт
          // объединённый итог (total), это не меняет расчёт на бэкенде.
          services:
            kind === "service" && chosen.length > 0
              ? chosen.map((s) => ({
                  id: s.id,
                  name: t(`services.${s.id}.name`),
                  price: s.price,
                }))
              : kind === "amount" && extraChosen.length > 0
                ? [
                    {
                      id: "nominal",
                      name: t("cert.nominalLineLabel", { amount: formatPrice(effectiveAmount) }),
                      price: effectiveAmount,
                    },
                    ...extraChosen.map((s) => ({
                      id: s.id,
                      name: t(`services.${s.id}.name`),
                      price: s.price,
                    })),
                  ]
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

      {/* Превью-карточка сертификата (aside ниже) на шаге 1 (выбор услуги/
          суммы) не нужна — это ещё не заказ, показывать сертификат с
          суммой рано (правка владельца 2026-08-22). Убрана условно только
          там; на шаге 2 («Проверьте заказ») и далее остаётся как была.
          lg:grid-cols-[1fr_380px] тоже только когда aside реально есть —
          иначе на шаге 1 остаётся пустая зарезервированная колонка. */}
      <div className={`mt-12 grid gap-12 lg:items-start ${step === 1 ? "" : "lg:grid-cols-[1fr_380px]"}`}>
        {/* key={step} размонтирует и заново монтирует блок при смене шага —
            это и запускает step-fade-in заново на каждом переходе, раньше
            переключение шагов было мгновенным. */}
        <section className="min-w-0 step-fade-in" key={step}>
          {step === 1 && (
            <div>
              {/* Блок выбора города/суммы — эталонная версия (коммит
                  755712e, до разделения на 2 страницы) восстановлена как
                  есть: Divider, eyebrow «ВЫБОР СЕРТИФИКАТА», плашка
                  «БЕССРОЧНЫЙ СЕРТИФИКАТ», размеры карточек (px-6 py-4,
                  text-lg/sm:text-xl) — единственная адаптация — переход
                  теперь setStep(2) вместо navigate() (тут это уже /certificate,
                  не отдельная страница, а branch/kind реально передаются
                  через компонентный state, не через URL). */}
              <Divider motif="waveCrown" className="pt-4 sm:pt-6" />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Motif name="petalDiamond" className="text-gold h-7 w-7" />
                  <p className="eyebrow">{t("home.buyEyebrow")}</p>
                </div>
                <span className="border-gold/45 text-gold rounded-full border px-3 py-1 text-[0.62rem] tracking-[0.2em] uppercase">
                  {t("home.buyEndless")}
                </span>
              </div>
              <h1 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
                {t("cert.step1Title")}
              </h1>

              <div className="mt-8 grid gap-2 sm:grid-cols-3">
                {BRANCHES.map((b) => {
                  const selected = branch === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setBranch(b.id);
                        setLastChoice("city");
                        // Взаимоисключающий выбор (правка владельца
                        // 2026-08-23): город и сумма — разные сценарии,
                        // выбор одного сбрасывает другой полностью, а не
                        // просто теряет приоритет через lastChoice.
                        setAmountOpen(false);
                        setAmountPicked(false);
                        setCustomAmount("");
                        setAmount(fixedAmounts[0]!);
                      }}
                      aria-pressed={selected}
                      className={`surface px-6 py-4 text-left transition-colors ${
                        selected ? "border-gold!" : "hover:border-gold/60"
                      }`}
                    >
                      <span
                        className={`font-display block text-lg sm:text-xl text-cream ${selected ? "text-glow-gold" : ""}`}
                      >
                        {t("home.buyCityPrefix")} {t(b.labelKey)}
                      </span>
                      <span
                        className={`mt-1 block text-sm text-cream/65 ${selected ? "text-glow-gold" : ""}`}
                      >
                        {b.address}
                      </span>
                    </button>
                  );
                })}

                {/* «Указать сумму» — аккордеон, свёрнута до размера карточек
                    городов выше, разворачивается по клику плавно
                    (grid-template-rows 0fr→1fr). */}
                <div
                  className={`surface overflow-hidden text-left transition-colors ${
                    amountOpen ? "border-gold!" : "hover:border-gold/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Взаимоисключающий выбор — открытие панели суммы
                      // сбрасывает выбранный город (правка владельца
                      // 2026-08-23). Сбрасываем только при открытии, а не
                      // при сворачивании назад — сворачивание без выбора
                      // суммы ничего не должно менять.
                      const opening = !amountOpen;
                      setAmountOpen(opening);
                      if (opening) {
                        setBranch(null);
                        setLastChoice("amount");
                      }
                    }}
                    aria-expanded={amountOpen}
                    className="w-full px-6 py-4 text-left"
                  >
                    <span
                      className={`font-display block text-lg sm:text-xl text-cream ${amountOpen ? "text-glow-gold" : ""}`}
                    >
                      {t("cert.choiceAmountTitle")}
                    </span>
                    <span
                      className={`text-cream/65 mt-1 block text-sm ${amountOpen ? "text-glow-gold" : ""}`}
                    >
                      {t("cert.choiceAmountFrom", { amount: formatPrice(MIN_AMOUNT) })}
                    </span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-[350ms] ease-in-out"
                    style={{ gridTemplateRows: amountOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={`px-6 pb-6 transition-opacity duration-300 ${
                          amountOpen ? "opacity-100 delay-100" : "opacity-0"
                        }`}
                      >
                        <div className="flex flex-wrap gap-2">
                          {fixedAmounts.map((a) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => {
                                setAmount(a);
                                setCustomAmount("");
                                setAmountPicked(true);
                                setLastChoice("amount");
                              }}
                              aria-pressed={amountPicked && !customAmount && amount === a}
                              className={`rounded-md border px-4 py-2.5 text-sm transition-colors ${
                                amountPicked && !customAmount && amount === a
                                  ? "border-gold bg-gold text-primary-foreground"
                                  : "border-border bg-card text-cream hover:border-gold/60"
                              }`}
                            >
                              {formatPrice(a)}
                            </button>
                          ))}
                        </div>

                        <label
                          className={`bg-card mt-3 block rounded-md border p-3 transition-colors ${
                            customAmount ? "border-gold" : "border-border"
                          }`}
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
                            onChange={(e) => {
                              const next = e.target.value;
                              setCustomAmount(next);
                              // Пустое поле — вернулись к ранее нажатому
                              // пресету (amountPicked трогать не нужно);
                              // невалидное значение явно снимает выбор.
                              if (next) {
                                const v = Number(next);
                                const valid = Number.isFinite(v) && v >= MIN_AMOUNT;
                                setAmountPicked(valid);
                                if (valid) setLastChoice("amount");
                              }
                            }}
                            placeholder={String(MIN_AMOUNT)}
                            className={`border-input focus:border-gold bg-background mt-2 w-full border px-3 py-2.5 text-sm outline-none ${customAmount ? "border-gold text-gold" : ""}`}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Единственная кнопка «Далее» под рядом город/город/сумма —
                  ведёт к каталогу услуг (город) либо в оформление на сумму
                  (сумма), см. handleStep1Next выше. */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  disabled={!canProceedStep1}
                  className={`btn-gold inline-flex ${canProceedStep1 ? "" : "cursor-not-allowed opacity-40"}`}
                >
                  {t("cert.nextButton")}
                </button>
              </div>

              {/* Каталог услуг — сразу под рядом город/город/сумма, без
                  перехода между ними (правка 2026-08-22, возврат на
                  отдельную страницу покупки: тот же непрерывный экран, что
                  уже был реализован в OffersSection.tsx). «Подарить» под
                  сводкой выбранных услуг переключает kind на "service" и
                  переходит на шаг 2 локально — переход по роуту здесь не
                  нужен, это уже тот самый /certificate. */}
              <div id="services-catalog" className="mt-12 scroll-mt-24">
                <div className="flex items-center gap-3">
                  <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
                  <p className="eyebrow">{t("catalog.title")}</p>
                </div>
                <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
                  {t("catalog.title")}
                </h2>
                <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">
                  {t("catalog.subtitle")}
                </p>

                <a href={spaMenuPdfFor()} download className="btn-ghost mt-5 text-[0.62rem]">
                  {t("catalog.menuButton")}
                </a>

                <div className="mt-10">
                  <ServiceCatalogBrowser
                    groupId={groupId}
                    onGroupChange={setGroupId}
                    // Пока добавляем доп.услуги к уже оформляемому
                    // сертификату «на сумму» (addingExtraServices) —
                    // отмечаем/считаем их в extraServiceIds, а не в
                    // serviceIds. ВАЖНО: признак режима — именно
                    // addingExtraServices, а не kind === "amount" — kind по
                    // умолчанию и так равен "amount" при любом первом заходе
                    // без preset (до явного выбора услуги/суммы), поэтому
                    // проверка по kind ошибочно уводила id обычного первого
                    // выбора услуг в extraServiceIds ещё ДО клика
                    // «Подарить» — после клика kind становился "service", но
                    // serviceIds оставался пустым, а сумма считалась от него
                    // (0 ₸) и в сводке вместо услуг показывался номинал.
                    // Баг: "Итого"/"К оплате" считались как 0 ₸ при выборе
                    // нескольких услуг + не убиралась строка "Сертификат на
                    // сумму" (см. отчёт задачи).
                    selectedIds={addingExtraServices ? extraServiceIds : serviceIds}
                    onToggle={(id) => {
                      if (addingExtraServices) {
                        setExtraServiceIds((ids) => toggleServiceId(ids, id));
                      } else {
                        setServiceIds((ids) => toggleServiceId(ids, id));
                      }
                      setErrors([]);
                    }}
                    onClear={() =>
                      addingExtraServices ? setExtraServiceIds([]) : setServiceIds([])
                    }
                    t={t}
                    action={
                      // В режиме доп.услуг возврат уже обеспечивает внешняя
                      // плавающая кнопка «Вернуться к оформлению» (видна
                      // всегда, а не только когда что-то выбрано, как этот
                      // action внутри «Выбрано/Итого») — тут дублировать её
                      // не нужно, блок «Выбрано/Итого» остаётся как есть,
                      // просто без второй такой же кнопки.
                      addingExtraServices ? null : (
                        <button
                          type="button"
                          onClick={() => {
                            // Раньше эта кнопка переходила на шаг 2 без
                            // проверки — при пустом serviceIds (например,
                            // из-за бага "0 ₸", см. отчёт) ничего не мешало
                            // дойти до оплаты без реально выбранных услуг.
                            // Проверяем chosen/selectionTotal напрямую, а не
                            // через validateStep1() — на момент клика kind
                            // ещё не переключён на "service" (setKind ниже
                            // применится только на следующий рендер), так
                            // что kind-ветка validateStep1 тут смотрела бы
                            // не на serviceIds, а на текущий (amount) total.
                            if (chosen.length === 0 || selectionTotal(serviceIds) <= 0) {
                              setErrors([t("cert.errServiceRequired")]);
                              return;
                            }
                            setErrors([]);
                            setKind("service");
                            setStep(2);
                          }}
                          className="btn-gold"
                        >
                          {t("cert.nextButton")}
                        </button>
                      )
                    }
                  />
                </div>
              </div>
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
                    className={`w-full overflow-hidden rounded-2xl border text-left transition-colors ${designId === d.id ? "border-gold bg-gold" : "border-border/40 hover:border-gold/60"}`}
                  >
                    <CertificateCard design={d} valueLabel={valueLabel} items={cardItems} compact />
                    {/* Новые фото дизайна (2026-08-21) — без золотой плашки
                        с названием внизу, поэтому название снова выводится
                        текстом на сайте, а не как часть картинки. Полная
                        заливка кнопки золотым при выборе (правка 2026-08-22)
                        видна именно тут, под фото — сам текст переключается
                        на тёмный, иначе на золотом фоне нечитаем. */}
                    <p
                      className={`py-2.5 text-center text-[0.62rem] tracking-[0.14em] uppercase ${
                        designId === d.id ? "text-primary-foreground" : "text-cream/70"
                      }`}
                    >
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

              {/* E-mail перенесён сюда из блока «Данные покупателя» — именно
                  на него уходит электронный сертификат. Рендерится в обеих
                  ветках (в том числе при «Покупаю для себя», где остальные
                  поля получателя скрыты за forSelfNote) — это ключевое поле
                  для доставки, скрывать его вместе с остальными нельзя. */}
              {forSelf ? (
                <div className="mt-4 grid gap-5">
                  <p className="surface rounded-md p-4 text-sm text-cream/70">
                    {t("cert.forSelfNote")}
                  </p>
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
                  <>
                    <Row k={t("cert.rowNominal")} v={formatPrice(effectiveAmount || 0)} />
                    {/* Доп.услуги, добавленные через «Выбрать доп.услуги» —
                        отдельными строками рядом с номиналом (хранятся и
                        показываются раздельно, суммируются только в «Итого»). */}
                    {extraChosen.map((s) => (
                      <Row key={s.id} k={t(`services.${s.id}.name`)} v={formatPrice(s.price)} />
                    ))}
                  </>
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

        {step !== 1 && (
          <aside className="lg:sticky lg:top-10">
            <CertificateCard
              design={design}
              valueLabel={valueLabel}
              items={cardItems}
              recipient={recipientFullName || undefined}
              message={message || undefined}
              number={certificateNumber ?? undefined}
              // Раньше превью не имело ограничения ширины и на мобильном
              // занимало весь экран по высоте (380px-колонка десктопа
              // растягивалась на всю ширину экрана), поэтому было ограничено
              // 200px/240px. Увеличено на ~30% (260px/312px, задача про
              // увеличение карточки) — внутренняя текстовая зона стала
              // заметно просторнее, при этом на мобильном (375px) с полями
              // main px-6 (2×24px) карточка 260px всё ещё оставляет запас
              // по бокам, не упирается в края экрана. lg:max-w-none — на
              // десктопе снова во всю 380px-колонку.
              className="mx-auto max-w-[260px] sm:max-w-[312px] lg:max-w-none"
            />
            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
              <span className="text-cream/60">{t("cert.payTotal")}</span>
              <span className="font-display text-2xl text-gold">
                {formatPrice(total || 0)}
              </span>
            </div>
          </aside>
        )}
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
          как между обычными шагами.
          Шаг 1 тоже не проходит через эту панель — у него своя единая
          кнопка «Далее» под рядом город/город/сумма (handleStep1Next, см.
          JSX шага 1 выше) с собственной логикой город/сумма, и отдельная
          «Подарить» под каталогом услуг. */}
      {step > 1 && step < 5 && step !== 4 && (
        // justify-between — «Назад» у левого края контейнера, «Далее» у
        // правого: равное расстояние от каждой кнопки до края, вместо
        // прежнего gap-3 (обе кнопки жались к левому краю, «Далее» не была
        // выровнена по правому краю контейнера — Блок 1 задачи на правку кнопок).
        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={saving}
            className="btn-ghost disabled:opacity-50"
          >
            {t("cert.backButton")}
          </button>
          <button
            type="button"
            onClick={next}
            disabled={saving}
            className="btn-gold inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
            {saving ? t("cert.savingButton") : step === 3 ? t("cert.payButton") : t("cert.nextButton")}
          </button>
        </div>
      )}

      {/* «Выбрать доп.услуги» — только на экране просмотра заказа (шаг 2,
          «Оформление»), одинаково доступна и для сертификата «на услугу»,
          и «на сумму» (Блок 2.5). Ведёт в тот же каталог, что и на шаге 1. */}
      {step === 2 && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setAddingExtraServices(true);
              setStep(1);
            }}
            className="btn-beige"
          >
            {t("cert.addExtraServicesButton")}
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

      {/* Плавающая кнопка возврата — видна только когда в каталог (шаг 1)
          зашли именно через «Выбрать доп.услуги» с шага 2 (Блок 2.3),
          а не с нуля. Зафиксирована внизу экрана, поверх любого скролла. */}
      {step === 1 && addingExtraServices && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-6 print:hidden">
          <button
            type="button"
            onClick={() => {
              setAddingExtraServices(false);
              setStep(2);
            }}
            className="btn-gold shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)]"
          >
            {t("cert.returnToOrderButton")}
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
