import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SkullMeasurementForm from "./skull-measurement-form"

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ accessToken: "mock-token" }),
}))

const mockAddMeasurement = vi.fn()
vi.mock("@/lib/patient-store", () => ({
  usePatientStore: () => ({ addMeasurement: mockAddMeasurement }),
}))

const mockPatient = {
  id: "real-1",
  firstName: "John",
  lastName: "Doe",
  birthDate: new Date("2024-01-01"),
  sex: "M" as const,
  measurements: [],
}

const mockOnSubmit = vi.fn()
const mockOnCancel = vi.fn()

function renderForm() {
  return render(
    <SkullMeasurementForm patient={mockPatient} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("SkullMeasurementForm", () => {
  it("renders the skull circumference input", () => {
    renderForm()
    expect(screen.getByLabelText(/skull circumference/i)).toBeInTheDocument()
  })

  it("shows patient name in the title", () => {
    renderForm()
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it("shows validation error when submitting without a value", async () => {
    renderForm()
    fireEvent.click(screen.getByRole("button", { name: /save measurement/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid measurement/i)).toBeInTheDocument()
    })
  })

  it("calls onCancel when cancel button is clicked", async () => {
    renderForm()
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockOnCancel).toHaveBeenCalledOnce()
  })

  it("calls onSubmit after successful save", async () => {
    mockAddMeasurement.mockResolvedValueOnce(undefined)
    renderForm()
    await userEvent.type(screen.getByLabelText(/skull circumference/i), "42")
    await userEvent.click(screen.getByRole("button", { name: /save measurement/i }))
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledOnce()
    })
  })

  it("does not call onSubmit when API fails", async () => {
    mockAddMeasurement.mockRejectedValueOnce(new Error("500"))
    renderForm()
    await userEvent.type(screen.getByLabelText(/skull circumference/i), "42")
    await userEvent.click(screen.getByRole("button", { name: /save measurement/i }))
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  it("disables buttons while submitting", async () => {
    mockAddMeasurement.mockImplementation(() => new Promise(() => {})) // never resolves
    renderForm()
    await userEvent.type(screen.getByLabelText(/skull circumference/i), "42")
    await userEvent.click(screen.getByRole("button", { name: /save measurement/i }))
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled()
    })
  })
})
