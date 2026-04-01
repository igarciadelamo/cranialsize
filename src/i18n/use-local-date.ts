import { useTranslation } from "react-i18next"
import { format, differenceInMonths } from "date-fns"
import { getDateLocale } from "./date-locale"

export function useLocalDate() {
  const { i18n, t } = useTranslation("common")
  const locale = getDateLocale(i18n.language)

  return {
    formatDate: (date: Date) => format(date, "PP", { locale }),
    formatLong: (date: Date) => format(date, "PPP", { locale }),
    calculateAge: (birthDate: Date, referenceDate: Date = new Date()): string => {
      const months = differenceInMonths(referenceDate, birthDate)
      if (months < 1) return t("age.lessThanMonth")
      if (months < 24) return t("age.months", { count: months })
      const years = Math.floor(months / 12)
      const rem = months % 12
      if (rem === 0) return t("age.years", { count: years })
      return t("age.yearsMonths", {
        years: t("age.years", { count: years }),
        months: t("age.months", { count: rem }),
      })
    },
  }
}
