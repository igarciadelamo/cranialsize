import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { referenceService, type ReferencePoint } from "@/lib/api-service"
import { calculateExpectedSize } from "@/lib/skull-calculations"
import type { Measurement, Patient } from "@/lib/types"
import { differenceInMonths, format } from "date-fns"
import { useEffect, useMemo, useState, type FC } from "react"
import {
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

const REFERENCE_LINES = [
  { key: "p97", label: "P97", color: "#f87171", dash: "4 3" },
  { key: "p85", label: "P85", color: "#94a3b8", dash: "4 3" },
  { key: "p50", label: "P50", color: "#475569", dash: "5 3" },
  { key: "p15", label: "P15", color: "#94a3b8", dash: "4 3" },
  { key: "p3",  label: "P3",  color: "#f87171", dash: "4 3" },
] as const

const CustomTooltip: FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload[0]?.payload) return null
  const data = payload[0].payload
  if (!data.size) return null

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
      <div className="space-y-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-gray-500">Age</span>
          <span className="font-bold text-gray-700">
            {data.ageInMonths} {data.ageInMonths === 1 ? "month" : "months"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-gray-500">Size</span>
          <span className="font-bold text-gray-700">{data.size?.toFixed(1) ?? "N/A"} cm</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-gray-500">Date</span>
          <span className="font-bold text-gray-700">{data.date ?? "N/A"}</span>
        </div>
      </div>
    </div>
  )
}

export default function PatientGrowthChart({ patient }: PatientGrowthChartProps) {
  const [referenceCurves, setReferenceCurves] = useState<ReferencePoint[]>([])

  useEffect(() => {
    referenceService.getHeadCircumferenceCurves(patient.sex).then(setReferenceCurves).catch(() => {})
  }, [patient.sex])

  const { patientByMonth, clampedMaxAge, ticks } = useMemo(() => {
    const sortedMeasurements = [...patient.measurements].sort((a, b) => a.date.getTime() - b.date.getTime())

    const measurementsWithAge = sortedMeasurements.map((m) => ({
      ageInMonths: differenceInMonths(m.date, patient.birthDate),
      size: m.size,
      date: format(m.date, "MMM d, yyyy"),
    }))

    const birthSize =
      patient.measurements.length > 0
        ? calculateEstimatedBirthSizeFromMeasurements(patient.measurements, patient.birthDate)
        : 35

    const patientByMonth = new Map<number, { size: number; date: string }>()
    patientByMonth.set(0, { size: birthSize, date: format(patient.birthDate, "MMM d, yyyy") })
    measurementsWithAge.forEach((m) => patientByMonth.set(m.ageInMonths, { size: m.size, date: m.date }))

    const patientAgeNow = differenceInMonths(new Date(), patient.birthDate)
    const lastMeasurementAge = measurementsWithAge.length > 0
      ? Math.max(...measurementsWithAge.map((m) => m.ageInMonths))
      : 0
    const clampedMaxAge = Math.max(lastMeasurementAge, patientAgeNow, 6) + 2
    const ticks = Array.from({ length: clampedMaxAge + 1 }, (_, i) => i)

    return { patientByMonth, clampedMaxAge, ticks }
  }, [patient])

  const chartData = useMemo(() => {
    const refByMonth = new Map(referenceCurves.map((r) => [r.month, r]))
    return ticks.map((month) => {
      const ref = refByMonth.get(month)
      const pat = patientByMonth.get(month)
      return {
        ageInMonths: month,
        ...(ref ? { p3: ref.p3, p15: ref.p15, p50: ref.p50, p85: ref.p85, p97: ref.p97 } : {}),
        ...(pat ? { size: pat.size, date: pat.date } : {}),
      }
    })
  }, [ticks, patientByMonth, referenceCurves])

  if (patient.measurements.length === 0) {
    return (
      <Card className="shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gradient-secondary pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">Growth Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
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

  return (
    <Card className="shadow-md border-0 overflow-hidden">
      <CardHeader className="bg-gradient-secondary pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">Growth Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="ageInMonths"
                type="number"
                domain={[0, clampedMaxAge]}
                ticks={ticks}
                label={{
                  value: "Age (months)",
                  position: "bottom",
                  offset: 20,
                  style: { textAnchor: "middle", fill: "#334155", fontSize: 14, fontWeight: 600 },
                }}
              />
              <YAxis
                label={{
                  value: "Head Circumference (cm)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                  style: { textAnchor: "middle", fill: "#334155", fontSize: 14, fontWeight: 600 },
                }}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(v) => Math.round(v).toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {REFERENCE_LINES.map(({ key, label, color, dash }) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray={dash}
                  dot={false}
                  name={label}
                  connectNulls
                />
              ))}

              <Line
                type="monotone"
                dataKey="size"
                stroke="#14b8a6"
                strokeWidth={3}
                name="Patient"
                connectNulls
                activeDot={{ r: 8, stroke: "#0d9488", strokeWidth: 2, fill: "#fff" }}
                dot={{ stroke: "#0d9488", strokeWidth: 2, r: 4, fill: "#fff" }}
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
                  <p className="text-lg font-semibold text-gray-800">{chartData[0].size?.toFixed(1)} cm</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Birth Size (Estimated)</p>
                <p className="text-lg font-semibold text-gray-800">{chartData[0].size?.toFixed(1)} cm</p>
              </>
            )}
          </div>
          <div className="bg-gradient-secondary p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Current Size</p>
            <p className="text-lg font-semibold text-gray-800">
              {[...chartData].reverse().find((d) => d.size != null)?.size?.toFixed(1)} cm
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateEstimatedBirthSizeFromMeasurements(measurements: Measurement[], birthDate: Date): number {
  if (measurements.length === 0) return 35
  const sorted = [...measurements].sort((a, b) => a.date.getTime() - b.date.getTime())
  const earliest = sorted[0]
  const ageInMonths = differenceInMonths(earliest.date, birthDate)
  const sizeDifference = earliest.size - calculateExpectedSize(ageInMonths)
  return Math.max(calculateExpectedSize(0) + sizeDifference, 30)
}
