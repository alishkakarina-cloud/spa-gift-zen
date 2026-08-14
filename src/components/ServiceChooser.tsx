import { CategoryCarousel } from "@/components/CategoryCarousel";
import { ServiceCheckbox } from "@/components/ServiceCheckbox";
import { formatPrice, serviceImage } from "@/data/catalog";
import {
  SERVICE_GROUPS,
  serviceGroupCounts,
  servicesInGroup,
  type CatalogGroup,
} from "@/data/serviceGroups";

/**
 * Выбор программ внутри оформления сертификата.
 *
 * Категории листаются той же зациклённой каруселью, что и в разделе «Наши
 * услуги» (CategoryCarousel) — второй механизм не заводим. Услуги отмечаются
 * чекбоксами: в один сертификат можно положить несколько программ, стоимость
 * складывается. Поэтому карточка больше не уносит сразу к оформлению —
 * переход делает общая кнопка под сводкой выбранного.
 */
export function ServiceChooser({
  groupId,
  onGroupChange,
  selectedIds,
  onToggle,
  t,
}: {
  groupId: CatalogGroup;
  onGroupChange: (group: CatalogGroup) => void;
  selectedIds: ReadonlyArray<string>;
  onToggle: (id: string) => void;
  t: (path: string) => string;
}) {
  const activeGroup = SERVICE_GROUPS.find((g) => g.id === groupId)!;

  return (
    <div className="min-w-0">
      <CategoryCarousel
        // «Акции» сюда не попадают: это не Service, дарить акцию сертификатом
        // нельзя — у неё нет ни цены, ни состава. Карусель выбора программы
        // должна содержать только реально дариваемые категории.
        categories={serviceGroupCounts().filter((g) => g.id !== "promotions")}
        activeId={groupId}
        onSelect={(id) => onGroupChange(id as CatalogGroup)}
        t={t}
        prevLabel={t("cert.railPrev")}
        nextLabel={t("cert.railNext")}
      />

      <h2 className="font-display mt-8 text-xl sm:text-2xl">{t(activeGroup.labelKey)}</h2>
      {activeGroup.noteKey && (
        <p className="border-gold/35 bg-gold/5 text-cream/75 mt-3 rounded-md border px-4 py-3 text-sm leading-relaxed">
          {t(activeGroup.noteKey)}
        </p>
      )}

      <p className="text-cream/55 mt-3 text-sm">{t("cert.selectHint")}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {servicesInGroup(groupId).map((s) => {
            const image = serviceImage(s.id);
            const active = selectedIds.includes(s.id);
            return (
              <label
                key={s.id}
                className={`surface flex cursor-pointer flex-col overflow-hidden rounded-lg transition-colors ${active ? "border-gold" : "hover:border-gold/60"}`}
              >
                <div className="relative">
                  {image && (
                    <img
                      src={image}
                      alt=""
                      width={720}
                      height={720}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  )}
                  <ServiceCheckbox
                    checked={active}
                    onChange={() => onToggle(s.id)}
                    label={t(`services.${s.id}.name`)}
                    className="absolute top-3 right-3"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-display text-lg leading-tight">
                    {t(`services.${s.id}.name`)}
                  </h3>
                  {t(`services.${s.id}.duration`) && (
                    <span className="text-cream/45 text-[0.62rem] tracking-[0.2em] uppercase">
                      {t(`services.${s.id}.duration`)}
                    </span>
                  )}
                  <p className="text-cream/70 line-clamp-2 text-sm leading-relaxed">
                    {t(`services.${s.id}.description`)}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <span className="text-gold text-sm">{formatPrice(s.price)}</span>
                    <span
                      className={`text-[0.62rem] tracking-[0.2em] uppercase transition-colors ${active ? "text-gold" : "text-cream/45"}`}
                    >
                      {active ? t("cert.selectionChosen") : t("cert.selectionChoose")}
                    </span>
                  </div>
                </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
