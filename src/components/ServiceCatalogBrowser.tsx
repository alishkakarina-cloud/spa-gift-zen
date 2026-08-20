import type { ReactNode } from "react";
import { AtmosphereGallery } from "@/components/AtmosphereGallery";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Motif } from "@/components/Motif";
import { SelectionSummary } from "@/components/SelectionSummary";
import { ServiceFamilyRow } from "@/components/ServiceFamilyCard";
import { SERVICE_GROUPS, familiesInGroup, serviceGroupCounts, type CatalogGroup } from "@/data/serviceGroups";

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

      {/* key={groupId} — при смене категории блок перемонтируется, поэтому
          panel-reveal (см. styles.css, тайминг снят с layan.kz) проигрывается
          заново на каждое переключение. Раньше список менялся мгновенно. */}
      <div key={groupId} className="panel-reveal">
        <h2 className="font-display mt-10 text-2xl">{t(activeGroup.labelKey)}</h2>
        {activeGroup.noteKey && (
          <p className="border-gold/35 bg-gold/5 text-cream/75 mt-3 rounded-md border px-4 py-3 text-sm leading-relaxed">
            {t(activeGroup.noteKey)}
          </p>
        )}

        <p className="text-cream/55 mt-3 text-sm">{t("cert.selectHint")}</p>

        <div className="mt-4 grid gap-3">
          {familiesInGroup(groupId).map((family) => (
            <ServiceFamilyRow
              key={family.familyKey}
              family={family}
              selectedIds={selectedIds}
              onToggle={onToggle}
              t={t}
            />
          ))}
        </div>

        <SelectionSummary
          ids={selectedIds}
          onRemove={onToggle}
          onClear={onClear}
          t={t}
          action={action}
        />
      </div>
    </div>
  );
}
