import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EditPatientDialog from "./edit-patient-dialog"
import type { Patient } from "@/lib/types"

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ accessToken: "mock-token" }),
}))

const mockEditPatient = vi.fn().mockResolvedValue(undefined)
vi.mock("@/lib/patient-store", () => ({
  usePatientStore: () => ({ editPatient: mockEditPatient }),
}))

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

const birthDate = new Date("2022-03-15")
const mockPatient: Patient = {
  id: "p1",
  firstName: "Emma",
  lastName: "Johnson",
  birthDate,
  sex: "F",
  measurements: [],
}

const mockOnOpenChange = vi.fn()

function renderDialog(patientOverrides = {}, open = true) {
  return render(
    <EditPatientDialog
      patient={{ ...mockPatient, ...patientOverrides }}
      open={open}
      onOpenChange={mockOnOpenChange}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("EditPatientDialog", () => {
  it("renders pre-populated first and last name", () => {
    renderDialog()
    expect(screen.getByDisplayValue("Emma")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Johnson")).toBeInTheDocument()
  })

  it("renders sex selector with current selection highlighted", () => {
    renderDialog()
    expect(screen.getByRole("button", { name: "Female" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Male" })).toBeInTheDocument()
  })

  it("renders pre-populated birth head circumference", () => {
    renderDialog({ birthHeadCircumference: 34.5 })
    expect(screen.getByDisplayValue("34.5")).toBeInTheDocument()
  })

  it("renders empty birth head circumference when not set", () => {
    renderDialog()
    expect(screen.getByLabelText(/birth head circumference/i)).toHaveValue("")
  })

  it("shows validation error when first name is cleared and form submitted", async () => {
    renderDialog()
    await userEvent.clear(screen.getByLabelText(/first name/i))
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
  })

  it("shows validation error when last name is cleared and form submitted", async () => {
    renderDialog()
    await userEvent.clear(screen.getByLabelText(/last name/i))
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })
  })

  it("shows error for out-of-range birth head circumference", async () => {
    renderDialog()
    await userEvent.type(screen.getByLabelText(/birth head circumference/i), "99")
    await waitFor(() => {
      expect(screen.getByText(/please enter a value between/i)).toBeInTheDocument()
    })
  })

  it("clears circumference error when value is deleted", async () => {
    renderDialog()
    await userEvent.type(screen.getByLabelText(/birth head circumference/i), "99")
    await userEvent.clear(screen.getByLabelText(/birth head circumference/i))
    await waitFor(() => {
      expect(screen.queryByText(/please enter a value between/i)).not.toBeInTheDocument()
    })
  })

  it("calls editPatient with updated data on submit", async () => {
    renderDialog()
    await userEvent.clear(screen.getByLabelText(/first name/i))
    await userEvent.type(screen.getByLabelText(/first name/i), "Sophia")
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(mockEditPatient).toHaveBeenCalledWith(
        "mock-token",
        "p1",
        expect.objectContaining({ firstName: "Sophia" })
      )
    })
  })

  it("sends null for birthHeadCircumference when field is cleared", async () => {
    renderDialog({ birthHeadCircumference: 34.5 })
    await userEvent.clear(screen.getByLabelText(/birth head circumference/i))
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(mockEditPatient).toHaveBeenCalledWith(
        "mock-token",
        "p1",
        expect.objectContaining({ birthHeadCircumference: null })
      )
    })
  })

  it("calls onOpenChange(false) after successful submit", async () => {
    renderDialog()
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    renderDialog()
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it("switches sex to Male when Male button is clicked", async () => {
    renderDialog()
    await userEvent.click(screen.getByRole("button", { name: "Male" }))
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(mockEditPatient).toHaveBeenCalledWith(
        "mock-token",
        "p1",
        expect.objectContaining({ sex: "M" })
      )
    })
  })

  it("switches sex back to Female when Female button is clicked from Male", async () => {
    renderDialog({ sex: "M" as const })
    await userEvent.click(screen.getByRole("button", { name: "Female" }))
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(mockEditPatient).toHaveBeenCalledWith(
        "mock-token",
        "p1",
        expect.objectContaining({ sex: "F" })
      )
    })
  })

  it("clears circumference error when value becomes valid", async () => {
    renderDialog()
    await userEvent.type(screen.getByLabelText(/birth head circumference/i), "99")
    await waitFor(() => {
      expect(screen.getByText(/please enter a value between/i)).toBeInTheDocument()
    })
    await userEvent.clear(screen.getByLabelText(/birth head circumference/i))
    await userEvent.type(screen.getByLabelText(/birth head circumference/i), "35")
    await waitFor(() => {
      expect(screen.queryByText(/please enter a value between/i)).not.toBeInTheDocument()
    })
  })

  it("shows toast on API error", async () => {
    const { toast } = await import("sonner")
    mockEditPatient.mockRejectedValueOnce(new Error("500"))
    renderDialog()
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })
})
