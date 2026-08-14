/**
 * Чекбокс на карточке услуги. Настоящий `<input>` спрятан визуально, но
 * остаётся в потоке фокуса — так карточка работает и с клавиатуры, и со
 * скринридером, а рисуем мы свой квадрат в фирменных цветах.
 */
export function ServiceCheckbox({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: () => void;
  /** Название услуги — озвучивается скринридером вместо галочки. */
  label: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`peer-focus-visible:ring-gold flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-transparent ${
          checked
            ? "border-gold bg-gold text-primary-foreground"
            : // Непрозрачная карточная заливка: на фото услуги полупрозрачный
              // квадрат читался как пустое место, а не как контрол.
              "border-gold/60 bg-card text-transparent"
        }`}
      >
        ✓
      </span>
    </span>
  );
}
