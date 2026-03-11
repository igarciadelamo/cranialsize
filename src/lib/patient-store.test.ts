import { describe, it, expect, vi, beforeEach } from "vitest"
import { act } from "react"
import { usePatientStore } from "./patient-store"

vi.mock("./api-service", () => ({
  patientService: { getAll: vi.fn() },
  measurementService: { getAll: vi.fn(), create: vi.fn() },
}))

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

beforeEach(async () => {
  vi.clearAllMocks()
  usePatientStore.setState({ patients: [], isLoading: false, isMeasurementsLoading: false })
})

describe("loadPatients", () => {
  it("loads and maps API patients into the store", async () => {
    const { patientService } = await import("./api-service")
    vi.mocked(patientService.getAll).mockResolvedValueOnce([
      {
        id: "real-1",
        firstName: "John",
        lastName: "Doe",
        birthDate: "2024-01-01T00:00:00.000Z",
        birthHeadCircumference: null,
        userId: null,
        createdAt: "2024-01-01T00:00:00.000Z",
      },
    ])

    await act(async () => {
      await usePatientStore.getState().loadPatients("token")
    })

    const patients = usePatientStore.getState().patients
    expect(patients.some((p) => p.id === "real-1")).toBe(true)
    expect(patients.find((p) => p.id === "real-1")?.firstName).toBe("John")
  })

  it("shows toast and falls back to mock patients on error", async () => {
    const { patientService } = await import("./api-service")
    const { toast } = await import("sonner")
    vi.mocked(patientService.getAll).mockRejectedValueOnce(new Error("Network error"))

    await act(async () => {
      await usePatientStore.getState().loadPatients("token")
    })

    expect(toast.error).toHaveBeenCalledOnce()
    const patients = usePatientStore.getState().patients
    expect(patients.some((p) => p.firstName === "Emma")).toBe(true)
  })

  it("sets isLoading to false after loading", async () => {
    const { patientService } = await import("./api-service")
    vi.mocked(patientService.getAll).mockResolvedValueOnce([])

    await act(async () => {
      await usePatientStore.getState().loadPatients("token")
    })

    expect(usePatientStore.getState().isLoading).toBe(false)
  })
})

describe("loadMeasurements", () => {
  it("skips mock patients without calling the API", async () => {
    const { measurementService } = await import("./api-service")
    usePatientStore.setState({
      patients: [{ id: "1", firstName: "Emma", lastName: "Johnson", birthDate: new Date(), measurements: [] }],
    })

    await act(async () => {
      await usePatientStore.getState().loadMeasurements("token", "1")
    })

    expect(measurementService.getAll).not.toHaveBeenCalled()
  })

  it("skips patients that already have measurements", async () => {
    const { measurementService } = await import("./api-service")
    usePatientStore.setState({
      patients: [
        {
          id: "real-1",
          firstName: "John",
          lastName: "Doe",
          birthDate: new Date(),
          measurements: [{ date: new Date(), size: 42 }],
        },
      ],
    })

    await act(async () => {
      await usePatientStore.getState().loadMeasurements("token", "real-1")
    })

    expect(measurementService.getAll).not.toHaveBeenCalled()
  })

  it("loads and maps measurements for real patients", async () => {
    const { measurementService } = await import("./api-service")
    const birthDate = new Date("2024-01-01")
    usePatientStore.setState({
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate, measurements: [] }],
    })

    vi.mocked(measurementService.getAll).mockResolvedValueOnce([
      { id: "m1", patientId: "real-1", measuredAt: "2024-07-01T00:00:00.000Z", headCircumference: 42.5, createdAt: "" },
    ])

    await act(async () => {
      await usePatientStore.getState().loadMeasurements("token", "real-1")
    })

    const patient = usePatientStore.getState().patients.find((p) => p.id === "real-1")
    expect(patient?.measurements).toHaveLength(1)
    expect(patient?.measurements[0].size).toBe(42.5)
  })

  it("shows toast on error", async () => {
    const { measurementService } = await import("./api-service")
    const { toast } = await import("sonner")
    usePatientStore.setState({
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate: new Date(), measurements: [] }],
    })
    vi.mocked(measurementService.getAll).mockRejectedValueOnce(new Error("Error"))

    await act(async () => {
      await usePatientStore.getState().loadMeasurements("token", "real-1")
    })

    expect(toast.error).toHaveBeenCalledOnce()
  })
})

describe("addPatient", () => {
  it("adds a patient to the store", () => {
    const newPatient = { id: "new-1", firstName: "Test", lastName: "User", birthDate: new Date(), measurements: [] }

    act(() => {
      usePatientStore.getState().addPatient(newPatient)
    })

    expect(usePatientStore.getState().patients.some((p) => p.id === "new-1")).toBe(true)
  })
})

describe("addMeasurement", () => {
  it("adds measurement to mock patient without calling the API", async () => {
    const { measurementService } = await import("./api-service")
    const birthDate = new Date("2024-01-01")
    usePatientStore.setState({
      patients: [{ id: "1", firstName: "Emma", lastName: "Johnson", birthDate, measurements: [] }],
    })

    await act(async () => {
      await usePatientStore.getState().addMeasurement("token", "1", { date: new Date("2024-07-01"), size: 42 })
    })

    expect(measurementService.create).not.toHaveBeenCalled()
    const patient = usePatientStore.getState().patients.find((p) => p.id === "1")
    expect(patient?.measurements).toHaveLength(1)
  })

  it("calls API for real patient and stores the returned id", async () => {
    const { measurementService } = await import("./api-service")
    vi.mocked(measurementService.create).mockResolvedValueOnce({
      id: "m-new",
      patientId: "real-1",
      measuredAt: "2024-07-01T00:00:00.000Z",
      headCircumference: 42,
      createdAt: "",
    })

    const birthDate = new Date("2024-01-01")
    usePatientStore.setState({
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate, measurements: [] }],
    })

    await act(async () => {
      await usePatientStore.getState().addMeasurement("token", "real-1", { date: new Date("2024-07-01"), size: 42 })
    })

    expect(measurementService.create).toHaveBeenCalledOnce()
    const patient = usePatientStore.getState().patients.find((p) => p.id === "real-1")
    expect(patient?.measurements[0].id).toBe("m-new")
  })
})
