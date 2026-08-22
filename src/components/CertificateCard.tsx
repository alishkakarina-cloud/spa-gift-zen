import { useEffect, useRef, useState } from "react";
import { CERT_DESIGN_ASPECT, type CertificateDesign } from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Цвет текста внутри арки зависит от фона фото (design.textTone) — на
 * светлом бежевом фоне (for-her) тёмный тон читается хорошо, но на тёмных
 * бордовом/зелёном фонах (standard/for-him) тот же тёмный текст почти не
 * виден, поэтому там нужен светлый. ARCH_INK_LIGHT — не новый цвет, а
 * фирменный --gold-soft (#edcea5) из styles.css, тот же, что на золотой
 * рамке и орнаменте этих карточек.
 */
const ARCH_INK_DARK = "#3a2a1a";
const ARCH_INK_LIGHT = "#edcea5";

type Props = {
  design: CertificateDesign;
  valueLabel: string;
  /**
   * Состав сертификата: названия программ печатаются списком. Пусто —
   * печатается `valueLabel` (номинал сертификата на сумму).
   */
  items?: ReadonlyArray<string> | undefined;
  recipient?: string | undefined;
  sender?: string | undefined;
  message?: string | undefined;
  number?: string | undefined;
  /** Филиал, в котором действует сертификат. */
  branch?: string | undefined;
  /** Как записаться на процедуру — печатается на самом сертификате. */
  bookingNote?: string | undefined;
  compact?: boolean | undefined;
  /** Доп. классы на внешний div — например ограничение максимальной ширины
   *  превью в сайдбаре шага оформления (иначе занимает весь экран). */
  className?: string | undefined;
};

export function CertificateCard({
  design,
  valueLabel,
  items,
  recipient,
  sender,
  message,
  number,
  branch,
  bookingNote,
  compact = false,
  className = "",
}: Props) {
  const { t } = useLanguage();
  const lines = items && items.length > 0 ? items : null;
  const { archBox } = design;
  const archInk = design.textTone === "light" ? ARCH_INK_LIGHT : ARCH_INK_DARK;

  // Фото-фон сертификата — цельное изображение (рамка/лого/арка впечатаны
  // заказчиком), растягивать или обрезать его нельзя. Раньше текст внутри
  // арки был жёстко ограничен её высотой (% от картинки, overflow-y-auto +
  // скрытый скроллбар) — при нескольких услугах (после «Выбрать доп.услуги»)
  // строки не помещались и накладывались друг на друга.
  //
  // Теперь картинка (imageBoxRef) остаётся фиксированного размера как была,
  // а блок с текстом (archRef) позиционируется по факту отрисованной высоты
  // картинки (в пикселях, не в %) и может расти НИЖЕ картинки, если контент
  // не помещается в изначально отведённую под арку высоту. Внешний
  // контейнер (outerRef) при этом растягивается вслед за текстом — сначала
  // отрисовывается без явной высоты (=aspect-ratio, точь-в-точь как раньше,
  // для одной услуги ничего не меняется визуально), затем эффект ниже
  // измеряет реальную высоту и, если нужно, увеличивает min-height.
  const outerRef = useRef<HTMLDivElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const archRef = useRef<HTMLDivElement>(null);
  const [archTopPx, setArchTopPx] = useState<number | null>(null);
  const [archMinHeightPx, setArchMinHeightPx] = useState<number | null>(null);
  const [outerMinHeightPx, setOuterMinHeightPx] = useState<number | null>(null);

  useEffect(() => {
    const imageEl = imageBoxRef.current;
    const archEl = archRef.current;
    if (!imageEl || !archEl) return;

    const recalc = () => {
      const imageHeight = imageEl.getBoundingClientRect().height;
      if (imageHeight <= 0) return;
      const top = imageHeight * (archBox.top / 100);
      const minHeight = imageHeight * ((archBox.bottom - archBox.top) / 100);
      const archHeight = archEl.getBoundingClientRect().height;
      // Небольшой отступ снизу, чтобы длинный список услуг не упирался
      // прямо в нижний край карточки — 2% высоты картинки, как и внутренние
      // отступы самой арки.
      const bottomGap = imageHeight * 0.02;
      setArchTopPx(top);
      setArchMinHeightPx(minHeight);
      setOuterMinHeightPx(Math.max(imageHeight, top + archHeight + bottomGap));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(imageEl);
    ro.observe(archEl);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archBox.top, archBox.bottom, items, valueLabel, message, recipient, sender, branch, bookingNote, number, compact]);

  return (
    <div
      ref={outerRef}
      className={`relative w-full ${className}`}
      style={{
        minHeight: outerMinHeightPx ?? undefined,
        boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)",
      }}
    >
      {/* Картинка — рамка/лого/арка заказчика, фиксированного размера,
          не растягивается и не искажается ни при каком количестве услуг. */}
      <div
        ref={imageBoxRef}
        // w-full — обязателен: без явной ширины блок с aspect-ratio внутри
        // <button> (у него нет собственной ширины) считает размеры непредсказуемо,
        // из-за чего три карточки на шаге выбора дизайна могли обрезаться
        // по-разному. С явной шириной все три получают одинаковый бокс.
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: CERT_DESIGN_ASPECT }}
      >
        {/* Логотип, рамка, арка и золотая плашка с названием — всё уже
            впечатано в фото заказчиком, это часть дизайна, не обрезаем.
            object-fit: contain — показывает фото целиком на всех трёх
            дизайнах гарантированно без обрезки, даже с чуть разными
            пропорциями файлов (см. CERT_DESIGN_ASPECT в catalog.ts). */}
        <img
          src={design.photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={461}
          height={801}
          className="absolute inset-0 h-full w-full object-contain object-center"
        />
      </div>

      {/* Текстовый блок — координаты свои под каждое фото (декор на кадре
          не симметричен), но логика вставки одна на все три. top/min-height
          в пикселях (см. эффект выше) — привязаны к реальной высоте картинки,
          а не к высоте внешнего контейнера, поэтому при росте контейнера
          (много услуг) блок остаётся на месте арки, а не «уезжает» вместе
          с новой высотой. min-height вместо height + flex-центрирование —
          короткий текст выглядит как раньше (по центру арки), длинный
          просто перестаёт помещаться в min-height и растёт вниз, ничего не
          обрезая и не накладывая друг на друга. */}
      <div
        ref={archRef}
        className="absolute flex flex-col items-center text-center"
        style={{
          top: archTopPx ?? `${archBox.top}%`,
          minHeight: archMinHeightPx ?? `${archBox.bottom - archBox.top}%`,
          left: `${archBox.centerX}%`,
          width: `${archBox.width}%`,
          transform: "translateX(-50%)",
          color: archInk,
          justifyContent: "center",
        }}
      >
        <p
          className={`font-display shrink-0 tracking-[0.28em] uppercase opacity-75 ${compact ? "text-[0.5rem]" : "text-[0.6rem]"}`}
        >
          {t("cert.cardEyebrow")}
        </p>

        {lines ? (
          <ul
            className={`font-display mt-1 flex shrink-0 flex-col leading-[1.15] italic ${
              compact
                ? "text-xs"
                : // 5+ строк услуг — вторичная мера поверх растягивания
                  // карточки (Блок 2.3): чуть уменьшаем шрифт названий,
                  // сам список всё равно не обрезается и не накладывается.
                  lines.length >= 5
                  ? "text-[clamp(0.7rem,2.2vw,0.9rem)]"
                  : "text-sm sm:text-base"
            }`}
          >
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <p
          className={`font-display mt-1 shrink-0 leading-[1.1] italic ${compact ? "text-base" : "text-xl sm:text-2xl"}`}
        >
          {valueLabel}
        </p>

        {/* Пожелание — то, что пользователь ввёл в форме; если поле пустое,
            дальше строки просто нет (эйбрау выше уже несёт роль подписи). */}
        {message && (
          <p
            className={`font-display mt-2 shrink-0 leading-snug italic opacity-90 ${compact ? "text-[0.65rem]" : "text-sm"}`}
          >
            «{message}»
          </p>
        )}

        {!compact && (recipient || sender) && (
          <p className="mt-2 shrink-0 text-[0.6rem] opacity-80">
            {recipient && `${t("cert.cardTo")}: ${recipient}`}
            {recipient && sender && " · "}
            {sender && `${t("cert.cardFrom")}: ${sender}`}
          </p>
        )}

        {!compact && (branch || bookingNote) && (
          <p className="mt-1 shrink-0 text-[0.56rem] leading-relaxed opacity-70">
            {branch && `${t("cert.cardBranch")}: ${branch}`}
            {branch && bookingNote && " · "}
            {bookingNote}
          </p>
        )}

        {!compact && (
          <p className="mt-2 shrink-0 text-[0.56rem] tracking-[0.2em] uppercase opacity-80">
            {t("cert.cardValidity")}
            {number && ` · № ${number}`}
          </p>
        )}
      </div>
    </div>
  );
}
