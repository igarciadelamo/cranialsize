import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Results from "./results"

vi.mock("@/lib/api-service", () => ({
  referenceService: {
    getHeadCircumferenceCurves: vi.fn().mockResolvedValue([
      { month: 6, p3: 40.0, p15: 41.0, p50: 42.0, p85: 43.0, p97: 44.0 },
    ]),
  },
  calculateEstimatedBirthSize: vi.fn(),
}))

const birthDate = new Date("2024-01-01")
const measurementDate = new Date("2024-07-01") // ~6 months

const mockPatient = {
  id: "1",
  firstName: "Emma",
  lastName: "Johnson",
  birthDate,
  sex: "F" as const,
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

beforeEach(() => {
  vi.clearAllMocks()
})

describe("Results", () => {
  it("renders patient name", () => {
    renderResults()
    expect(screen.getByText(/emma johnson/i)).toBeInTheDocument()
  })

  it("renders measured size", () => {
    renderResults()
    expect(screen.getByText(/42\.5 cm/i)).toBeInTheDocument()
  })

  it("renders expected size from WHO reference data", async () => {
    renderResults()
    await waitFor(() => {
      expect(screen.getByText(/42\.0 cm/i)).toBeInTheDocument()
    })
  })

  it("shows positive difference in green when size is above P50", async () => {
    renderResults({}, { size: 45.0 })
    await waitFor(() => {
      expect(screen.getByText(/\+3\.0 cm from expected/i)).toBeInTheDocument()
    })
  })

  it("shows negative difference in amber when size is below P50", async () => {
    renderResults({}, { size: 39.0 })
    await waitFor(() => {
      expect(screen.getByText(/-3\.0 cm from expected/i)).toBeInTheDocument()
    })
  })

  it("renders percentile section", () => {
    renderResults()
    expect(screen.getByText(/percentile \(who\)/i)).toBeInTheDocument()
  })

  it("shows percentile value when provided", () => {
    renderResults({}, { percentile: "P65" })
    expect(screen.getByText("P65")).toBeInTheDocument()
  })

  it("shows not available when percentile is missing", () => {
    renderResults()
    expect(screen.getByText(/not available/i)).toBeInTheDocument()
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
})
