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
    const only = variants[0]!;
    return t(`services.${only.id}.duration`) ? (
      <span className="text-cream/45 text-[0.62rem] tracking-[0.2em] uppercase">
        {t(`services.${only.id}.duration`)}
      </span>
    ) : null;
  }
  return (
    // Все варианты видны сразу своей ценой и длительностью — выбор
    // длительности не прячется за одним числом на карточке.
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {variants.map((v) => (
        <button
          key={v.id}
          type="button"
          role="radio"
          aria-checked={v.id === chosenId}
          onClick={() => onChoose(v.id)}
          className={`rounded-md border px-2.5 py-1.5 text-[0.68rem] whitespace-nowrap transition-colors ${
            v.id === chosenId
              ? "border-gold bg-gold text-primary-foreground"
              : "border-border bg-card text-cream/80 hover:border-gold/60"
          }`}
        >
          {formatPrice(v.price)} / {t(`services.${v.id}.duration`)}
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

/** Карточка для сеток (шаг выбора в мастере оформления, витрина каталога). */
export function ServiceFamilyCard({ family, selectedIds, onToggle, t }: Props) {
  const { variants } = family;
  const { chosenId, setChosenId, chosen, active } = useFamilySelection(family, selectedIds);
  const image = serviceImage(variants[0]!.id);
  const name = t(`services.${variants[0]!.id}.name`).replace(NAME_DURATION_SUFFIX, "");

  return (
    <article className="surface flex flex-col overflow-hidden rounded-lg">
      {image && (
        <div className="relative">
          <img
            src={image}
            alt=""
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
          />
          {family.hit && (
            <span className="bg-gold text-primary-foreground absolute top-2 left-2 rounded-full px-2.5 py-1 text-[0.6rem] font-medium tracking-[0.15em] uppercase">
              {t("catalog.hitBadge")}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg leading-tight">{name}</h3>
        <DurationSwitch variants={variants} chosenId={chosenId} onChoose={setChosenId} label={name} t={t} />
        <p className="text-cream/70 line-clamp-2 text-sm leading-relaxed">
          {t(`services.${chosen.id}.description`)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <span className="text-gold text-sm">{formatPrice(chosen.price)}</span>
          <SelectPill active={active} onClick={() => onToggle(chosenId)} t={t} />
        </div>
      </div>
    </article>
  );
}

/** Строка для вертикального списка витрины /catalog — фото слева, текст
 *  посередине, кнопка «Выбрать» справа. Та же логика выбора длительности. */
export function ServiceFamilyRow({ family, selectedIds, onToggle, t }: Props) {
  const { variants } = family;
  const { chosenId, setChosenId, chosen, active } = useFamilySelection(family, selectedIds);
  const image = serviceImage(variants[0]!.id);
  const name = t(`services.${variants[0]!.id}.name`).replace(NAME_DURATION_SUFFIX, "");

  return (
    <article className={`surface flex gap-4 overflow-hidden p-3 transition-colors ${active ? "border-gold" : ""}`}>
      {image && (
        <div className="relative shrink-0">
          <img
            src={image}
            alt=""
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="h-24 w-24 rounded-md object-cover sm:h-28 sm:w-28"
          />
          {family.hit && (
            <span className="bg-gold text-primary-foreground absolute top-1 left-1 rounded-full px-1.5 py-0.5 text-[0.5rem] font-medium tracking-[0.1em] uppercase">
              {t("catalog.hitBadge")}
            </span>
          )}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1 pr-2">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-lg">{name}</h3>
          <span className="text-gold text-sm">{formatPrice(chosen.price)}</span>
        </div>
        <DurationSwitch variants={variants} chosenId={chosenId} onChoose={setChosenId} label={name} t={t} />
        <p className="text-cream/70 text-sm leading-relaxed">{t(`services.${chosen.id}.description`)}</p>
      </div>
      <div className="flex shrink-0 items-center">
        <SelectPill active={active} onClick={() => onToggle(chosenId)} t={t} />
      </div>
    </article>
  );
}
