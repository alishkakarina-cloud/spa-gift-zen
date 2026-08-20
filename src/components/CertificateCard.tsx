import { CERT_DESIGN_ASPECT, type CertificateDesign } from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Тёмный тёплый тон, снятый пипеткой с подписи «Подарочный сертификат» на
 * исходных фото дизайнов заказчика — весь текст в арке набран этим цветом,
 * он одинаково читается на всех трёх кремовых арках.
 */
const ARCH_INK = "#3a2a1a";

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
}: Props) {
  const { t } = useLanguage();
  const lines = items && items.length > 0 ? items : null;
  const { archBox } = design;

  return (
    <div
      // w-full — обязателен: без явной ширины блок с aspect-ratio внутри
      // <button> (у него нет собственной ширины) считает размеры непредсказуемо,
      // из-за чего три карточки на шаге выбора дизайна могли обрезаться
      // по-разному. С явной шириной все три получают одинаковый бокс.
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: CERT_DESIGN_ASPECT, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)" }}
    >
      {/* Логотип, рамка и сама арка уже впечатаны в фото заказчиком — карточке
          больше не нужно рисовать текстуру/вуаль/мотив программно поверх.
          object-fit: contain — вписываем фото целиком, без обрезки: даже с
          почти совпадающим aspect-ratio контейнера (461/818) cover всё
          равно чуть обрезает края (была жалоба на это на шаге выбора
          дизайна), а тут на кону лого сверху и цветы по углам — contain
          гарантированно ничего не срежет, максимум тончайший зазор по
          бокам у одного из трёх фото (у них чуть разное соотношение). */}
      <img
        src={design.photo}
        alt=""
        aria-hidden="true"
        loading="lazy"
        width={461}
        height={818}
        className="absolute inset-0 h-full w-full object-contain object-center"
      />

      {/* Текстовый блок внутри арки — координаты свои под каждое фото
          (декор на кадре не симметричен), но логика вставки одна на все три. */}
      <div
        className="absolute flex flex-col items-center overflow-y-auto text-center no-scrollbar"
        style={{
          top: `${archBox.top}%`,
          height: `${archBox.bottom - archBox.top}%`,
          left: `${archBox.centerX}%`,
          width: `${archBox.width}%`,
          transform: "translateX(-50%)",
          color: ARCH_INK,
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
            className={`font-display mt-1 flex shrink-0 flex-col leading-[1.15] italic ${compact ? "text-xs" : "text-sm sm:text-base"}`}
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
