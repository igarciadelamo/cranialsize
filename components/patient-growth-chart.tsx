"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateExpectedSize } from "@/lib/skull-calculations"
import type { Measurement, Patient } from "@/lib/types"
import { differenceInMonths, format } from "date-fns"
import { useMemo } from "react"
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

interface PatientGrowthChartProps {
  patient: Patient
}

export default function PatientGrowthChart({ patient }: PatientGrowthChartProps) {
  const chartData = useMemo(() => {
    // Sort measurements by date (oldest first)
    const sortedMeasurements = [...patient.measurements].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate months since birth for each measurement
    const measurementsWithAge = sortedMeasurements.map((measurement) => {
      const ageInMonths = differenceInMonths(measurement.date, patient.birthDate)
      return {
        ageInMonths,
        size: measurement.size,
        date: format(measurement.date, "MMM d, yyyy"),
      }
    })

    // Add birth point (estimated or actual)
    const birthSize =
      patient.measurements.length > 0
        ? calculateEstimatedBirthSizeFromMeasurements(patient.measurements, patient.birthDate)
        : 35 // Default average newborn head size if no measurements

    const dataWithBirth = [
      { ageInMonths: 0, size: birthSize, date: format(patient.birthDate, "MMM d, yyyy") },
      ...measurementsWithAge,
    ]

    // Generate reference line data (50th percentile)
    const referenceData = []
    const maxAge = Math.max(...measurementsWithAge.map((m) => m.ageInMonths), 12) // At least show first year

    for (let month = 0; month <= maxAge; month++) {
      referenceData.push({
        ageInMonths: month,
        expectedSize: calculateExpectedSize(month),
      })
    }

    return { patientData: dataWithBirth, referenceData }
  }, [patient])

  // If no measurements, show a message
  if (patient.measurements.length === 0) {
    return (
      <Card className="shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gradient-secondary pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">Growth Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No measurements recorded yet</h3>
            <p className="text-gray-500">Add measurements to see the growth chart</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload[0]?.payload) return null

    const data = payload[0].payload

    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-gray-500">Age</span>
            <span className="font-bold text-gray-700">
              {data?.ageInMonths} {data?.ageInMonths === 1 ? "month" : "months"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-gray-500">Size</span>
            <span className="font-bold text-gray-700">{data?.size?.toFixed(1) ?? 'N/A'} cm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-gray-500">Date</span>
            <span className="font-bold text-gray-700">
              {data?.date ? format(new Date(data.date), 'MMM d, yyyy') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="shadow-md border-0 overflow-hidden">
      <CardHeader className="bg-gradient-secondary pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">Growth Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="ageInMonths"
                type="number"
                domain={[0, "dataMax + 1"]}
                tickCount={6}
                label={{ 
                  value: "Age (months)", 
                  position: "bottom", 
                  offset: 20,
                  style: {
                    textAnchor: 'middle',
                    fill: '#334155',
                    fontSize: 14,
                    fontWeight: 600
                  }
                }}
              />
              <YAxis
                label={{ 
                  value: "Head Circumference (cm)", 
                  angle: -90, 
                  position: "insideLeft",
                  offset: 10,
                  style: {
                    textAnchor: 'middle',
                    fill: '#334155',
                    fontSize: 14,
                    fontWeight: 600
                  }
                }}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(value) => Math.round(value).toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Expected size reference line */}
              <Line
                data={chartData.referenceData}
                type="monotone"
                dataKey="expectedSize"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                dot={false}
                name="50th Percentile"
              />

              {/* Patient's actual measurements */}
              <Line
                data={chartData.patientData}
                type="monotone"
                dataKey="size"
                stroke="#14b8a6"
                strokeWidth={3}
                name="Patient Measurements"
                activeDot={{ r: 8, stroke: "#0d9488", strokeWidth: 2, fill: "#fff" }}
                dot={{ stroke: "#0d9488", strokeWidth: 2, r: 4, fill: "#fff" }}
              />
              <Area
                data={chartData.patientData}
                type="monotone"
                dataKey="size"
                stroke="none"
                fillOpacity={1}
                fill="url(#colorSize)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-secondary p-3 rounded-lg">
            {patient.birthHeadCircumference ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Birth Size (Actual)</p>
                  <p className="text-lg font-semibold text-gray-800">{patient.birthHeadCircumference.toFixed(1)} cm</p>
                </div>
                <div className="border-l border-gray-200 pl-4">
                  <p className="text-sm font-medium text-gray-700">Birth Size (Estimated)</p>
                  <p className="text-lg font-semibold text-gray-800">{chartData.patientData[0].size.toFixed(1)} cm</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Birth Size (Estimated)</p>
                <p className="text-lg font-semibold text-gray-800">{chartData.patientData[0].size.toFixed(1)} cm</p>
              </>
            )}
          </div>
          <div className="bg-gradient-secondary p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Current Size</p>
            <p className="text-lg font-semibold text-gray-800">
              {chartData.patientData[chartData.patientData.length - 1].size.toFixed(1)} cm
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to estimate birth size from available measurements
function calculateEstimatedBirthSizeFromMeasurements(measurements: Measurement[], birthDate: Date): number {
  if (measurements.length === 0) return 35

  // Use the earliest measurement to estimate birth size
  const sortedMeasurements = [...measurements].sort((a, b) => a.date.getTime() - b.date.getTime())

  const earliestMeasurement = sortedMeasurements[0]
  const ageInMonths = differenceInMonths(earliestMeasurement.date, birthDate)

  // Calculate expected size at measurement age
  const expectedSize = calculateExpectedSize(ageInMonths)

  // Calculate the difference between actual and expected
  const sizeDifference = earliestMeasurement.size - expectedSize

  // Apply this difference to the expected birth size (around 35cm)
  const expectedBirthSize = calculateExpectedSize(0)
  return Math.max(expectedBirthSize + sizeDifference, 30)
}
