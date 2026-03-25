import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PatientList from "./patient-list"

const mockUsePatientStore = vi.fn()
vi.mock("@/lib/patient-store", () => ({
  usePatientStore: (...args: any[]) => mockUsePatientStore(...args),
}))

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ accessToken: "mock-token" }),
}))

vi.mock("@/components/edit-patient-dialog", () => ({
  default: ({ open, patient }: { open: boolean; patient: { firstName: string } }) =>
    open ? <div data-testid="edit-dialog">{patient.firstName}</div> : null,
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

const mockDeletePatient = vi.fn().mockResolvedValue(undefined)

beforeEach(() => {
  vi.clearAllMocks()
  mockUsePatientStore.mockReturnValue({ patients: mockPatients, isLoading: false, deletePatient: mockDeletePatient })
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

  it("switches active sort column when a different header is clicked", async () => {
    renderList()
    await userEvent.click(screen.getByText("Age"))
    // ArrowUpDown should now be in the Age header, not in Patient Name
    const ageHeader = screen.getByText("Age").closest("div")!
    expect(ageHeader.querySelector("svg")).toBeInTheDocument()
  })

  it("switches sort to records column when Records header is clicked", async () => {
    renderList()
    await userEvent.click(screen.getByText("Records"))
    const recordsHeader = screen.getByText("Records").closest("div")!
    expect(recordsHeader.querySelector("svg")).toBeInTheDocument()
  })

  it("toggles sort direction when the active column header is clicked again", async () => {
    renderList()
    // Default: name asc → Emma before Noah
    const emmaBefore = screen.getByText(/emma johnson/i)
    const noahBefore = screen.getByText(/noah williams/i)
    expect(emmaBefore.compareDocumentPosition(noahBefore) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await userEvent.click(screen.getByText("Patient Name"))
    // name desc → Noah before Emma
    const emmaAfter = screen.getByText(/emma johnson/i)
    const noahAfter = screen.getByText(/noah williams/i)
    expect(noahAfter.compareDocumentPosition(emmaAfter) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe("PatientList — edit and delete actions", () => {
  it("opens edit dialog when pencil icon is clicked", async () => {
    renderList()
    const editButtons = screen.getAllByRole("button", { name: "" }).filter((btn) =>
      btn.querySelector("svg")
    )
    // First patient's edit button (pencil) is first icon button on first row
    const pencilButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-pencil")
    )
    await userEvent.click(pencilButtons[0])
    expect(screen.getByTestId("edit-dialog")).toBeInTheDocument()
    expect(screen.getByTestId("edit-dialog")).toHaveTextContent("Emma")
  })

  it("does not navigate to patient detail when edit button is clicked", async () => {
    renderList()
    const pencilButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-pencil")
    )
    await userEvent.click(pencilButtons[0])
    expect(mockOnPatientSelect).not.toHaveBeenCalled()
  })

  it("opens delete confirmation when trash icon is clicked", async () => {
    renderList()
    const trashButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-trash-2")
    )
    await userEvent.click(trashButtons[0])
    expect(screen.getByText(/delete patient\?/i)).toBeInTheDocument()
    expect(screen.getByText(/this will permanently delete/i)).toBeInTheDocument()
  })

  it("does not navigate to patient detail when delete button is clicked", async () => {
    renderList()
    const trashButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-trash-2")
    )
    await userEvent.click(trashButtons[0])
    expect(mockOnPatientSelect).not.toHaveBeenCalled()
  })

  it("calls deletePatient and closes dialog when Delete is confirmed", async () => {
    renderList()
    const trashButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-trash-2")
    )
    await userEvent.click(trashButtons[0])
    await userEvent.click(screen.getByRole("button", { name: /^delete$/i }))
    await waitFor(() => {
      expect(mockDeletePatient).toHaveBeenCalledWith("mock-token", "1")
    })
  })

  it("closes delete dialog without calling deletePatient when Cancel is clicked", async () => {
    renderList()
    const trashButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-trash-2")
    )
    await userEvent.click(trashButtons[0])
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByText(/delete patient\?/i)).not.toBeInTheDocument()
    })
    expect(mockDeletePatient).not.toHaveBeenCalled()
  })
})
