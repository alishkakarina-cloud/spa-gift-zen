import type { ReactNode } from "react";
import { AtmosphereGallery } from "@/components/AtmosphereGallery";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Motif } from "@/components/Motif";
import { SelectionSummary } from "@/components/SelectionSummary";
import { ServiceFamilyCard } from "@/components/ServiceFamilyCard";
import { SERVICE_GROUPS, familiesInGroup, serviceGroupCounts, type CatalogGroup } from "@/data/serviceGroups";

/**
 * Витрина каталога: атмосферная галерея, зациклённая карусель категорий и
 * сетка карточек услуг выбранной категории.
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

      {/* id + scroll-mt — цель для автоскролла с кнопки «Далее» в
          OffersSection: приземляемся сразу на карусель категорий и
          заголовок текущей категории, а не на общий заголовок «Каталог»
          и галерею выше по разделу. */}
      <div id="categories-block" className="mt-10 flex items-center gap-3 scroll-mt-24">
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

        {/* Сетка карточек (правка 2026-08-22, откат к версии до 19:50) —
            была списком компактных строк в одну колонку, владелец счёл
            вид хуже прежней сетки. */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {familiesInGroup(groupId).map((family) => (
            <ServiceFamilyCard
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
