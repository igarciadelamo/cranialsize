import { describe, it, expect } from "vitest"
import { calculateAge, formatDate, formatDateTime, cn } from "./utils"

describe("calculateAge", () => {
  it("returns '< 1 month' for less than 1 month old", () => {
    const birthDate = new Date()
    birthDate.setDate(birthDate.getDate() - 10)
    expect(calculateAge(birthDate)).toBe("< 1 month")
  })

  it("returns singular month correctly", () => {
    const birthDate = new Date()
    birthDate.setMonth(birthDate.getMonth() - 1)
    expect(calculateAge(birthDate)).toBe("1 month")
  })

  it("returns plural months correctly", () => {
    const birthDate = new Date()
    birthDate.setMonth(birthDate.getMonth() - 5)
    expect(calculateAge(birthDate)).toBe("5 months")
  })

  it("returns years and months for age >= 24 months", () => {
    const ref = new Date("2024-06-01")
    const birthDate = new Date("2022-01-01")
    const result = calculateAge(birthDate, ref)
    expect(result).toBe("2 years, 5 months")
  })

  it("returns only years when no remaining months", () => {
    const ref = new Date("2024-01-01")
    const birthDate = new Date("2022-01-01")
    expect(calculateAge(birthDate, ref)).toBe("2 years")
  })

  it("uses today as reference date by default", () => {
    const birthDate = new Date()
    birthDate.setMonth(birthDate.getMonth() - 3)
    expect(calculateAge(birthDate)).toBe("3 months")
  })
})

describe("formatDate", () => {
  it("formats date correctly", () => {
    const date = new Date("2024-03-15")
    expect(formatDate(date)).toBe("Mar 15, 2024")
  })
})

describe("formatDateTime", () => {
  it("formats time as h:mm a", () => {
    const date = new Date(2024, 2, 15, 14, 30) // 2:30 PM local
    expect(formatDateTime(date)).toBe("2:30 PM")
  })

  it("formats midnight as 12:00 AM", () => {
    const date = new Date(2024, 2, 15, 0, 0)
    expect(formatDateTime(date)).toBe("12:00 AM")
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("resolves tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })
})
