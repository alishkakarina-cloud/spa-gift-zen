import { services, type Service } from "@/data/catalog";

/**
 * Сертификат может содержать несколько программ сразу — состав хранится
 * списком id. В адресной строке он едет одной строкой через запятую
 * (`?services=reload,thai-bath-1`), чтобы ссылки оставались читаемыми и
 * их можно было переслать в мессенджере.
 */
export const parseServiceIds = (raw: string | undefined): string[] =>
  (raw ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => services.some((s) => s.id === id));

export const serializeServiceIds = (ids: ReadonlyArray<string>) => ids.join(",");

/** Отметить/снять услугу, сохраняя порядок добавления. */
export const toggleServiceId = (ids: ReadonlyArray<string>, id: string): string[] =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];

/** Услуги выбора в том же порядке, в котором их отмечали. */
export const selectedServices = (ids: ReadonlyArray<string>): Service[] =>
  ids
    .map((id) => services.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));

export const selectionTotal = (ids: ReadonlyArray<string>) =>
  selectedServices(ids).reduce((sum, s) => sum + s.price, 0);
