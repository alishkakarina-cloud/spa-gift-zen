import { Link } from "@tanstack/react-router";
import { AtmosphereGallery } from "@/components/AtmosphereGallery";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { Motif } from "@/components/Motif";
import { formatPrice, serviceImage, services, type Service } from "@/data/catalog";
import { SERVICE_GROUPS, serviceGroupCounts } from "@/data/serviceGroups";

/**
 * Витрина каталога: атмосферная галерея, зациклённая карусель категорий и
 * вертикальный список услуг выбранной категории.
 *
 * Используется только на /catalog. Раздел сертификатов свою услугу выбирает
 * отдельным простым списком (ServicePicker) — витрина туда не попадает.
 * Единственный переход в сертификаты — кнопка «Подарить эту услугу» на
 * карточке, она уносит выбранную услугу в /certificate через ?service=.
 */
export function ServiceCatalogBrowser({
  groupId,
  onGroupChange,
  t,
}: {
  groupId: Service["group"];
  onGroupChange: (group: Service["group"]) => void;
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
              <article key={s.id} className="surface flex gap-4 overflow-hidden p-3">
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
                  <Link
                    to="/certificate"
                    search={{ service: s.id }}
                    className="text-gold/85 hover:text-gold mt-1 self-start text-[0.65rem] tracking-[0.24em] uppercase transition-colors"
                  >
                    {t("catalog.giftThis")} →
                  </Link>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
