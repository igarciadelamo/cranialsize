import { describe, it, expect } from "vitest"
import { calculateExpectedSize, calculateEstimatedBirthSize, getPercentile } from "./skull-calculations"

describe("calculateExpectedSize", () => {
  it("returns 35 for age 0 or negative", () => {
    expect(calculateExpectedSize(0)).toBe(35)
    expect(calculateExpectedSize(-1)).toBe(35)
  })

  it("grows correctly in the first month", () => {
    expect(calculateExpectedSize(1)).toBe(37)
  })

  it("grows correctly between 1-6 months", () => {
    expect(calculateExpectedSize(3)).toBeCloseTo(37 + 3 * 0.8)
    expect(calculateExpectedSize(6)).toBeCloseTo(37 + 6 * 0.8)
  })

  it("grows correctly between 6-12 months", () => {
    expect(calculateExpectedSize(9)).toBeCloseTo(41.8 + (9 - 6) * 0.4)
    expect(calculateExpectedSize(12)).toBeCloseTo(41.8 + (12 - 6) * 0.4)
  })

  it("grows correctly between 12-24 months", () => {
    expect(calculateExpectedSize(18)).toBeCloseTo(44.2 + (18 - 12) * 0.25)
  })

  it("grows correctly between 24-36 months", () => {
    expect(calculateExpectedSize(30)).toBeCloseTo(47.2 + (30 - 24) * 0.15)
  })

  it("grows slowly after 36 months", () => {
    expect(calculateExpectedSize(48)).toBeCloseTo(49 + (48 - 36) * 0.1)
  })

  it("returns increasing values as age increases", () => {
    const ages = [0, 3, 6, 12, 18, 24, 36, 48]
    for (let i = 1; i < ages.length; i++) {
      expect(calculateExpectedSize(ages[i])).toBeGreaterThan(calculateExpectedSize(ages[i - 1]))
    }
  })
})

describe("calculateEstimatedBirthSize", () => {
  it("returns expected birth size when current size matches expected", () => {
    const ageInMonths = 6
    const expectedCurrent = calculateExpectedSize(ageInMonths)
    const result = calculateEstimatedBirthSize(expectedCurrent, ageInMonths)
    expect(result).toBeCloseTo(calculateExpectedSize(0))
  })

  it("returns larger birth size when current is above expected", () => {
    const ageInMonths = 6
    const expectedCurrent = calculateExpectedSize(ageInMonths)
    const aboveAverage = calculateEstimatedBirthSize(expectedCurrent + 2, ageInMonths)
    const average = calculateEstimatedBirthSize(expectedCurrent, ageInMonths)
    expect(aboveAverage).toBeGreaterThan(average)
  })

  it("never returns below 30 cm", () => {
    const result = calculateEstimatedBirthSize(20, 12)
    expect(result).toBeGreaterThanOrEqual(30)
  })
})

describe("getPercentile", () => {
  it("returns 'Above 95th' when more than 2cm above expected", () => {
    const age = 6
    const expected = calculateExpectedSize(age)
    expect(getPercentile(expected + 2.1, age)).toBe("Above 95th")
  })

  it("returns '75th-95th' when 1-2cm above expected", () => {
    const age = 6
    const expected = calculateExpectedSize(age)
    expect(getPercentile(expected + 1.5, age)).toBe("75th-95th")
  })

  it("returns '25th-75th' when within 1cm of expected", () => {
    const age = 6
    const expected = calculateExpectedSize(age)
    expect(getPercentile(expected, age)).toBe("25th-75th")
    expect(getPercentile(expected + 0.5, age)).toBe("25th-75th")
    expect(getPercentile(expected - 0.5, age)).toBe("25th-75th")
  })

  it("returns '5th-25th' when 1-2cm below expected", () => {
    const age = 6
    const expected = calculateExpectedSize(age)
    expect(getPercentile(expected - 1.5, age)).toBe("5th-25th")
  })

  it("returns 'Below 5th' when more than 2cm below expected", () => {
    const age = 6
    const expected = calculateExpectedSize(age)
    expect(getPercentile(expected - 2.1, age)).toBe("Below 5th")
  })
})
