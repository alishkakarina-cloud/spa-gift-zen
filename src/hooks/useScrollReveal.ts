import { useEffect, useRef, useState } from "react";

/**
 * Появление секции при попадании в область просмотра — по механике layan.kz
 * (fade + сдвиг снизу вверх при скролле). Срабатывает один раз: как только
 * элемент показался, слушатель снимается, повторный скролл ничего не
 * анимирует заново.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Уже видимый на момент монтирования (например верх страницы при
    // загрузке) — не ждём скролла, показываем сразу.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
