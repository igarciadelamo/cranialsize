import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PatientDetail from "./patient-detail"
import type { Patient } from "@/lib/types"

vi.mock("@/components/patient-growth-chart", () => ({
  default: () => <div data-testid="growth-chart" />,
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ accessToken: "mock-token" }),
}))

const mockLoadMeasurements = vi.fn()
const mockDeleteMeasurement = vi.fn()
const mockUsePatientStore = vi.fn()
vi.mock("@/components/edit-measurement-dialog", () => ({
  default: ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) =>
    open ? <div data-testid="edit-measurement-dialog"><button onClick={() => onOpenChange(false)}>CloseEdit</button></div> : null,
}))

vi.mock("@/lib/patient-store", () => ({
  usePatientStore: (...args: any[]) => mockUsePatientStore(...args),
}))

const birthDate = new Date("2024-01-01")
const mockPatient: Patient = {
  id: "real-1",
  firstName: "John",
  lastName: "Doe",
  birthDate,
  sex: "M",
  measurements: [],
}

const mockOnBack = vi.fn()
const mockOnAddMeasurement = vi.fn()

function renderDetail(patient = mockPatient) {
  return render(
    <PatientDetail patient={patient} onBack={mockOnBack} onAddMeasurement={mockOnAddMeasurement} />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUsePatientStore.mockReturnValue({
    patients: [mockPatient],
    loadMeasurements: mockLoadMeasurements,
    isMeasurementsLoading: false,
    deleteMeasurement: mockDeleteMeasurement,
  })
})

describe("PatientDetail", () => {
  it("renders patient name", () => {
    renderDetail()
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it("calls loadMeasurements on mount", () => {
    renderDetail()
    expect(mockLoadMeasurements).toHaveBeenCalledWith("mock-token", "real-1")
  })

  it("shows empty state when no measurements", async () => {
    renderDetail()
    await userEvent.click(screen.getByRole("tab", { name: /measurement history/i }))
    expect(screen.getByText(/no measurements recorded yet/i)).toBeInTheDocument()
  })

  it("shows measurements in the history tab", async () => {
    const patientWithMeasurements = {
      ...mockPatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5, percentile: "25th-75th" }],
    }
    mockUsePatientStore.mockReturnValue({
      patients: [patientWithMeasurements],
      loadMeasurements: mockLoadMeasurements,
      isMeasurementsLoading: false,
    })
    renderDetail(patientWithMeasurements)
    await userEvent.click(screen.getByRole("tab", { name: /measurement history/i }))
    expect(screen.getByText(/42\.5 cm/i)).toBeInTheDocument()
    expect(screen.getByText(/25th-75th/i)).toBeInTheDocument()
  })

  it("shows loading spinner while measurements are loading", () => {
    mockUsePatientStore.mockReturnValue({
      patients: [mockPatient],
      loadMeasurements: mockLoadMeasurements,
      isMeasurementsLoading: true,
    })
    renderDetail()
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("calls onBack when back button is clicked", async () => {
    renderDetail()
    await userEvent.click(screen.getByRole("button", { name: /back to patient list/i }))
    expect(mockOnBack).toHaveBeenCalledOnce()
  })

  it("calls onAddMeasurement when new measurement button is clicked", async () => {
    renderDetail()
    await userEvent.click(screen.getByRole("button", { name: /new measurement/i }))
    expect(mockOnAddMeasurement).toHaveBeenCalledOnce()
  })

  it("shows edit and delete buttons per measurement row", async () => {
    const patientWithMeasurements = {
      ...mockPatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5, percentile: "25th-75th" }],
    }
    mockUsePatientStore.mockReturnValue({
      patients: [patientWithMeasurements],
      loadMeasurements: mockLoadMeasurements,
      isMeasurementsLoading: false,
      deleteMeasurement: mockDeleteMeasurement,
    })
    renderDetail(patientWithMeasurements)
    await userEvent.click(screen.getByRole("tab", { name: /measurement history/i }))
    expect(screen.getByRole("button", { name: /edit measurement/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /delete measurement/i })).toBeInTheDocument()
  })

  it("opens edit dialog when pencil button is clicked", async () => {
    const patientWithMeasurements = {
      ...mockPatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5, percentile: "25th-75th" }],
    }
    mockUsePatientStore.mockReturnValue({
      patients: [patientWithMeasurements],
      loadMeasurements: mockLoadMeasurements,
      isMeasurementsLoading: false,
      deleteMeasurement: mockDeleteMeasurement,
    })
    renderDetail(patientWithMeasurements)
    await userEvent.click(screen.getByRole("tab", { name: /measurement history/i }))
    await userEvent.click(screen.getByRole("button", { name: /edit measurement/i }))
    expect(screen.getByTestId("edit-measurement-dialog")).toBeInTheDocument()
  })

  it("opens delete confirm when trash button is clicked", async () => {
    const patientWithMeasurements = {
      ...mockPatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5, percentile: "25th-75th" }],
    }
    mockUsePatientStore.mockReturnValue({
      patients: [patientWithMeasurements],
      loadMeasurements: mockLoadMeasurements,
      isMeasurementsLoading: false,
      deleteMeasurement: mockDeleteMeasurement,
    })
    renderDetail(patientWithMeasurements)
    await userEvent.click(screen.getByRole("tab", { name: /measurement history/i }))
    await userEvent.click(screen.getByRole("button", { name: /delete measurement/i }))
    expect(screen.getByText(/delete measurement\?/i)).toBeInTheDocument()
  })

  it("calls deleteMeasurement when confirm delete is clicked", async () => {
    const patientWithMeasurements = {
      ...mockPatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5, percentile: "25th-75th" }],
    }
    mockUsePatientStore.mockReturnValue({
      patients: [patientWithMeasurements],
      loadMeasurements: mockLoadMeasurements,
      isMeasurementsLoading: false,
      deleteMeasurement: mockDeleteMeasurement,
    })
    renderDetail(patientWithMeasurements)
    await userEvent.click(screen.getByRole("tab", { name: /measurement history/i }))
    await userEvent.click(screen.getByRole("button", { name: /delete measurement/i }))
    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }))
    expect(mockDeleteMeasurement).toHaveBeenCalledWith("mock-token", "real-1", "m1")
  })
})
