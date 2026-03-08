export interface Measurement {
  date: Date
  size: number
  percentile?: string
}

export interface Patient {
  id: string
  userId?: string // Associate patient with a user
  firstName: string
  lastName: string
  birthDate: Date
  birthHeadCircumference?: number // Optional head circumference at birth
  measurements: Measurement[]
}
