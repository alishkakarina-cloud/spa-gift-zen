import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Шторка снизу вверх (bottom sheet) — по образцу layan.kz. Закрывается по
 * клику на затемнённый фон, по крестику или по Escape. Пока открыта,
 * блокирует скролл страницы под собой.
 */
export function BottomSheet({
  open,
  onClose,
  closeLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{ maxHeight: "85svh" }}
        className={`surface relative flex w-full max-w-xl flex-col rounded-t-2xl border-b-0 transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Крестик — вне скролл-контейнера ниже, поэтому остаётся на месте,
            пока длинный список услуг скроллится под ним. */}
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          title={closeLabel}
          className="text-cream/60 hover:text-gold absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="overflow-y-auto p-6 pb-8 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
