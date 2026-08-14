import { CategoryCarousel } from "@/components/CategoryCarousel";
import { formatPrice, serviceImage, services, type Service } from "@/data/catalog";
import { SERVICE_GROUPS, serviceGroupCounts } from "@/data/serviceGroups";

/**
 * Выбор программы внутри оформления сертификата.
 *
 * Категории листаются той же зациклённой каруселью, что и в разделе «Наши
 * услуги» (CategoryCarousel) — второй механизм не заводим. Программы внутри
 * категории — полноценные карточки: фото, название, короткое описание,
 * стоимость и кнопка «Подарить», которая сразу уносит выбор в форму заказа.
 */
export function ServiceChooser({
  groupId,
  onGroupChange,
  selectedId,
  onPick,
  t,
}: {
  groupId: Service["group"];
  onGroupChange: (group: Service["group"]) => void;
  selectedId: string | null;
  onPick: (id: string) => void;
  t: (path: string) => string;
}) {
  const activeGroup = SERVICE_GROUPS.find((g) => g.id === groupId)!;

  return (
    <div className="min-w-0">
      <CategoryCarousel
        categories={serviceGroupCounts()}
        activeId={groupId}
        onSelect={(id) => onGroupChange(id as Service["group"])}
        t={t}
        prevLabel={t("cert.railPrev")}
        nextLabel={t("cert.railNext")}
      />

      <h2 className="font-display mt-8 text-xl sm:text-2xl">{t(activeGroup.labelKey)}</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {services
          .filter((s) => s.group === groupId)
          .map((s) => {
            const image = serviceImage(s.id);
            const active = selectedId === s.id;
            return (
              <article
                key={s.id}
                className={`surface flex flex-col overflow-hidden rounded-lg transition-colors ${active ? "border-gold" : ""}`}
              >
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
                    <button
                      type="button"
                      onClick={() => onPick(s.id)}
                      className={`rounded-md border px-4 py-2 text-[0.62rem] tracking-[0.2em] uppercase transition-colors ${
                        active
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-gold/45 text-gold hover:bg-gold/10"
                      }`}
                    >
                      {t("cert.giftButton")}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
      </div>
    </div>
  );
}
