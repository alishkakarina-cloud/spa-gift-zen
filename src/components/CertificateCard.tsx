import { CERT_DESIGN_ASPECT, type CertificateDesign } from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Цвет текста внутри рамки (номинал, "бессрочный" и т.п.) — зависит от фона
 * фото: "dark" — тёмно-золотой текст для светлого бежевого фона (for-her),
 * "light" — светлый бежево-золотой текст для тёмных фонов (бордовый
 * standard, тёмно-зелёный for-him), иначе на них не читается.
 */
const ARCH_INK_DARK = "#3a2a1a";
const ARCH_INK_LIGHT = "#edcea5";

/**
 * Начиная с какого числа строк список услуг переключается в режим
 * внутреннего скролла (Блок 4.2 задачи об увеличении карточки) — сумма и
 * "бессрочный сертификат" при этом всегда закреплены и видны, скроллится
 * только сам список. При меньшем числе строк список просто ужимается по
 * шрифту (см. classNamе ниже) и умещается в safe zone без скролла.
 */
const SCROLL_THRESHOLD = 6;

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

  // Один цельный файл дизайна (без нарезки на части) — растягивать/резать
  // картинку нельзя. Вместо этого: сама карточка отображается крупнее (см.
  // className в certificate.tsx, где задаётся max-width превью), а
  // текстовый блок строго внутри реальных границ золотой рамки на фото
  // (archBox — измерено попиксельно, см. catalog.ts), с шрифтом, который
  // сам подстраивается под число строк услуг — чем больше позиций, тем
  // мельче текст, но не мельче ~10-11px. Если и это не спасает (6+ услуг),
  // скроллится только сам список услуг, сумма и "бессрочный" всегда видны.
  const lineCount = lines?.length ?? 0;
  const useScroll = lineCount >= SCROLL_THRESHOLD;
  const itemsFontClass = compact
    ? "text-[0.6rem]"
    : lineCount <= 2
      ? "text-sm sm:text-base"
      : lineCount <= 4
        ? "text-xs sm:text-sm"
        : "text-[0.65rem] sm:text-[0.7rem]";

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: CERT_DESIGN_ASPECT, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)" }}
    >
      {/* Логотип, рамка, арка и золотая плашка с названием — всё уже
          впечатано в фото заказчиком, это часть дизайна, не обрезаем и не
          растягиваем. object-fit: contain — показывает фото целиком без
          обрезки на любом из трёх дизайнов, даже с чуть разными
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

      {/* Текстовый блок — строго внутри измеренных границ золотой рамки
          (archBox), координаты свои под каждое фото (декор не симметричен).
          grid-rows: auto-1fr-auto — эйбрау и низ (сумма/пожелание/
          получатель/филиал/бессрочный) всегда полностью видны, список
          услуг — средний ряд, при коротком контенте просто центрируется
          вместе с остальным (align-content: center на всём блоке), при
          длинном (useScroll) — сам список получает свой скролл, не толкая
          сумму за пределы рамки. */}
      <div
        className={`absolute flex flex-col items-center overflow-hidden text-center ${useScroll ? "" : "justify-center"}`}
        style={{
          top: `${archBox.top}%`,
          height: `${archBox.bottom - archBox.top}%`,
          left: `${archBox.centerX}%`,
          width: `${archBox.width}%`,
          transform: "translateX(-50%)",
          color: archInk,
        }}
      >
        <p
          className={`font-display shrink-0 tracking-[0.28em] uppercase opacity-75 ${compact ? "text-[0.5rem]" : "text-[0.6rem]"}`}
        >
          {t("cert.cardEyebrow")}
        </p>

        {lines ? (
          <ul
            className={`font-display mt-1 flex w-full flex-col leading-[1.25] italic ${itemsFontClass} ${
              useScroll ? "no-scrollbar min-h-0 flex-1 overflow-y-auto" : "shrink-0"
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
