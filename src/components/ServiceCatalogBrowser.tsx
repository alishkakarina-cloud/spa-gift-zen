import { AtmosphereGallery } from "@/components/AtmosphereGallery";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Motif } from "@/components/Motif";
import { formatPrice, serviceImage, services, type Service } from "@/data/catalog";
import { SERVICE_GROUPS, serviceGroupCounts } from "@/data/serviceGroups";

/**
 * Атмосферная галерея + зациклённая карусель категорий + вертикальный
 * список услуг выбранной категории. Общий блок для мастера оформления
 * (/certificate, шаг 1) и самостоятельной страницы каталога (/catalog) —
 * чтобы обе версии вели себя и выглядели идентично.
 */
export function ServiceCatalogBrowser({
  groupId,
  onGroupChange,
  selectedServiceId,
  onServiceSelect,
  t,
}: {
  groupId: Service["group"];
  onGroupChange: (group: Service["group"]) => void;
  selectedServiceId: string | null;
  onServiceSelect: (id: string) => void;
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
          onSelect={(id) => onGroupChange(id as Service["group"])}
          t={t}
          prevLabel={t("cert.railPrev")}
          nextLabel={t("cert.railNext")}
        />
      </div>

      <h2 className="font-display mt-10 text-2xl">{t(activeGroup.labelKey)}</h2>
      <div className="mt-4 grid gap-3">
        {services
          .filter((s) => s.group === groupId)
          .map((s) => {
            const image = serviceImage(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onServiceSelect(s.id)}
                className={`surface flex gap-4 overflow-hidden p-3 text-left transition-colors ${selectedServiceId === s.id ? "border-gold" : "hover:border-gold/60"}`}
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
                <span className="flex min-w-0 flex-1 flex-col gap-1.5 py-1 pr-2">
                  <span className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="font-display text-lg">{t(`services.${s.id}.name`)}</span>
                    <span className="text-gold text-sm">{formatPrice(s.price)}</span>
                  </span>
                  {t(`services.${s.id}.duration`) && (
                    <span className="text-cream/50 text-[0.65rem] tracking-[0.2em] uppercase">
                      {t(`services.${s.id}.duration`)}
                    </span>
                  )}
                  <span className="text-cream/70 text-sm leading-relaxed">
                    {t(`services.${s.id}.description`)}
                  </span>
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
