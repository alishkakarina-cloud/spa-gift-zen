import { CERT_DESIGN_ASPECT, type CertificateDesign } from "@/data/catalog";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Цвет текста внутри арки зависит от фона фото (design.textTone) — на
 * светлом бежевом фоне (for-her) тёмный тон читается хорошо, но на тёмных
 * бордовом/зелёном фонах (standard/for-him) тот же тёмный текст почти не
 * виден, поэтому там нужен светлый. ARCH_INK_LIGHT — не новый цвет, а
 * фирменный --gold-soft (#edcea5) из styles.css, тот же, что на золотой
 * рамке и орнаменте этих карточек. Применяется только к строке-эйбрау
 * внутри арки (см. ниже, почему) — состав/сумма сидят на теме страницы,
 * не на фото, им archInk не подходит.
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

  // Фото-фон сертификата — цельное изображение заказчика (рамка/лого/арка
  // впечатаны в кадр), растягивать или обрезать его нельзя. Раньше весь
  // динамический текст (эйбрау + состав + сумма + пожелание + получатель)
  // печатался ПОВЕРХ картинки, внутри арки фиксированной % высоты — при
  // нескольких услугах (после «Выбрать доп.услуги») текст туда физически
  // не помещался.
  //
  // Первая попытка (растягивать зону текста через JS-измерение реальной
  // высоты картинки/контента и вслед за этим — высоту всего блока) на деле
  // не сработала надёжно — сам механизм заточен под точный тайминг первого
  // рендера/загрузки шрифта, а это ненадёжно. Поэтому — другая структура:
  // внутри арки остаётся только короткая, гарантированно однострочная
  // подпись «Подарочный сертификат» (archInk/золотое свечение сохранены
  // именно для неё — эта строка по-прежнему печатается поверх фото и её
  // должно быть видно на любом фоне). Весь остальной, потенциально длинный
  // контент — состав, сумма, пожелание, получатель/отправитель, филиал,
  // номер — идёт ПОД картинкой обычным текстовым блоком в естественном
  // потоке документа: растёт на любую высоту сам по себе, без каких-либо
  // измерений и без риска наложения или обрезки.
  return (
    <div className={`w-full ${className}`}>
      <div
        // w-full — обязателен: без явной ширины блок с aspect-ratio внутри
        // <button> (у него нет собственной ширины) считает размеры непредсказуемо,
        // из-за чего три карточки на шаге выбора дизайна могли обрезаться
        // по-разному. С явной шириной все три получают одинаковый бокс.
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: CERT_DESIGN_ASPECT, boxShadow: "0 24px 60px -30px rgba(0,0,0,0.75)" }}
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

        {/* Единственная строка поверх фото — короткая по определению,
            переполниться не может ни при каком составе сертификата. */}
        <div
          className="absolute flex flex-col items-center text-center"
          style={{
            top: `${archBox.top}%`,
            height: `${archBox.bottom - archBox.top}%`,
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
        </div>
      </div>

      {/* Состав, сумма и остальные динамические данные — под картинкой,
          обычный поток документа: сколько бы строк ни было, блок просто
          растёт по высоте, ничего не обрезается и не накладывается. Цвета —
          обычные токены темы страницы (cream/gold), не archInk: этот текст
          сидит на фоне карточки-страницы, а не на фото. */}
      <div className={`flex flex-col items-center text-center text-cream ${compact ? "mt-2" : "mt-4"}`}>
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
          className={`font-display text-gold shrink-0 leading-[1.1] italic ${lines ? "mt-1.5" : ""} ${compact ? "text-base" : "text-xl sm:text-2xl"}`}
        >
          {valueLabel}
        </p>

        {/* Пожелание — то, что пользователь ввёл в форме; если поле пустое,
            дальше строки просто нет. */}
        {message && (
          <p
            className={`font-display mt-2 shrink-0 leading-snug italic text-cream/90 ${compact ? "text-[0.65rem]" : "text-sm"}`}
          >
            «{message}»
          </p>
        )}

        {!compact && (recipient || sender) && (
          <p className="mt-2 shrink-0 text-[0.65rem] text-cream/70">
            {recipient && `${t("cert.cardTo")}: ${recipient}`}
            {recipient && sender && " · "}
            {sender && `${t("cert.cardFrom")}: ${sender}`}
          </p>
        )}

        {!compact && (branch || bookingNote) && (
          <p className="mt-1 shrink-0 text-[0.62rem] leading-relaxed text-cream/55">
            {branch && `${t("cert.cardBranch")}: ${branch}`}
            {branch && bookingNote && " · "}
            {bookingNote}
          </p>
        )}

        {!compact && (
          <p className="mt-2 shrink-0 text-[0.6rem] tracking-[0.2em] text-cream/60 uppercase">
            {t("cert.cardValidity")}
            {number && ` · № ${number}`}
          </p>
        )}
      </div>
    </div>
  );
}
