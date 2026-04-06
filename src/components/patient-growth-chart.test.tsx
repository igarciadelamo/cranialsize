import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import PatientGrowthChart from "./patient-growth-chart"
import type { Patient } from "@/lib/types"

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: ({ tickFormatter }: any) => { tickFormatter?.(42.5); return null },
  CartesianGrid: () => null,
  Tooltip: ({ content }: any) => {
    if (!content) return null
    return (
      <>
        {React.cloneElement(content, { active: false, payload: null })}
        {React.cloneElement(content, { active: true, payload: [{ dataKey: "other", payload: {} }] })}
        {React.cloneElement(content, { active: true, payload: [{ dataKey: "size", payload: { size: 42, ageInMonths: 6, date: "2024-07-01" } }] })}
      </>
    )
  },
  Legend: () => null,
}))

const mockGetCurves = vi.fn().mockResolvedValue([
  { month: 0, p3: 31.5, p15: 32.5, p50: 34.5, p85: 36.0, p97: 37.0 },
  { month: 6, p3: 40.0, p15: 41.0, p50: 42.0, p85: 43.0, p97: 44.0 },
])

vi.mock("@/lib/api-service", () => ({
  referenceService: {
    getHeadCircumferenceCurves: (...args: any[]) => mockGetCurves(...args),
  },
}))

const birthDate = new Date("2024-01-01")

const basePatient: Patient = {
  id: "1",
  firstName: "Emma",
  lastName: "Johnson",
  birthDate,
  sex: "F",
  measurements: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetCurves.mockResolvedValue([
    { month: 0, p3: 31.5, p15: 32.5, p50: 34.5, p85: 36.0, p97: 37.0 },
    { month: 6, p3: 40.0, p15: 41.0, p50: 42.0, p85: 43.0, p97: 44.0 },
  ])
})

describe("PatientGrowthChart", () => {
  it("shows empty state when patient has no measurements", () => {
    render(<PatientGrowthChart patient={basePatient} />)
    expect(screen.getByText(/no measurements recorded yet/i)).toBeInTheDocument()
    expect(screen.getByText(/add measurements to see the growth chart/i)).toBeInTheDocument()
  })

  it("does not render chart when no measurements", () => {
    render(<PatientGrowthChart patient={basePatient} />)
    expect(screen.queryByText(/birth size/i)).not.toBeInTheDocument()
  })

  it("renders Growth Chart title when patient has measurements", () => {
    const patient = {
      ...basePatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5 }],
    }
    render(<PatientGrowthChart patient={patient} />)
    expect(screen.getAllByText(/growth chart/i)[0]).toBeInTheDocument()
  })

  it("shows estimated birth size when no birthHeadCircumference", () => {
    const patient = {
      ...basePatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5 }],
    }
    render(<PatientGrowthChart patient={patient} />)
    expect(screen.getByText(/birth size \(estimated\)/i)).toBeInTheDocument()
    expect(screen.queryByText(/birth size \(actual\)/i)).not.toBeInTheDocument()
  })

  it("shows both actual and estimated birth size when birthHeadCircumference is set", () => {
    const patient = {
      ...basePatient,
      birthHeadCircumference: 34.0,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5 }],
    }
    render(<PatientGrowthChart patient={patient} />)
    expect(screen.getByText(/birth size \(actual\)/i)).toBeInTheDocument()
    expect(screen.getByText(/34\.0 cm/i)).toBeInTheDocument()
    expect(screen.getByText(/birth size \(estimated\)/i)).toBeInTheDocument()
  })

  it("shows current size from the last measurement", () => {
    const patient = {
      ...basePatient,
      measurements: [
        { id: "m1", date: new Date("2024-04-01"), size: 40.0 },
        { id: "m2", date: new Date("2024-07-01"), size: 43.2 },
      ],
    }
    render(<PatientGrowthChart patient={patient} />)
    expect(screen.getByText(/current size/i)).toBeInTheDocument()
    expect(screen.getByText(/43\.2 cm/i)).toBeInTheDocument()
  })

  it("calls referenceService with the patient's sex", async () => {
    const patient = {
      ...basePatient,
      sex: "M" as const,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5 }],
    }
    render(<PatientGrowthChart patient={patient} />)
    await waitFor(() => {
      expect(mockGetCurves).toHaveBeenCalledWith("M")
    })
  })

  it("fetches reference curves on mount", async () => {
    const patient = {
      ...basePatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5 }],
    }
    render(<PatientGrowthChart patient={patient} />)
    await waitFor(() => {
      expect(mockGetCurves).toHaveBeenCalledTimes(1)
    })
  })

  it("renders without crashing when WHO API call fails", async () => {
    mockGetCurves.mockRejectedValueOnce(new Error("API Error"))
    const patient = {
      ...basePatient,
      measurements: [{ id: "m1", date: new Date("2024-07-01"), size: 42.5 }],
    }
    render(<PatientGrowthChart patient={patient} />)
    await waitFor(() => {
      expect(mockGetCurves).toHaveBeenCalledTimes(1)
    })
    expect(screen.getAllByText(/growth chart/i)[0]).toBeInTheDocument()
  })
})
