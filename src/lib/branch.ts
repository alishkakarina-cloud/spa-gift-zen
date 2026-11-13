const CANONICAL: Record<string, string> = {
  petropavlovsk: "Петропавловск",
  kokshetau: "Кокшетау",
};

const ALIASES: Record<string, keyof typeof CANONICAL> = {
  petropavlovsk: "petropavlovsk",
  петропавловск: "petropavlovsk",
  петропавл: "petropavlovsk",
  kokshetau: "kokshetau",
  кокшетау: "kokshetau",
  көкшетау: "kokshetau",
};

/** Город в одном виде для базы и админки: сайт шлёт подпись на языке
 *  посетителя (RU/KZ/EN), админка — id. Возвращает русское название или null,
 *  если это не один из двух филиалов. */
export function canonicalBranchLabel(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const id = ALIASES[input.trim().toLowerCase()];
  return id ? CANONICAL[id]! : null;
}
