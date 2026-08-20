import { createElement, type ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/** Оборачивает секцию/карточку в анимацию появления при скролле (см.
 *  useScrollReveal, styles.css .reveal). `as` — какой тег рендерить, по
 *  умолчанию div; не влияет на разметку сверх этого. */
export function Reveal({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const { ref, visible } = useScrollReveal<HTMLElement>();
  return createElement(
    as,
    { ref, className: `reveal ${visible ? "reveal-visible" : ""} ${className}` },
    children,
  );
}
