import { formatPrice, services } from "@/data/catalog";
import { SERVICE_GROUPS } from "@/data/serviceGroups";

/**
 * Выбор услуги внутри оформления сертификата.
 *
 * Намеренно не витрина: ни галереи, ни карусели категорий, ни фотографий —
 * это часть формы заказа. Каталог как витрина живёт отдельно, на /catalog.
 */
export function ServicePicker({
  selectedId,
  onSelect,
  t,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  t: (path: string) => string;
}) {
  return (
    <div className="space-y-7">
      {SERVICE_GROUPS.map((group) => {
        const groupServices = services.filter((s) => s.group === group.id);
        if (groupServices.length === 0) return null;

        return (
          <div key={group.id}>
            <p className="eyebrow">{t(group.labelKey)}</p>
            <div className="border-border mt-3 border-t">
              {groupServices.map((s) => {
                const active = selectedId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelect(s.id)}
                    aria-pressed={active}
                    className={`border-border flex w-full flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-3 py-3 text-left transition-colors ${active ? "bg-gold/10 text-gold" : "hover:bg-gold/5"}`}
                  >
                    <span className="min-w-0 flex-1 text-sm">{t(`services.${s.id}.name`)}</span>
                    {t(`services.${s.id}.duration`) && (
                      <span className="text-cream/45 text-[0.62rem] tracking-[0.2em] uppercase">
                        {t(`services.${s.id}.duration`)}
                      </span>
                    )}
                    <span className={`text-sm ${active ? "text-gold" : "text-cream/75"}`}>
                      {formatPrice(s.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
