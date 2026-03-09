import { differenceInMonths } from "date-fns"
import { create } from "zustand"
import { measurementService, patientService } from "./api-service"
import { calculateExpectedSize } from "./skull-calculations"
import type { Measurement, Patient } from "./types"

interface PatientStore {
  patients: Patient[]
  isLoading: boolean
  loadPatients: (token: string) => Promise<void>
  loadMeasurements: (token: string, patientId: string) => Promise<void>
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, patient: Partial<Patient>) => void
  addMeasurement: (token: string, patientId: string, measurement: Measurement) => Promise<void>
}

function getPercentile(size: number, ageInMonths: number): string {
  const expected = calculateExpectedSize(ageInMonths)
  const difference = size - expected

  if (difference > 2) return "Above 95th"
  if (difference > 1) return "75th-95th"
  if (difference > -1) return "25th-75th"
  if (difference > -2) return "5th-25th"
  return "Below 5th"
}

const MOCK_PATIENTS: Patient[] = (() => {
  const d1 = new Date()
  d1.setMonth(d1.getMonth() - 6)
  const d2 = new Date()
  d2.setMonth(d2.getMonth() - 12)
  return [
    {
      id: "1",
      firstName: "Emma",
      lastName: "Johnson",
      birthDate: d1,
      birthHeadCircumference: 35.2,
      measurements: [
        { date: new Date(d1.getTime() + 30 * 24 * 60 * 60 * 1000), size: 38.2, percentile: "25th-75th" },
        { date: new Date(d1.getTime() + 90 * 24 * 60 * 60 * 1000), size: 41.5, percentile: "75th-95th" },
      ],
    },
    {
      id: "2",
      firstName: "Noah",
      lastName: "Williams",
      birthDate: d2,
      measurements: [
        { date: new Date(d2.getTime() + 60 * 24 * 60 * 60 * 1000), size: 39.8, percentile: "25th-75th" },
        { date: new Date(d2.getTime() + 180 * 24 * 60 * 60 * 1000), size: 44.2, percentile: "25th-75th" },
        { date: new Date(d2.getTime() + 300 * 24 * 60 * 60 * 1000), size: 46.5, percentile: "25th-75th" },
      ],
    },
  ]
})()

const MOCK_IDS = new Set(["1", "2"])

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  isLoading: false,

  loadPatients: async (token: string) => {
    set({ isLoading: true })
    try {
      const data = await patientService.getAll(token)
      const apiPatients: Patient[] = data.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        birthDate: new Date(p.birthDate),
        birthHeadCircumference: p.birthHeadCircumference ?? undefined,
        measurements: [],
      }))
      set({ patients: [...MOCK_PATIENTS, ...apiPatients] })
    } catch {
      set({ patients: MOCK_PATIENTS })
    } finally {
      set({ isLoading: false })
    }
  },

  loadMeasurements: async (token: string, patientId: string) => {
    if (MOCK_IDS.has(patientId)) return

    const patient = get().patients.find((p) => p.id === patientId)
    if (!patient || patient.measurements.length > 0) return

    try {
      const data = await measurementService.getAll(token, patientId)
      const measurements: Measurement[] = data.map((m) => {
        const date = new Date(m.measuredAt)
        const ageInMonths = differenceInMonths(date, patient.birthDate)
        return {
          id: m.id,
          date,
          size: m.headCircumference,
          percentile: getPercentile(m.headCircumference, ageInMonths),
        }
      })
      set((state) => ({
        patients: state.patients.map((p) =>
          p.id === patientId ? { ...p, measurements } : p
        ),
      }))
    } catch {
      // Keep empty measurements on error — non-blocking
    }
  },

  addPatient: (patient) =>
    set((state) => ({
      patients: [...state.patients, patient],
    })),

  updatePatient: (id, updatedPatient) =>
    set((state) => ({
      patients: state.patients.map((patient) => (patient.id === id ? { ...patient, ...updatedPatient } : patient)),
    })),

  addMeasurement: async (token: string, patientId: string, measurement: Measurement) => {
    const patient = get().patients.find((p) => p.id === patientId)
    if (!patient) return

    const ageInMonths = differenceInMonths(measurement.date, patient.birthDate)
    const percentile = getPercentile(measurement.size, ageInMonths)

    if (!MOCK_IDS.has(patientId)) {
      const created = await measurementService.create(token, patientId, {
        measuredAt: measurement.date.toISOString(),
        headCircumference: measurement.size,
      })
      measurement = { ...measurement, id: created.id, percentile }
    } else {
      measurement = { ...measurement, percentile }
    }

    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p
        return {
          ...p,
          measurements: [...p.measurements, measurement].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          ),
        }
      }),
    }))
  },
}))
