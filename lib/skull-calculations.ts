/**
 * Calculate the expected skull circumference based on age in months
 * This uses a simplified growth chart approximation
 */
export function calculateExpectedSize(ageInMonths: number): number {
  // Average newborn head circumference is around 34-35 cm
  // Growth is rapid in first year, then slows

  if (ageInMonths <= 0) return 35

  if (ageInMonths <= 1) return 35 + ageInMonths * 2
  if (ageInMonths <= 6) return 37 + ageInMonths * 0.8
  if (ageInMonths <= 12) return 41.8 + (ageInMonths - 6) * 0.4
  if (ageInMonths <= 24) return 44.2 + (ageInMonths - 12) * 0.25
  if (ageInMonths <= 36) return 47.2 + (ageInMonths - 24) * 0.15

  // After 3 years, growth slows significantly
  return 49 + (ageInMonths - 36) * 0.1
}

/**
 * Estimate the birth size based on current measurements and age
 */
export function calculateEstimatedBirthSize(currentSize: number, ageInMonths: number): number {
  const expectedCurrentSize = calculateExpectedSize(ageInMonths)
  const expectedBirthSize = calculateExpectedSize(0)

  // Calculate the difference between actual and expected current size
  const sizeDifference = currentSize - expectedCurrentSize

  // Apply this difference to the expected birth size
  // This assumes the child has maintained the same growth percentile
  return Math.max(expectedBirthSize + sizeDifference, 30)
}
