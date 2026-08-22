import { Link, useNavigate } from "@tanstack/react-router";
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

  // Город — структура точно по layan.kz (проверено вживую 2026-08-22):
  // там кнопки города/суммы — верхний ряд переключателей ЧИСТО визуальный,
  // каталог услуг открыт сразу под ними на той же странице, без перехода/
  // скролла/кнопки «Далее» между ними. Клик по городу — только подсветка,
  // ни на что больше не влияет (не фильтрует каталог — он один и тот же
  // для обоих городов, не блокирует/разблокирует ничего).
  const [activeCity, setActiveCity] = useState<Branch | null>(null);

  // Сумма для перехода в оформление сертификата на сумму: своя валидная
  // сумма приоритетнее пресета, иначе — выбранный пресет.
  const parsedCustom = Number(customAmount);
  const effectiveAmount =
    customAmount && Number.isFinite(parsedCustom) && parsedCustom >= MIN_AMOUNT
      ? parsedCustom
      : selectedAmount;

  const amountOpen = selection?.kind === "amount";

  const toggleAmount = () => setSelection((s) => (s?.kind === "amount" ? null : { kind: "amount" }));

  // Единственная кнопка «Далее» ведёт по одному из двух сценариев в
  // зависимости от того, что выбрал пользователь — город (→ выбор услуг,
  // докрутка к каталогу) или сумму (→ оформление сертификата на эту сумму).
  // Если выбрано и то, и другое — по явному решению владельца (2026-08-22)
  // побеждает то, что было выбрано последним, поэтому здесь же трекается
  // lastChoice, а не просто "город всегда/сумма всегда".
  const navigate = useNavigate();
  const [lastChoice, setLastChoice] = useState<"city" | "amount" | null>(null);
  const canGoCity = activeCity !== null;
  const canGoAmount = amountPicked;
  const canProceed = canGoCity || canGoAmount;
  const targetIsAmount = canGoAmount && (!canGoCity || lastChoice === "amount");
  const handleNext = () => {
    if (!canProceed) return;
    if (targetIsAmount) {
      navigate({ to: "/certificate", search: { kind: "amount", amount: effectiveAmount } });
      return;
    }
    // Цель скролла — "categories-block" внутри ServiceCatalogBrowser
    // (карусель категорий + заголовок текущей категории), а не верх раздела
    // «Каталог» — так после клика сразу видно категории и карточки услуг,
    // без галереи и общего заголовка над ними.
    document.getElementById("categories-block")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ── Ряд переключателей (город/город/сумма) + каталог услуг сразу под
          ним, одним непрерывным блоком — точная структура layan.kz
          (buy-certificate: ряд кнопок → каталог с ценами сразу под ним,
          без перехода). Клик по городу — чистая подсветка. Клик по услуге
          в каталоге сам решает, что делать (см. ServiceCatalogBrowser) —
          этот компонент их поведение не трогает. «Указать сумму» — свой
          отдельный путь со своей кнопкой «Далее» в конце блока. ────────── */}
      <section id="buy" className="relative overflow-hidden">
        <Divider motif="waveCrown" className="pt-12 sm:pt-16 lg:pt-20" />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-24">
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

          {/* Карточки-переключатели уменьшены (правка владельца 2026-08-22,
              «тоньше и компактнее, как на layan.kz», но своя палитра):
              py-6→py-4 (было слишком много воздуха сверху/снизу), заголовок
              text-xl/2xl→lg/xl (укладывается в «минус 1-2px», не мельче
              text-sm=14px пола для адреса/подписи), gap-3→gap-2 между
              карточками. Рамка (.surface, 1px) не трогал — она и так та же,
              что у остальных карточек сайта, не толще. Кликабельная область
              осталась ощутимо больше 44px по высоте. */}
          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {BRANCHES.map((b) => {
              const selected = activeCity === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setActiveCity(b.id);
                    setLastChoice("city");
                  }}
                  aria-pressed={selected}
                  className={`surface px-6 py-4 text-left transition-colors ${
                    selected ? "border-gold!" : "hover:border-gold/60"
                  }`}
                >
                  {/* Цвет текста фиксированный в обоих состояниях (правка
                      2026-08-22 — откат полной заливки: та давала нечитаемый
                      бледный текст на карточке «Петропавловск»). Выбор
                      сигнализирует только рамка и золотое свечение текста
                      (.text-glow-gold, см. styles.css).
                      border-gold! (важность) — реальный найденный баг:
                      .surface задаёт border одной сокращённой записью
                      (border: 1px solid var(--color-border)), той же
                      специфичности, что и border-gold, и побеждала в
                      каскаде — рамка на выбранной карточке молча оставалась
                      дефолтной, а не золотой. */}
                  <span
                    className={`font-display block text-lg sm:text-xl text-cream ${selected ? "text-glow-gold" : ""}`}
                  >
                    {t("home.buyCityPrefix")} {t(b.labelKey)}
                  </span>
                  <span
                    className={`mt-1 block text-sm text-cream/65 ${selected ? "text-glow-gold" : ""}`}
                  >
                    {b.address}
                  </span>
                </button>
              );
            })}

            <div
              className={`surface overflow-hidden text-left transition-colors ${
                amountOpen ? "border-gold!" : "hover:border-gold/60"
              }`}
            >
              <button
                type="button"
                onClick={toggleAmount}
                aria-expanded={amountOpen}
                className="w-full px-6 py-4 text-left"
              >
                <span
                  className={`font-display block text-lg sm:text-xl text-cream ${amountOpen ? "text-glow-gold" : ""}`}
                >
                  {t("home.buyAmountToggle")}
                </span>
                <span
                  className={`text-cream/65 mt-1 block text-sm ${amountOpen ? "text-glow-gold" : ""}`}
                >
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
                            setLastChoice("amount");
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
                            if (valid) setLastChoice("amount");
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

          {/* ── Единственная кнопка «Далее» под рядом город/город/сумма —
              ведёт к каталогу услуг (город) либо в оформление на сумму
              (сумма), см. handleNext выше. Активна, когда выбран город ИЛИ
              явно указана сумма. ─────────────────────────────────────── */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className={`btn-gold inline-flex ${canProceed ? "" : "cursor-not-allowed opacity-40"}`}
            >
              {t("cert.nextButton")}
            </button>
          </div>

          {/* ── Каталог услуг — по структуре layan.kz (проверено вживую
              2026-08-22): открыт сразу под рядом город/город/сумма, без
              перехода, скролла или кнопки между ними — тот же компонент,
              что и на шаге 1 мастера оформления, единый источник правды по
              ценам и описаниям. ──────────────────────────────────────── */}
          <div id="services-catalog" className="mt-12 scroll-mt-24">
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
        </div>
      </section>
    </>
  );
}
