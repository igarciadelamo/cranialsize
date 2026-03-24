import { differenceInMonths, format } from "date-fns"
import { toast } from "sonner"
import { create } from "zustand"
import { measurementService, patientService } from "./api-service"
import { getPercentile } from "./skull-calculations"
import type { Measurement, Patient, UpdatePatientData } from "./types"

interface PatientStore {
  patients: Patient[]
  isLoading: boolean
  isMeasurementsLoading: boolean
  loadPatients: (token: string) => Promise<void>
  loadMeasurements: (token: string, patientId: string) => Promise<void>
  addPatient: (patient: Patient) => void
  updatePatient: (id: string, patient: Partial<Patient>) => void
  editPatient: (token: string, patientId: string, data: UpdatePatientData) => Promise<void>
  addMeasurement: (token: string, patientId: string, measurement: Measurement) => Promise<void>
  deleteMeasurement: (token: string, patientId: string, measurementId: string) => Promise<void>
  deletePatient: (token: string, patientId: string) => Promise<void>
}



export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  isLoading: false,
  isMeasurementsLoading: false,

  loadPatients: async (token: string) => {
    set({ isLoading: true })
    try {
      const data = await patientService.getAll(token)
      const apiPatients: Patient[] = data.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        birthDate: new Date(p.birthDate),
        sex: p.sex as "M" | "F",
        birthHeadCircumference: p.birthHeadCircumference ?? undefined,
        measurements: [],
        measurementCount: p.measurementCount,
      }))
      set({ patients: apiPatients })
    } catch {
      set({ patients: [] })
      toast.error("Oops! Something went wrong loading your patients. This might be temporary, please try again later.")
    } finally {
      set({ isLoading: false })
    }
  },

  loadMeasurements: async (token: string, patientId: string) => {
    const patient = get().patients.find((p) => p.id === patientId)
    if (!patient) return

    set({ isMeasurementsLoading: true })
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
      toast.error("Oops! Something went wrong loading the measurements. This might be temporary, please try again later.")
    } finally {
      set({ isMeasurementsLoading: false })
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

  editPatient: async (token: string, patientId: string, data: UpdatePatientData) => {
    const payload: Record<string, unknown> = {}
    if (data.firstName !== undefined) payload.firstName = data.firstName
    if (data.lastName !== undefined) payload.lastName = data.lastName
    if (data.birthDate !== undefined) payload.birthDate = format(data.birthDate, "yyyy-MM-dd")
    if (data.sex !== undefined) payload.sex = data.sex
    if (data.birthHeadCircumference !== undefined) payload.birthHeadCircumference = data.birthHeadCircumference
    const updated = await patientService.patch(token, patientId, payload)
    set((state) => ({
      patients: state.patients.map((p) =>
        p.id !== patientId ? p : {
          ...p,
          firstName: updated.firstName,
          lastName: updated.lastName,
          birthDate: new Date(updated.birthDate),
          sex: updated.sex as "M" | "F",
          birthHeadCircumference: updated.birthHeadCircumference ?? undefined,
        }
      ),
    }))
  },

  deletePatient: async (token: string, patientId: string) => {
    await patientService.delete(token, patientId)
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== patientId),
    }))
  },

  deleteMeasurement: async (token: string, patientId: string, measurementId: string) => {
    await measurementService.delete(token, patientId, measurementId)
    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p
        return {
          ...p,
          measurements: p.measurements.filter((m) => m.id !== measurementId),
          measurementCount: (p.measurementCount ?? p.measurements.length) - 1,
        }
      }),
    }))
  },

  addMeasurement: async (token: string, patientId: string, measurement: Measurement) => {
    const patient = get().patients.find((p) => p.id === patientId)
    if (!patient) return

    const ageInMonths = differenceInMonths(measurement.date, patient.birthDate)
    const percentile = getPercentile(measurement.size, ageInMonths)

    const created = await measurementService.create(token, patientId, {
      measuredAt: format(measurement.date, "yyyy-MM-dd"),
      headCircumference: measurement.size,
    })
    measurement = { ...measurement, id: created.id, percentile }

    set((state) => ({
      patients: state.patients.map((p) => {
        if (p.id !== patientId) return p
        return {
          ...p,
          measurements: [...p.measurements, measurement].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          ),
          measurementCount: (p.measurementCount ?? p.measurements.length) + 1,
        }
      }),
    }))
  },
}))
