import { es, enUS } from "date-fns/locale"
import type { Locale } from "date-fns"

export function getDateLocale(language: string): Locale {
  if (language.startsWith("es")) return es
  return enUS
}
