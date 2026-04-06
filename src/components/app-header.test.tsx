import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import AppHeader from "./app-header"

vi.mock("@/components/user-menu", () => ({
  default: () => <div data-testid="user-menu" />,
}))

const mockNavigate = vi.fn()
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: { name: "Isidro Garcia" } }),
}))

const mockOnBackToPatients = vi.fn()

function renderHeader(currentView: any) {
  return render(
    <MemoryRouter>
      <AppHeader currentView={currentView} onBackToPatients={mockOnBackToPatients} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("AppHeader", () => {
  it("shows 'Patient Registry' title on patients view", () => {
    renderHeader("patients")
    expect(screen.getByText("Patient Registry")).toBeInTheDocument()
  })

  it("shows 'Patient Details' title on patientDetail view", () => {
    renderHeader("patientDetail")
    expect(screen.getByText("Patient Details")).toBeInTheDocument()
  })

  it("shows 'New Measurement' title on newMeasurement view", () => {
    renderHeader("newMeasurement")
    expect(screen.getByText("New Measurement")).toBeInTheDocument()
  })

  it("shows 'Measurement Results' title on results view", () => {
    renderHeader("results")
    expect(screen.getByText("Measurement Results")).toBeInTheDocument()
  })

  it("shows 'Settings' title on settings view", () => {
    renderHeader("settings")
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  it("shows welcome message on patients view", () => {
    renderHeader("patients")
    expect(screen.getByText(/welcome back, isidro/i)).toBeInTheDocument()
  })

  it("does not show back button on patients view", () => {
    renderHeader("patients")
    expect(screen.queryByTestId("back-button")).not.toBeInTheDocument()
  })

  it("calls onBackToPatients when back button clicked on patientDetail", async () => {
    renderHeader("patientDetail")
    const buttons = screen.getAllByRole("button")
    await userEvent.click(buttons[0])
    expect(mockOnBackToPatients).toHaveBeenCalledOnce()
  })

  it("navigates to '/' when back button clicked on settings view", async () => {
    renderHeader("settings")
    const buttons = screen.getAllByRole("button")
    await userEvent.click(buttons[0])
    expect(mockNavigate).toHaveBeenCalledWith("/")
    expect(mockOnBackToPatients).not.toHaveBeenCalled()
  })

  it("shows 'Add New Patient' title on newPatient view", () => {
    renderHeader("newPatient")
    expect(screen.getByText("Add New Patient")).toBeInTheDocument()
  })

  it("updates header style when page is scrolled", async () => {
    renderHeader("patients")
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 20 })
    window.dispatchEvent(new Event("scroll"))
    await waitFor(() => {
      expect(document.querySelector("header")!.className).toMatch(/backdrop-blur/)
    })
  })

  it("toggles mobile menu open when menu button is clicked", async () => {
    renderHeader("patients")
    const countBefore = screen.getAllByText(/cranialsize/i).length
    const menuButtons = screen.getAllByRole("button").filter((btn) =>
      btn.querySelector(".lucide-menu")
    )
    await userEvent.click(menuButtons[0])
    expect(screen.getAllByText(/cranialsize/i).length).toBeGreaterThan(countBefore)
  })
})
