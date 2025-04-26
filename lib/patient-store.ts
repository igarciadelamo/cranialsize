"use client"

import { differenceInMonths } from "date-fns"
import { create } from "zustand"
import { calculateExpectedSize } from "./skull-calculations"
import type { Measurement, Patient } from "./types"

interface PatientStore {
  patients: Patient[]
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, patient: Partial<Patient>) => void
  addMeasurement: (patientId: string, measurement: Measurement) => void
  initializeStore: () => void
}

// Helper function to determine approximate percentile
function getPercentile(size: number, ageInMonths: number): string {
  const expected = calculateExpectedSize(ageInMonths)
  const difference = size - expected

  if (difference > 2) return "Above 95th"
  if (difference > 1) return "75th-95th"
  if (difference > -1) return "25th-75th"
  if (difference > -2) return "5th-25th"
  return "Below 5th"
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],

  addPatient: (patient) =>
    set((state) => ({
      patients: [...state.patients, patient],
    })),

  updatePatient: (id, updatedPatient) =>
    set((state) => ({
      patients: state.patients.map((patient) => (patient.id === id ? { ...patient, ...updatedPatient } : patient)),
    })),

  addMeasurement: (patientId, measurement) =>
    set((state) => ({
      patients: state.patients.map((patient) => {
        if (patient.id === patientId) {
          // Calculate and add percentile to the measurement
          const ageInMonths = differenceInMonths(measurement.date, patient.birthDate)
          const percentile = getPercentile(measurement.size, ageInMonths)
          const measurementWithPercentile = { ...measurement, percentile }

          return {
            ...patient,
            measurements: [...patient.measurements, measurementWithPercentile].sort(
              (a, b) => b.date.getTime() - a.date.getTime(),
            ),
          }
        }
        return patient
      }),
    })),

  initializeStore: () => {
    // Add sample data for demonstration
    const sampleBirthDate1 = new Date()
    sampleBirthDate1.setMonth(sampleBirthDate1.getMonth() - 6)

    const sampleBirthDate2 = new Date()
    sampleBirthDate2.setMonth(sampleBirthDate2.getMonth() - 12)

    const samplePatients: Patient[] = [
      {
        id: "1",
        firstName: "Emma",
        lastName: "Johnson",
        birthDate: sampleBirthDate1,
        birthHeadCircumference: 35.2,
        measurements: [
          {
            date: new Date(sampleBirthDate1.getTime() + 30 * 24 * 60 * 60 * 1000),
            size: 38.2,
            percentile: "25th-75th",
          },
          {
            date: new Date(sampleBirthDate1.getTime() + 90 * 24 * 60 * 60 * 1000),
            size: 41.5,
            percentile: "75th-95th",
          },
        ],
      },
      {
        id: "2",
        firstName: "Noah",
        lastName: "Williams",
        birthDate: sampleBirthDate2,
        measurements: [
          {
            date: new Date(sampleBirthDate2.getTime() + 60 * 24 * 60 * 60 * 1000),
            size: 39.8,
            percentile: "25th-75th",
          },
          {
            date: new Date(sampleBirthDate2.getTime() + 180 * 24 * 60 * 60 * 1000),
            size: 44.2,
            percentile: "25th-75th",
          },
          {
            date: new Date(sampleBirthDate2.getTime() + 300 * 24 * 60 * 60 * 1000),
            size: 46.5,
            percentile: "25th-75th",
          },
        ],
      },
    ]

    set({ patients: samplePatients })
  },
}))
