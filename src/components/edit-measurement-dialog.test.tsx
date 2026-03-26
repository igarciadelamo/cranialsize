import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import EditMeasurementDialog from "./edit-measurement-dialog"
import type { Measurement } from "@/lib/types"

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ accessToken: "mock-token" }),
}))

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

const mockEditMeasurement = vi.fn()
vi.mock("@/lib/patient-store", () => ({
  usePatientStore: () => ({ editMeasurement: mockEditMeasurement }),
}))

const mockMeasurement: Measurement = {
  id: "m1",
  date: new Date("2024-07-01"),
  size: 42.5,
  percentile: "P50",
}

function renderDialog(open = true, onOpenChange = vi.fn()) {
  return render(
    <EditMeasurementDialog
      patientId="p1"
      measurement={mockMeasurement}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("EditMeasurementDialog", () => {
  it("renders with pre-populated size", () => {
    renderDialog()
    expect(screen.getByDisplayValue("42.5")).toBeInTheDocument()
  })

  it("does not render when closed", () => {
    renderDialog(false)
    expect(screen.queryByText(/edit measurement/i)).not.toBeInTheDocument()
  })

  it("shows validation error when size is empty", async () => {
    renderDialog()
    await userEvent.clear(screen.getByDisplayValue("42.5"))
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }))
    expect(screen.getByText(/measurement is required/i)).toBeInTheDocument()
  })

  it("shows validation error when size is out of range", async () => {
    renderDialog()
    const input = screen.getByDisplayValue("42.5")
    await userEvent.clear(input)
    await userEvent.type(input, "200")
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }))
    expect(screen.getByText(/please enter a value between/i)).toBeInTheDocument()
  })

  it("calls editMeasurement with correct args on submit", async () => {
    mockEditMeasurement.mockResolvedValueOnce(undefined)
    const onOpenChange = vi.fn()
    renderDialog(true, onOpenChange)
    const input = screen.getByDisplayValue("42.5")
    await userEvent.clear(input)
    await userEvent.type(input, "43.0")
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }))
    expect(mockEditMeasurement).toHaveBeenCalledWith("mock-token", "p1", "m1", expect.objectContaining({ size: 43.0 }))
  })

  it("closes dialog on successful save", async () => {
    mockEditMeasurement.mockResolvedValueOnce(undefined)
    const onOpenChange = vi.fn()
    renderDialog(true, onOpenChange)
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("shows error toast when save fails", async () => {
    const { toast } = await import("sonner")
    mockEditMeasurement.mockRejectedValueOnce(new Error("fail"))
    renderDialog()
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }))
    expect(toast.error).toHaveBeenCalledOnce()
  })

  it("calls onOpenChange(false) when cancel is clicked", async () => {
    const onOpenChange = vi.fn()
    renderDialog(true, onOpenChange)
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
