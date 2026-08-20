import { CategoryCarousel } from "@/components/CategoryCarousel";
import { ServiceFamilyCard } from "@/components/ServiceFamilyCard";
import { SERVICE_GROUPS, familiesInGroup, serviceGroupCounts, type CatalogGroup } from "@/data/serviceGroups";

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
        categories={serviceGroupCounts()}
        activeId={groupId}
        onSelect={(id) => onGroupChange(id as CatalogGroup)}
        t={t}
        prevLabel={t("cert.railPrev")}
        nextLabel={t("cert.railNext")}
      />

      {/* key={groupId} — при смене категории блок перемонтируется, поэтому
          panel-reveal (см. styles.css, тайминг снят с layan.kz) проигрывается
          заново на каждое переключение. Раньше список менялся мгновенно. */}
      <div key={groupId} className="panel-reveal">
        <h2 className="font-display mt-8 text-xl sm:text-2xl">{t(activeGroup.labelKey)}</h2>
        {activeGroup.noteKey && (
          <p className="border-gold/35 bg-gold/5 text-cream/75 mt-3 rounded-md border px-4 py-3 text-sm leading-relaxed">
            {t(activeGroup.noteKey)}
          </p>
        )}

        <p className="text-cream/55 mt-3 text-sm">{t("cert.selectHint")}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
      </div>
    </div>
  );
}
