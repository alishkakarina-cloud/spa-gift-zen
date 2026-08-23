import { useState } from "react";
import { formatPrice, serviceImage, type Service, type ServiceFamily } from "@/data/catalog";

/** «, 90 минут» / «, 120 минут» — хвост названия конкретного варианта,
 *  который не нужен в заголовке карточки-семьи (там уже есть переключатель). */
const NAME_DURATION_SUFFIX = /,\s*\d+\s*минут[а-я]*$/i;

/** Общая логика выбора длительности внутри семьи — карточка и строка каталога
 *  используют один и тот же расчёт, просто рисуют его по-разному. */
function useFamilySelection(family: ServiceFamily, selectedIds: ReadonlyArray<string>) {
  const { variants } = family;
  // Если один из вариантов уже в сертификате — переключатель открывается на
  // нём, а не всегда на самом коротком, иначе выбор «терялся бы» на вид.
  const [chosenId, setChosenId] = useState(
    () => variants.find((v) => selectedIds.includes(v.id))?.id ?? variants[0]!.id,
  );
  const chosen = variants.find((v) => v.id === chosenId) ?? variants[0]!;
  const active = selectedIds.includes(chosenId);
  return { chosenId, setChosenId, chosen, active };
}

/** Подпись варианта в переключателе — длительность, либо, если у услуги
 *  задан `variantLabelKey` (например «1 персона» / «2 персоны»), она. */
const variantLabel = (v: Service, t: (path: string) => string) =>
  v.variantLabelKey ? t(v.variantLabelKey) : t(`services.${v.id}.duration`);

function DurationSwitch({
  variants,
  chosenId,
  onChoose,
  label,
  t,
}: {
  variants: ReadonlyArray<Service>;
  chosenId: string;
  onChoose: (id: string) => void;
  label: string;
  t: (path: string) => string;
}) {
  if (variants.length <= 1) {
    // У одного варианта нет отдельной "цены сверху" карточки (убрана как
    // дублирующая — см. ServiceFamilyCard), поэтому здесь, в отличие от
    // прежней версии, показываем и цену тоже, а не только длительность —
    // иначе для одновариантных услуг цена не показывалась бы нигде вообще.
    const only = variants[0]!;
    const l = variantLabel(only, t);
    return (
      <span className="text-gold text-xs sm:text-sm">
        {formatPrice(only.price)}
        {l ? ` / ${l}` : ""}
      </span>
    );
  }
  return (
    // Все варианты видны сразу своей ценой и подписью (длительность или,
    // для семей вроде «Путешествие в Таиланд», количество персон) — выбор
    // не прячется за одним числом на карточке.
    <div className="flex flex-wrap justify-center gap-1" role="radiogroup" aria-label={label}>
      {variants.map((v) => (
        <button
          key={v.id}
          type="button"
          role="radio"
          aria-checked={v.id === chosenId}
          onClick={() => onChoose(v.id)}
          className={`rounded-md border px-2 py-1 text-[0.62rem] whitespace-nowrap transition-colors ${
            v.id === chosenId
              ? "border-gold bg-gold text-primary-foreground"
              : "border-border bg-card text-cream/80 hover:border-gold/60"
          }`}
        >
          {formatPrice(v.price)} / {variantLabel(v, t)}
        </button>
      ))}
    </div>
  );
}


function SelectPill({
  active,
  onClick,
  t,
}: {
  active: boolean;
  onClick: () => void;
  t: (path: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // Золотое свечение при выборе — box-shadow, а не просто смена цвета,
      // чтобы состояние «отмечено» было заметно с первого взгляда.
      className={`shrink-0 rounded-md border px-4 py-2 text-[0.62rem] tracking-[0.2em] uppercase transition-all duration-300 ${
        active
          ? "border-gold bg-gold text-primary-foreground"
          : "border-gold/45 text-gold hover:bg-gold/10"
      }`}
      style={
        active
          ? { boxShadow: "0 0 0 1px var(--color-gold), 0 0 18px 3px rgba(180, 151, 117, 0.5)" }
          : undefined
      }
    >
      {active ? t("cert.selectionChosen") : t("cert.selectionChoose")}
    </button>
  );
}

type Props = {
  family: ServiceFamily;
  selectedIds: ReadonlyArray<string>;
  onToggle: (id: string) => void;
  t: (path: string) => string;
};

/** Компактная горизонтальная карточка: маленькое фото слева, название+цена
 *  и переключатель вариантов в одном текстовом блоке, кнопка «Выбрать»
 *  справа — без описания услуги. Правка владельца 2026-08-23: прежняя
 *  версия (фото на всю ширину сверху + описание) признана слишком крупной,
 *  занимала весь экран на мобильном. Используется на витрине /offers
 *  (ServiceCatalogBrowser) — единственном месте, где каталог сейчас виден
 *  без предвыбора конкретной услуги. */
export function ServiceFamilyCard({ family, selectedIds, onToggle, t }: Props) {
  const { variants } = family;
  const { chosenId, setChosenId, chosen, active } = useFamilySelection(family, selectedIds);
  const image = serviceImage(variants[0]!.id);
  const name = t(`services.${variants[0]!.id}.name`).replace(NAME_DURATION_SUFFIX, "");

  return (
    // Без gap/padding вокруг фото (правка владельца 2026-08-23, «квадрат в
    // квадрате») — фото сидит вплотную к краям карточки и вплотную к
    // текстовому блоку, только у текста/кнопки собственный внутренний
    // отступ. items-stretch (дефолт flex, явно не задан) вместо прежнего
    // items-center — следующая правка владельца: фото растягивается на всю
    // динамическую высоту карточки (от заголовка до последнего варианта
    // времени), а не сидит маленьким квадратом по центру более высокой
    // карточки. Ширина фото при этом не меняется — она задана на самом
    // фото-контейнере (w-16 sm:w-20), а не выведена из его высоты.
    <article
      className={`surface flex overflow-hidden transition-colors ${active ? "border-gold" : ""}`}
    >
      {image && (
        <div className="relative w-16 shrink-0 sm:w-20">
          <img
            src={image}
            alt=""
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          {family.hit && (
            <span className="bg-maroon border-gold/50 text-cream absolute top-0.5 left-0.5 rounded-full border px-1 py-0.5 text-[0.45rem] font-medium tracking-[0.05em] uppercase">
              {t("catalog.hitBadge")}
            </span>
          )}
        </div>
      )}
      <div className="min-w-0 flex-1 px-3 py-2">
        {/* Цена отдельной строкой сверху убрана (правка владельца
            2026-08-23) — она дублировала цену, уже показанную в каждом
            варианте переключателя ниже ("18 000 ₸ / 60 мин" и т.п.); для
            услуг с одним вариантом цена по-прежнему видна — теперь через
            сам DurationSwitch (см. его single-variant ветку выше). */}
        <h3 className="font-display text-sm leading-tight sm:text-base">{name}</h3>
        <div className="mt-1">
          <DurationSwitch variants={variants} chosenId={chosenId} onChoose={setChosenId} label={name} t={t} />
        </div>
      </div>
      {/* flex items-center — кнопка сама по себе невысокая, а её обёртка
          теперь тоже растягивается на всю высоту строки (items-stretch на
          article), центрируем её содержимое вручную, чтобы не съезжала к
          верху. */}
      <div className="flex shrink-0 items-center px-2">
        <SelectPill active={active} onClick={() => onToggle(chosenId)} t={t} />
      </div>
    </article>
  );
}

/** Компактная горизонтальная строка — использовалась на шаге выбора услуги
 *  мастера оформления /certificate (ServiceChooser), пока переключатель
 *  «На любую услугу» не был убран с того шага (правка 2026-08-22, отдельная
 *  задача); сам ServiceChooser теперь нигде не импортируется. */
export function ServiceFamilyRow({ family, selectedIds, onToggle, t }: Props) {
  const { variants } = family;
  const { chosenId, setChosenId, chosen, active } = useFamilySelection(family, selectedIds);
  const image = serviceImage(variants[0]!.id);
  const name = t(`services.${variants[0]!.id}.name`).replace(NAME_DURATION_SUFFIX, "");

  return (
    <article className={`surface flex gap-2 overflow-hidden p-2 transition-colors sm:gap-3 ${active ? "border-gold" : ""}`}>
      {image && (
        <div className="relative shrink-0 self-center">
          <img
            src={image}
            alt=""
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="h-14 w-14 rounded-md object-cover sm:h-24 sm:w-24"
          />
          {family.hit && (
            <span className="bg-maroon border-gold/50 text-cream absolute top-1 left-1 rounded-full border px-1.5 py-0.5 text-[0.5rem] font-medium tracking-[0.1em] uppercase">
              {t("catalog.hitBadge")}
            </span>
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-2">
        {/* Заголовок и цена раньше делили одну flex-строку (justify-between) —
            на узком мобильном название реально зажималось уже соседством с
            ценой в той же строке, а не только шириной всей колонки, из-за
            чего оно дробилось на 3+ строки даже там, где само по себе
            поместилось бы в 1-2. Отдельные строки — название получает всю
            ширину колонки под перенос текста. */}
        <h3 className="font-display text-base leading-tight sm:text-lg">{name}</h3>
        <span className="text-gold text-sm">{formatPrice(chosen.price)}</span>
        <DurationSwitch variants={variants} chosenId={chosenId} onChoose={setChosenId} label={name} t={t} />
        {/* Раньше line-clamp-2 обрезал описание многоточием — по правке
            владельца текст должен быть виден целиком. Карточка при этом
            получалась слишком высокой из-за узкой текстовой колонки на
            мобильном (много строк переноса) — компенсируем уменьшенными
            отступами/фото вокруг (см. выше) и более плотным шрифтом самого
            описания (не заголовка, не цены; правка 2026-08-22). */}
        <p className="text-cream/70 text-[0.7rem] leading-tight">
          {t(`services.${chosen.id}.description`)}
        </p>
      </div>
      <div className="flex shrink-0 items-center">
        <SelectPill active={active} onClick={() => onToggle(chosenId)} t={t} />
      </div>
    </article>
  );
}
