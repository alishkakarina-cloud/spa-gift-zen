import type { ReactNode } from "react";
import { AtmosphereGallery } from "@/components/AtmosphereGallery";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Motif } from "@/components/Motif";
import { SelectionSummary } from "@/components/SelectionSummary";
import { ServiceCheckbox } from "@/components/ServiceCheckbox";
import { formatPrice, serviceImage } from "@/data/catalog";
import {
  SERVICE_GROUPS,
  serviceGroupCounts,
  servicesInGroup,
  type CatalogGroup,
} from "@/data/serviceGroups";

/**
 * Витрина каталога: атмосферная галерея, зациклённая карусель категорий и
 * вертикальный список услуг выбранной категории.
 *
 * Используется только на /catalog. Услуги отмечаются чекбоксами и копятся в
 * общем выборе — он живёт в самой странице, поэтому переключение категории
 * набранное не сбрасывает. Переход в /certificate делает одна кнопка под
 * сводкой, она уносит сразу весь список через ?services=.
 */
export function ServiceCatalogBrowser({
  groupId,
  onGroupChange,
  selectedIds,
  onToggle,
  onClear,
  action,
  t,
}: {
  groupId: CatalogGroup;
  onGroupChange: (group: CatalogGroup) => void;
  selectedIds: ReadonlyArray<string>;
  onToggle: (id: string) => void;
  onClear: () => void;
  action: ReactNode;
  t: (path: string) => string;
}) {
  const activeGroup = SERVICE_GROUPS.find((g) => g.id === groupId)!;

  return (
    <div>
      <AtmosphereGallery label={t("cert.galleryLabel")} />

      <div className="mt-10 flex items-center gap-3">
        <Motif name={activeGroup.motif} className="text-gold h-7 w-7" />
        <p className="eyebrow">{t("cert.categoriesEyebrow")}</p>
      </div>
      <div className="mt-4">
        <CategoryCarousel
          categories={serviceGroupCounts()}
          activeId={groupId}
          onSelect={(id) => onGroupChange(id as CatalogGroup)}
          t={t}
          prevLabel={t("cert.railPrev")}
          nextLabel={t("cert.railNext")}
        />
      </div>

      <h2 className="font-display mt-10 text-2xl">{t(activeGroup.labelKey)}</h2>
      {activeGroup.noteKey && (
        <p className="border-gold/35 bg-gold/5 text-cream/75 mt-3 rounded-md border px-4 py-3 text-sm leading-relaxed">
          {t(activeGroup.noteKey)}
        </p>
      )}
      <p className="text-cream/55 mt-3 text-sm">{t("cert.selectHint")}</p>

      <div className="mt-4 grid gap-3">
        {servicesInGroup(groupId).map((s) => {
            const image = serviceImage(s.id);
            const active = selectedIds.includes(s.id);
            return (
              <label
                key={s.id}
                className={`surface flex cursor-pointer gap-4 overflow-hidden p-3 transition-colors ${active ? "border-gold" : "hover:border-gold/60"}`}
              >
                {image && (
                  <img
                    src={image}
                    alt=""
                    width={720}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-24 shrink-0 rounded-md object-cover sm:h-28 sm:w-28"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-1 pr-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg">{t(`services.${s.id}.name`)}</h3>
                    <span className="text-gold text-sm">{formatPrice(s.price)}</span>
                  </div>
                  {t(`services.${s.id}.duration`) && (
                    <span className="text-cream/50 text-[0.65rem] tracking-[0.2em] uppercase">
                      {t(`services.${s.id}.duration`)}
                    </span>
                  )}
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {t(`services.${s.id}.description`)}
                  </p>
                </div>
                <ServiceCheckbox
                  checked={active}
                  onChange={() => onToggle(s.id)}
                  label={t(`services.${s.id}.name`)}
                  className="self-center pr-1"
                />
            </label>
          );
        })}
      </div>

      <SelectionSummary
        ids={selectedIds}
        onRemove={onToggle}
        onClear={onClear}
        t={t}
        action={action}
      />
    </div>
  );
}
