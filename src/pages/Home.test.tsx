import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import Home from "./Home"

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockUseAuth = vi.fn()
vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}))

const mockLoadPatients = vi.fn()
const mockUsePatientStore = vi.fn()
vi.mock("@/lib/patient-store", () => ({
  usePatientStore: (...args: any[]) => mockUsePatientStore(...args),
}))

vi.mock("@/components/app-header", () => ({
  default: ({ currentView, onBackToPatients }: any) => (
    <div data-testid="app-header" data-view={currentView}>
      <button onClick={onBackToPatients}>Back</button>
    </div>
  ),
}))

vi.mock("@/components/patient-list", () => ({
  default: ({ onPatientSelect, onAddNewPatient }: any) => (
    <div data-testid="patient-list">
      <button onClick={() => onPatientSelect({ id: "1", firstName: "Emma", lastName: "Johnson", birthDate: new Date(), measurements: [] })}>
        Select Patient
      </button>
      <button onClick={onAddNewPatient}>Add New Patient</button>
    </div>
  ),
}))

vi.mock("@/components/new-patient-form", () => ({
  default: ({ onCancel, onComplete }: any) => (
    <div data-testid="new-patient-form">
      <button onClick={onCancel}>Cancel</button>
      <button onClick={() => onComplete({ id: "2", firstName: "New", lastName: "Patient", birthDate: new Date(), measurements: [] })}>
        Complete
      </button>
    </div>
  ),
}))

vi.mock("@/components/patient-detail", () => ({
  default: ({ patient, onBack, onAddMeasurement }: any) => (
    <div data-testid="patient-detail">
      <span>{patient.firstName}</span>
      <button onClick={onBack}>Back</button>
      <button onClick={onAddMeasurement}>Add Measurement</button>
    </div>
  ),
}))

vi.mock("@/components/skull-measurement-form", () => ({
  default: ({ onSubmit, onCancel }: any) => (
    <div data-testid="skull-form">
      <button onClick={() => onSubmit({ date: new Date(), size: 42 })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}))

vi.mock("@/components/results", () => ({
  default: ({ onBack }: any) => (
    <div data-testid="results">
      <button onClick={onBack}>Back</button>
    </div>
  ),
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const mockUser = { name: "Isidro Garcia", email: "isidro@example.com", image: "", plan: "free" }

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: mockUser, isLoading: false, accessToken: "token-123" })
  mockUsePatientStore.mockReturnValue({ patients: [], loadPatients: mockLoadPatients })
})

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  )
}

describe("Home", () => {
  it("redirects to /auth/signin when no user and not loading", async () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, accessToken: null })
    renderHome()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/auth/signin"))
  })

  it("shows loading spinner when isLoading is true", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true, accessToken: null })
    renderHome()
    expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument()
  })

  it("renders null when not loading and no user (before redirect)", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false, accessToken: null })
    const { container } = renderHome()
    // Either null or loading, in any case no patient list
    expect(screen.queryByTestId("patient-list")).not.toBeInTheDocument()
  })

  it("calls loadPatients on mount when user and token exist", () => {
    renderHome()
    expect(mockLoadPatients).toHaveBeenCalledWith("token-123")
  })

  it("renders patient list by default", () => {
    renderHome()
    expect(screen.getByTestId("patient-list")).toBeInTheDocument()
  })

  it("navigates to patientDetail view when a patient is selected", async () => {
    renderHome()
    await userEvent.click(screen.getByText("Select Patient"))
    expect(screen.getByTestId("patient-detail")).toBeInTheDocument()
    expect(screen.getByText("Emma")).toBeInTheDocument()
  })

  it("navigates to newPatient view when Add New Patient is clicked", async () => {
    renderHome()
    await userEvent.click(screen.getByText("Add New Patient"))
    expect(screen.getByTestId("new-patient-form")).toBeInTheDocument()
  })

  it("returns to patient list when back is clicked from newPatient form", async () => {
    renderHome()
    await userEvent.click(screen.getByText("Add New Patient"))
    await userEvent.click(screen.getByText("Cancel"))
    expect(screen.getByTestId("patient-list")).toBeInTheDocument()
  })

  it("navigates to skull form when Add Measurement is clicked in patient detail", async () => {
    renderHome()
    await userEvent.click(screen.getByText("Select Patient"))
    await userEvent.click(screen.getByText("Add Measurement"))
    expect(screen.getByTestId("skull-form")).toBeInTheDocument()
  })

  it("navigates to results after skull form submit", async () => {
    renderHome()
    await userEvent.click(screen.getByText("Select Patient"))
    await userEvent.click(screen.getByText("Add Measurement"))
    await userEvent.click(screen.getByText("Submit"))
    expect(screen.getByTestId("results")).toBeInTheDocument()
  })

  it("goes back to patient detail from skull form cancel", async () => {
    renderHome()
    await userEvent.click(screen.getByText("Select Patient"))
    await userEvent.click(screen.getByText("Add Measurement"))
    await userEvent.click(screen.getByText("Cancel"))
    expect(screen.getByTestId("patient-detail")).toBeInTheDocument()
  })
})
