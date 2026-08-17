import { createContext, useContext, useState, type ReactNode } from "react";
import { toggleServiceId } from "@/data/selection";

/**
 * Общий на весь сайт выбор услуг для сертификата — раньше жил как локальный
 * useState внутри OffersSection и терялся при переходе между "/" и /offers
 * (это один и тот же компонент, но раньше каждый экземпляр вёл свой счёт).
 * Вынесен в контекст, чтобы FloatingCart мог показывать то же самое
 * состояние, что человек набрал в каталоге — по просьбе клиента ("чтобы
 * понятно было сколько услуг мы набрали").
 *
 * Не трогает /certificate — у мастера оформления своя, отдельная логика
 * выбора на шаге 1 (осознанно не подключена сюда, чтобы не менять его
 * поведение), сюда попадают только каталоги на страницах ДО перехода в
 * мастер (объединённая секция на "/" и /offers).
 */
type CartContextValue = {
  selectedServiceIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const value: CartContextValue = {
    selectedServiceIds,
    toggle: (id) => setSelectedServiceIds((ids) => toggleServiceId(ids, id)),
    clear: () => setSelectedServiceIds([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
