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
        sex: "M",
        userId: null,
        createdAt: "2024-01-01T00:00:00.000Z",
        measurementCount: 0,
      },
    ])

    await act(async () => {
      await usePatientStore.getState().loadPatients("token")
    })

    const patients = usePatientStore.getState().patients
    expect(patients.some((p) => p.id === "real-1")).toBe(true)
    expect(patients.find((p) => p.id === "real-1")?.firstName).toBe("John")
  })

  it("shows toast and sets empty list on error", async () => {
    const { patientService } = await import("./api-service")
    const { toast } = await import("sonner")
    vi.mocked(patientService.getAll).mockRejectedValueOnce(new Error("Network error"))

    await act(async () => {
      await usePatientStore.getState().loadPatients("token")
    })

    expect(toast.error).toHaveBeenCalledOnce()
    expect(usePatientStore.getState().patients).toHaveLength(0)
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
  it("reloads measurements even when patient already has measurements", async () => {
    const { measurementService } = await import("./api-service")
    const birthDate = new Date("2024-01-01")
    usePatientStore.setState({
      patients: [
        {
          id: "real-1",
          firstName: "John",
          lastName: "Doe",
          birthDate,
          sex: "M" as const,
          measurements: [{ date: new Date(), size: 42 }],
        },
      ],
    })

    vi.mocked(measurementService.getAll).mockResolvedValueOnce([
      { id: "m1", patientId: "real-1", measuredAt: "2024-07-01T00:00:00.000Z", headCircumference: 43.0, createdAt: "" },
    ])

    await act(async () => {
      await usePatientStore.getState().loadMeasurements("token", "real-1")
    })

    expect(measurementService.getAll).toHaveBeenCalledWith("token", "real-1")
    const patient = usePatientStore.getState().patients.find((p) => p.id === "real-1")
    expect(patient?.measurements).toHaveLength(1)
    expect(patient?.measurements[0].size).toBe(43.0)
  })

  it("loads and maps measurements for real patients", async () => {
    const { measurementService } = await import("./api-service")
    const birthDate = new Date("2024-01-01")
    usePatientStore.setState({
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate, sex: "M" as const, measurements: [] }],
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
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate: new Date(), sex: "M" as const, measurements: [] }],
    })
    vi.mocked(measurementService.getAll).mockRejectedValueOnce(new Error("Error"))

    await act(async () => {
      await usePatientStore.getState().loadMeasurements("token", "real-1")
    })

    expect(toast.error).toHaveBeenCalledOnce()
  })
})

describe("updatePatient", () => {
  it("updates fields of an existing patient", () => {
    usePatientStore.setState({
      patients: [{ id: "p1", firstName: "Old", lastName: "Name", birthDate: new Date(), sex: "M" as const, measurements: [] }],
    })

    act(() => {
      usePatientStore.getState().updatePatient("p1", { firstName: "New" })
    })

    const patient = usePatientStore.getState().patients.find((p) => p.id === "p1")
    expect(patient?.firstName).toBe("New")
    expect(patient?.lastName).toBe("Name")
  })
})

describe("addPatient", () => {
  it("adds a patient to the store", () => {
    const newPatient = { id: "new-1", firstName: "Test", lastName: "User", birthDate: new Date(), sex: "M" as const, measurements: [] }

    act(() => {
      usePatientStore.getState().addPatient(newPatient)
    })

    expect(usePatientStore.getState().patients.some((p) => p.id === "new-1")).toBe(true)
  })
})

describe("addMeasurement", () => {
  it("does nothing when patient is not found", async () => {
    const { measurementService } = await import("./api-service")

    await act(async () => {
      await usePatientStore.getState().addMeasurement("token", "nonexistent", { date: new Date(), size: 42 })
    })

    expect(measurementService.create).not.toHaveBeenCalled()
  })

  it("sorts measurements by date descending after adding", async () => {
    const { measurementService } = await import("./api-service")
    vi.mocked(measurementService.create).mockResolvedValueOnce({
      id: "m-sort",
      patientId: "real-1",
      measuredAt: "2024-03-01T00:00:00.000Z",
      headCircumference: 41,
      createdAt: "",
    })

    const birthDate = new Date("2024-01-01")
    const newerDate = new Date("2024-07-01")
    const olderDate = new Date("2024-03-01")
    usePatientStore.setState({
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate, sex: "M" as const, measurements: [{ date: newerDate, size: 43 }] }],
    })

    await act(async () => {
      await usePatientStore.getState().addMeasurement("token", "real-1", { date: olderDate, size: 41 })
    })

    const patient = usePatientStore.getState().patients.find((p) => p.id === "real-1")
    expect(patient?.measurements[0].date.getTime()).toBe(newerDate.getTime())
    expect(patient?.measurements[1].date.getTime()).toBe(olderDate.getTime())
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
      patients: [{ id: "real-1", firstName: "John", lastName: "Doe", birthDate, sex: "M" as const, measurements: [] }],
    })

    await act(async () => {
      await usePatientStore.getState().addMeasurement("token", "real-1", { date: new Date("2024-07-01"), size: 42 })
    })

    expect(measurementService.create).toHaveBeenCalledOnce()
    const patient = usePatientStore.getState().patients.find((p) => p.id === "real-1")
    expect(patient?.measurements[0].id).toBe("m-new")
  })
})
