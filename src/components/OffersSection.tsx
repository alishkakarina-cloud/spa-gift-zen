import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Divider } from "@/components/Divider";
import { Motif } from "@/components/Motif";
import { ServiceCatalogBrowser } from "@/components/ServiceCatalogBrowser";
import { useLanguage } from "@/i18n/LanguageContext";
import { MIN_AMOUNT, fixedAmounts, formatPrice } from "@/data/catalog";
import { BRANCHES, spaMenuPdfFor, type Branch } from "@/data/branches";
import type { CatalogGroup } from "@/data/serviceGroups";
import { serializeServiceIds } from "@/data/selection";
import { useCart } from "@/context/CartContext";

type Selection = { kind: "amount" } | null;

/**
 * Выбор города/суммы + каталог услуг — раньше жил только на /offers,
 * теперь физически рендерится и там, и на главной "/" (сразу под hero,
 * без перехода), чтобы страница была одной скроллящейся лентой, как
 * просили. Вынесено в отдельный компонент, а не задублировано в двух
 * файлах — /offers остаётся отдельным маршрутом (для прямых ссылок) и
 * рендерит тот же компонент.
 *
 * id="buy" на первой секции — цель для доскролла с кнопки «Купить
 * сертификат» в hero главной.
 */
export function OffersSection() {
  const { t } = useLanguage();

  const [servicesGroupId, setServicesGroupId] = useState<CatalogGroup>("massage");
  // Общее на весь сайт состояние (CartContext) — то же самое, что показывает
  // FloatingCart, чтобы счётчик услуг в корзине совпадал с тем, что реально
  // отмечено в каталоге, а не жил отдельным счётом на каждой странице.
  const { selectedServiceIds, toggle: toggleService, clear: clearServices } = useCart();

  // Сумма — по-прежнему полноценный выбор, ведущий в мастер оформления.
  const [selection, setSelection] = useState<Selection>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(fixedAmounts[0]!);
  const [customAmount, setCustomAmount] = useState("");
  // Раньше просто разворот панели «Указать сумму» (toggleAmount) сразу же
  // включал «Далее» на молчаливом дефолте fixedAmounts[0] (20 000 ₸) — кто
  // хотел выбрать услугу, но из любопытства открывал панель суммы, мог
  // случайно улететь в оформление на 20 000 ₸, вообще не выбрав сумму
  // (баг, воспроизведённый и подтверждённый владельцем 2026-08-21). Теперь
  // «Далее» появляется только после явного клика по конкретной сумме/ввода
  // своей — открытие панели само по себе выбором не считается.
  const [amountPicked, setAmountPicked] = useState(false);

  // Город — клик только выбирает/подсвечивает, сам по себе никуда не
  // ведёт. Переход к каталогу — общей кнопкой «Далее» ниже (см.
  // scrollToServices), неактивной, пока не выбран ни город, ни сумма.
  // Город и сумма — взаимоисключающие варианты одного и того же
  // трёхпунктового переключателя (см. комментарий у return ниже): выбор
  // одного снимает выбор другого, иначе для одной кнопки «Далее» было бы
  // неясно, куда вести при выбранных обоих сразу.
  const [activeCity, setActiveCity] = useState<Branch | null>(null);
  const scrollToServices = () =>
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const pickCity = (id: Branch) => {
    setActiveCity(id);
    setAmountPicked(false);
  };

  const parsedCustom = Number(customAmount);
  const effectiveAmount =
    customAmount && Number.isFinite(parsedCustom) && parsedCustom >= MIN_AMOUNT
      ? parsedCustom
      : selectedAmount;

  const amountOpen = selection?.kind === "amount";

  const toggleAmount = () => setSelection((s) => (s?.kind === "amount" ? null : { kind: "amount" }));

  return (
    <>
      {/* ── Выбор: город или сумма — три равноправных пункта-переключателя.
          Переход к мастеру — только по «Далее» внизу, не по самим кнопкам
          (по образцу layan.kz). ─────────────────────────────────────────── */}
      <section id="buy" className="relative overflow-hidden">
        <Divider motif="waveCrown" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-5xl px-5 pt-10 pb-12 sm:px-6 sm:pt-12 sm:pb-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Motif name="petalDiamond" className="text-gold h-7 w-7" />
              <p className="eyebrow">{t("home.buyEyebrow")}</p>
            </div>
            {/* Бессрочность — по ТЗ должна быть видна и на карточке выбора
                сертификата, не только в hero/преимуществах/FAQ. */}
            <span className="border-gold/45 text-gold rounded-full border px-3 py-1 text-[0.62rem] tracking-[0.2em] uppercase">
              {t("home.buyEndless")}
            </span>
          </div>
          <h1 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("cert.step1Title")}
          </h1>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {BRANCHES.map((b) => {
              const selected = activeCity === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => pickCity(b.id)}
                  aria-pressed={selected}
                  className={`surface p-6 text-left transition-colors ${
                    selected ? "border-gold bg-gold/10" : "hover:border-gold/60"
                  }`}
                >
                  <span className={`font-display block text-xl sm:text-2xl ${selected ? "text-gold" : ""}`}>
                    {t("home.buyCityPrefix")} {t(b.labelKey)}
                  </span>
                  <span className="text-cream/65 mt-2 block text-sm">{b.address}</span>
                </button>
              );
            })}

            <div
              className={`surface overflow-hidden text-left transition-colors ${
                amountOpen ? "border-gold bg-gold/10" : "hover:border-gold/60"
              }`}
            >
              <button
                type="button"
                onClick={toggleAmount}
                aria-expanded={amountOpen}
                className="w-full p-6 text-left"
              >
                <span className={`font-display block text-xl sm:text-2xl ${amountOpen ? "text-gold" : ""}`}>
                  {t("home.buyAmountToggle")}
                </span>
                <span className="text-cream/65 mt-2 block text-sm">
                  {t("cert.choiceAmountFrom", { amount: formatPrice(MIN_AMOUNT) })}
                </span>
              </button>

              {/* Разворот по высоте через grid-template-rows 0fr→1fr — плавно
                  анимируется до реальной высоты содержимого без измерения в
                  JS. Плюс fade содержимого, чтобы появление не было резким. */}
              <div
                className="grid transition-[grid-template-rows] duration-[350ms] ease-in-out"
                style={{ gridTemplateRows: amountOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div
                    className={`px-6 pb-6 transition-opacity duration-300 ${
                      amountOpen ? "opacity-100 delay-100" : "opacity-0"
                    }`}
                  >
                    <div className="flex flex-wrap gap-2">
                      {fixedAmounts.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(a);
                            setCustomAmount("");
                            setAmountPicked(true);
                            setActiveCity(null);
                          }}
                          aria-pressed={amountPicked && !customAmount && selectedAmount === a}
                          className={`rounded-md border px-4 py-2.5 text-sm transition-colors ${
                            amountPicked && !customAmount && selectedAmount === a
                              ? "border-gold bg-gold text-primary-foreground"
                              : "border-border bg-card text-cream hover:border-gold/60"
                          }`}
                        >
                          {formatPrice(a)}
                        </button>
                      ))}
                    </div>

                    <label
                      className={`bg-card mt-3 block rounded-md border p-3 transition-colors ${
                        customAmount ? "border-gold" : "border-border"
                      }`}
                    >
                      <span
                        className={`text-xs transition-colors ${customAmount ? "text-gold" : "text-cream/60"}`}
                      >
                        {t("home.buyAmountCustom")}
                      </span>
                      <input
                        type="number"
                        min={MIN_AMOUNT}
                        step={1000}
                        value={customAmount}
                        onChange={(e) => {
                          const next = e.target.value;
                          setCustomAmount(next);
                          // Пустое поле — просто вернулись к ранее нажатой
                          // фиксированной сумме (если она была), трогать
                          // amountPicked не нужно; невалидное значение
                          // (меньше MIN_AMOUNT) — явно снимаем выбор.
                          if (next) {
                            const v = Number(next);
                            const valid = Number.isFinite(v) && v >= MIN_AMOUNT;
                            setAmountPicked(valid);
                            if (valid) setActiveCity(null);
                          }
                        }}
                        placeholder={String(MIN_AMOUNT)}
                        className={`border-input focus:border-gold bg-background mt-2 w-full border px-3 py-2.5 text-sm outline-none ${customAmount ? "border-gold text-gold" : ""}`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Одна общая «Далее» на все три пункта переключателя выше — город
              и сумма взаимоисключающие (см. pickCity/onClick сумм: выбор
              одного снимает выбор другого), поэтому в любой момент активен
              максимум один путь. Сумма выбрана → ведёт в мастер оформления
              (Link). Город выбран → доскраливает к каталогу услуг тут же
              на странице (обычная кнопка, не переход). Ничего не выбрано →
              неактивна. */}
          {selection?.kind === "amount" && amountPicked ? (
            <Link
              to="/certificate"
              search={{ kind: "amount", amount: effectiveAmount }}
              className="btn-gold mt-8"
            >
              {t("cert.nextButton")}
            </Link>
          ) : activeCity ? (
            <button type="button" onClick={scrollToServices} className="btn-gold mt-8">
              {t("cert.nextButton")}
            </button>
          ) : (
            <button type="button" disabled className="btn-gold mt-8 cursor-not-allowed opacity-40">
              {t("cert.nextButton")}
            </button>
          )}
        </div>
      </section>

      {/* ── Каталог услуг — тот же компонент, что и на шаге 1 мастера
          оформления (/certificate) — единый источник правды по ценам и
          описаниям. ────────────────────────────────────────────────────── */}
      <section id="services" className="relative overflow-hidden">
        <Divider motif="swirlLeaf" className="pt-8 sm:pt-10" />
        <div className="relative mx-auto max-w-6xl px-5 pt-6 pb-16 sm:px-6 sm:pb-24">
          <div className="flex items-center gap-3">
            <Motif name="waterLines" className="text-gold h-6 w-8 sm:h-7 sm:w-9" />
            <p className="eyebrow">{t("catalog.title")}</p>
          </div>
          <h2 className="font-display mt-4 text-2xl sm:mt-5 sm:text-3xl lg:text-4xl">
            {t("catalog.title")}
          </h2>
          <p className="text-cream/65 mt-3 max-w-lg text-sm leading-relaxed">
            {t("catalog.subtitle")}
          </p>

          <a href={spaMenuPdfFor()} download className="btn-ghost mt-5 text-[0.62rem]">
            {t("catalog.menuButton")}
          </a>

          <div className="mt-10">
            <ServiceCatalogBrowser
              groupId={servicesGroupId}
              onGroupChange={setServicesGroupId}
              selectedIds={selectedServiceIds}
              onToggle={toggleService}
              onClear={clearServices}
              t={t}
              action={
                <Link
                  to="/certificate"
                  search={{ services: serializeServiceIds(selectedServiceIds) }}
                  className="btn-gold"
                >
                  {t("cert.giftButton")}
                </Link>
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}
