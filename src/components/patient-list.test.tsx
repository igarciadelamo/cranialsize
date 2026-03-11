import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PatientList from "./patient-list"

const mockUsePatientStore = vi.fn()
vi.mock("@/lib/patient-store", () => ({
  usePatientStore: (...args: any[]) => mockUsePatientStore(...args),
}))

const mockPatients = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Johnson",
    birthDate: new Date("2024-01-01"),
    measurements: [{ date: new Date(), size: 38 }],
  },
  {
    id: "2",
    firstName: "Noah",
    lastName: "Williams",
    birthDate: new Date("2023-06-01"),
    measurements: [],
  },
]

const mockOnPatientSelect = vi.fn()
const mockOnAddNewPatient = vi.fn()

function renderList() {
  return render(<PatientList onPatientSelect={mockOnPatientSelect} onAddNewPatient={mockOnAddNewPatient} />)
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUsePatientStore.mockReturnValue({ patients: mockPatients, isLoading: false })
})

describe("PatientList", () => {
  it("renders patient names", () => {
    renderList()
    expect(screen.getByText(/emma johnson/i)).toBeInTheDocument()
    expect(screen.getByText(/noah williams/i)).toBeInTheDocument()
  })

  it("shows loading skeleton when isLoading is true", () => {
    mockUsePatientStore.mockReturnValue({ patients: [], isLoading: true })
    renderList()
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument()
  })

  it("filters patients by search query", async () => {
    renderList()
    await userEvent.type(screen.getByPlaceholderText(/search patients/i), "Emma")
    expect(screen.getByText(/emma johnson/i)).toBeInTheDocument()
    expect(screen.queryByText(/noah williams/i)).not.toBeInTheDocument()
  })

  it("shows empty state when no patients match search", async () => {
    renderList()
    await userEvent.type(screen.getByPlaceholderText(/search patients/i), "zzznomatch")
    expect(screen.getByText(/no patients found/i)).toBeInTheDocument()
    expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument()
  })

  it("calls onPatientSelect when a patient row is clicked", async () => {
    renderList()
    await userEvent.click(screen.getByText(/emma johnson/i))
    expect(mockOnPatientSelect).toHaveBeenCalledWith(mockPatients[0])
  })

  it("calls onAddNewPatient when New Patient button is clicked", async () => {
    renderList()
    await userEvent.click(screen.getByRole("button", { name: /new patient/i }))
    expect(mockOnAddNewPatient).toHaveBeenCalledOnce()
  })

  it("shows empty state with add button when no patients and no search", () => {
    mockUsePatientStore.mockReturnValue({ patients: [], isLoading: false })
    renderList()
    expect(screen.getByText(/add your first patient/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /add patient/i })).toBeInTheDocument()
  })

  it("shows correct measurement count for each patient", () => {
    renderList()
    expect(screen.getByText(/1 record/i)).toBeInTheDocument()
    expect(screen.getByText(/0 records/i)).toBeInTheDocument()
  })
})
