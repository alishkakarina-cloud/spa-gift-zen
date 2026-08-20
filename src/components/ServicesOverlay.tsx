import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BottomSheet } from "@/components/BottomSheet";
import { BranchesSection } from "@/components/BranchesSection";
import { CertPerks } from "@/components/CertPerks";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { SiteFooter } from "@/components/SiteFooter";
import { useCart } from "@/context/CartContext";
import { BRANCHES, spaMenuPdfFor } from "@/data/branches";
import { serializeServiceIds } from "@/data/selection";
import type { CatalogGroup } from "@/data/serviceGroups";

/**
 * «Наши услуги» с главной открывает насыщенный оверлей поверх страницы
 * (правка владельца — не переход на отдельный маршрут), с разделами по
 * Block 1.1 ТЗ: салоны → сертификаты → каталог (+ СПА-меню по городам) →
 * футер. Все разделы — уже существующие компоненты, ничего не задублировано.
 *
 * /services остаётся отдельным рабочим маршрутом для прямых ссылок — этот
 * компонент его не заменяет, только даёт второй, более быстрый вход с
 * главной.
 */
export function ServicesOverlay({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: (path: string) => string;
}) {
  const [groupId, setGroupId] = useState<CatalogGroup>("massage");
  const { selectedServiceIds, toggle: toggleService, clear: clearServices } = useCart();

  return (
    <BottomSheet open={open} onClose={onClose} closeLabel={t("home.sheetClose")} widthClassName="max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-center text-2xl sm:text-3xl">
          {t("home.heroCatalogCta")}
        </h1>

        <BranchesSection t={t} />

        <CertPerks t={t} />

        <section className="relative overflow-hidden">
          <Divider motif="swirlLeaf" className="pt-4 sm:pt-6" />
          <div className="relative pt-8 pb-4">
            <div className="flex items-center gap-3">
              <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
              <p className="eyebrow">{t("catalog.title")}</p>
            </div>
            <h2 className="font-display mt-4 text-2xl sm:text-3xl">{t("catalog.title")}</h2>
            <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">
              {t("catalog.subtitle")}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {BRANCHES.map((b) => (
                <a
                  key={b.id}
                  href={spaMenuPdfFor(b.id)}
                  download
                  className="btn-ghost text-[0.62rem]"
                >
                  {t("catalog.menuButton")} — {t(b.labelKey)}
                </a>
              ))}
            </div>

            <div className="mt-10">
              <ServiceCatalogBrowser
                groupId={groupId}
                onGroupChange={setGroupId}
                selectedIds={selectedServiceIds}
                onToggle={toggleService}
                onClear={clearServices}
                t={t}
                action={
                  <Link
                    to="/certificate"
                    search={{ services: serializeServiceIds(selectedServiceIds) }}
                    className="btn-gold"
                    onClick={onClose}
                  >
                    {t("cert.giftButton")}
                  </Link>
                }
              />
            </div>
          </div>
        </section>

        <SiteFooter t={t} />
      </div>
    </BottomSheet>
  );
}
