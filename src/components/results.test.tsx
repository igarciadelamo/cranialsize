import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Results from "./results"
import { calculateExpectedSize } from "@/lib/skull-calculations"

const birthDate = new Date("2024-01-01")
const measurementDate = new Date("2024-07-01") // ~6 months

const mockPatient = {
  id: "1",
  firstName: "Emma",
  lastName: "Johnson",
  birthDate,
  measurements: [],
}

const mockMeasurement = {
  date: measurementDate,
  size: 42.5,
}

const mockOnBack = vi.fn()

function renderResults(patientOverrides = {}, measurementOverrides = {}) {
  return render(
    <Results
      patient={{ ...mockPatient, ...patientOverrides }}
      data={{ ...mockMeasurement, ...measurementOverrides }}
      onBack={mockOnBack}
    />
  )
}

describe("Results", () => {
  it("renders patient name", () => {
    renderResults()
    expect(screen.getByText(/emma johnson/i)).toBeInTheDocument()
  })

  it("renders measured size", () => {
    renderResults()
    expect(screen.getByText(/42\.5 cm/i)).toBeInTheDocument()
  })

  it("renders expected size for the patient's age", () => {
    renderResults()
    const expected = calculateExpectedSize(6).toFixed(1)
    expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
  })

  it("renders percentile section", () => {
    renderResults()
    expect(screen.getByText(/approximate percentile/i)).toBeInTheDocument()
  })

  it("calls onBack when back button is clicked", async () => {
    renderResults()
    await userEvent.click(screen.getByRole("button", { name: /back to patient/i }))
    expect(mockOnBack).toHaveBeenCalledOnce()
  })

  it("shows estimated birth size when no birth HC provided", () => {
    renderResults()
    expect(screen.getByText(/birth size \(estimated\)/i)).toBeInTheDocument()
    expect(screen.queryByText(/birth size \(actual\)/i)).not.toBeInTheDocument()
  })

  it("shows both actual and estimated birth size when birth HC is provided", () => {
    renderResults({ birthHeadCircumference: 34.5 })
    expect(screen.getByText(/birth size \(actual\)/i)).toBeInTheDocument()
    expect(screen.getByText(/34\.5 cm/i)).toBeInTheDocument()
    expect(screen.getByText(/birth size \(estimated\)/i)).toBeInTheDocument()
  })

  it("shows positive difference in green when size is above expected", () => {
    const bigSize = calculateExpectedSize(6) + 3
    renderResults({}, { size: bigSize })
    const diff = screen.getByText(/\+.*cm/i)
    expect(diff).toHaveClass("text-green-600")
  })

  it("shows negative difference in amber when size is below expected", () => {
    const smallSize = calculateExpectedSize(6) - 3
    renderResults({}, { size: smallSize })
    const diff = screen.getByText(/-.*cm/i)
    expect(diff).toHaveClass("text-amber-600")
  })
})
