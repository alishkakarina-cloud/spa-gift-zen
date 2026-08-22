import { CERT_DESIGN_ASPECT, CERT_HEADER_ASPECT, type CertificateDesign } from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Цвет текста на дизайне (номинал, состав, "бессрочный" и т.п.) — зависит от
 * тона дизайна: "dark" — тёмно-золотой текст для светлого бежевого фона
 * (for-her), "light" — светлый бежево-золотой текст для тёмных фонов
 * (бордовый standard, тёмно-зелёный for-him), иначе не читается. Применяется
 * и к строке-эйбрау поверх фото, и ко всему тексту в растягиваемом "теле"
 * карточки ниже — там ровно тот же фоновый цвет, что и на фото (см.
 * design.bodyColor в catalog.ts), поэтому и цвет текста тот же.
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
  const archInk = design.textTone === "light" ? ARCH_INK_LIGHT : ARCH_INK_DARK;

  // Фото-фон сертификата — цельный файл (арка/лого/линия впечатаны в кадр
  // заказчиком), нарастить его низ без искажения нельзя. Поэтому картинка
  // используется только как ШАПКА фиксированной высоты (обрезана снизу
  // сразу после разделительной линии — CERT_HEADER_ASPECT, см. catalog.ts),
  // а дальше идёт обычный div, залитый тем же цветом фона, что и на фото
  // (design.bodyColor) с такой же тонкой золотой рамкой (design.borderColor)
  // — этот div растёт по высоте (height: auto) вслед за реальным объёмом
  // текста: 1 услуга — короткий, 5+ услуг — длинный, наложений и обрезки
  // не может быть в принципе, т.к. содержимого просто не во что упираться.
  return (
    <div className={`w-full ${className}`} style={{ boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)" }}>
      {/* Шапка — обрезанный кроп картинки (арка, лого RaiThai, линия). */}
      <div
        className="relative w-full overflow-hidden rounded-t-2xl"
        style={{ aspectRatio: CERT_HEADER_ASPECT }}
      >
        {/* Сама картинка рендерится в СВОИХ полных пропорциях (CERT_DESIGN_ASPECT,
            т.е. на всю высоту сертификата) и просто обрезается родителем,
            у которого высота — только доля CERT_HEADER_ASPECT. object-position:
            top — показывает верх картинки (то, что нужно), не центр. */}
        <img
          src={design.photo}
          alt=""
          aria-hidden="true"
          width={461}
          height={801}
          className="absolute top-0 left-0 w-full object-contain object-top"
          style={{ aspectRatio: CERT_DESIGN_ASPECT, height: "auto" }}
        />

        {/* «Подарочный сертификат» — единственная строка, которая печатается
            поверх фото: она всегда ровно одна и той же длины независимо от
            состава сертификата, переполниться не может ни при каких услугах. */}
        <p
          className={`font-display absolute right-0 bottom-[6%] left-0 text-center tracking-[0.28em] uppercase opacity-75 ${compact ? "text-[0.5rem]" : "text-[0.6rem]"}`}
          style={{ color: archInk }}
        >
          {t("cert.cardEyebrow")}
        </p>
      </div>

      {/* Тело — растягиваемый CSS-блок, залитый цветом фона дизайна, с той
          же рамкой, что и на фото. Весь динамический текст — тут. */}
      <div
        className={`flex flex-col items-center rounded-b-2xl border-x border-b text-center ${compact ? "px-3 py-3" : "px-6 py-5"}`}
        style={{ backgroundColor: design.bodyColor, borderColor: design.borderColor, color: archInk }}
      >
        {lines ? (
          <ul
            className={`font-display flex flex-col leading-[1.3] italic ${compact ? "text-xs" : "text-sm sm:text-base"}`}
          >
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <p
          className={`font-display shrink-0 leading-[1.1] italic ${lines ? "mt-1.5" : ""} ${compact ? "text-base" : "text-xl sm:text-2xl"}`}
        >
          {valueLabel}
        </p>

        {/* Пожелание — то, что пользователь ввёл в форме; если поле пустое,
            дальше строки просто нет. */}
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
