import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { differenceInMonths, format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy")
}

export function formatDateTime(date: Date): string {
  return format(date, "h:mm a")
}

export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): string {
  const months = differenceInMonths(referenceDate, birthDate)

  if (months < 1) {
    return "< 1 month"
  }

  if (months < 24) {
    return `${months} month${months === 1 ? "" : "s"}`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? "" : "s"}`
  }

  return `${years} year${years === 1 ? "" : "s"}, ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`
}
