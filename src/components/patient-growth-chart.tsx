import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { referenceService, type ReferencePoint } from "@/lib/api-service"
import { calculateExpectedSize } from "@/lib/skull-calculations"
import type { Measurement, Patient } from "@/lib/types"
import { differenceInDays, format } from "date-fns"
import { useEffect, useMemo, useState, type FC } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const DAYS_PER_MONTH = 365.25 / 12

function decimalMonths(date: Date, birthDate: Date): number {
  return differenceInDays(date, birthDate) / DAYS_PER_MONTH
}

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
  if (!active || !payload) return null
  const point = payload.find((p: any) => p.dataKey === "size")
  if (!point?.payload?.size) return null
  const data = point.payload

  return (
    <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
      <div className="space-y-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-gray-500">Age</span>
          <span className="font-bold text-gray-700">
            {data.ageInMonths.toFixed(1)} months
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-gray-500">Size</span>
          <span className="font-bold text-gray-700">{data.size.toFixed(1)} cm</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-gray-500">Date</span>
          <span className="font-bold text-gray-700">{data.date}</span>
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

  const { patientData, estimatedBirthSize, clampedMaxAge, ticks } = useMemo(() => {
    const sorted = [...patient.measurements].sort((a, b) => a.date.getTime() - b.date.getTime())

    const estimatedBirthSize =
      sorted.length > 0
        ? calculateEstimatedBirthSizeFromMeasurements(sorted, patient.birthDate)
        : 35

    const birthPoint = patient.birthHeadCircumference
      ? [{ ageInMonths: 0, size: patient.birthHeadCircumference, date: format(patient.birthDate, "MMM d, yyyy") }]
      : []

    const patientData = [
      ...birthPoint,
      ...sorted.map((m) => ({
        ageInMonths: decimalMonths(m.date, patient.birthDate),
        size: m.size,
        date: format(m.date, "MMM d, yyyy"),
      })),
    ]

    const patientAgeNow = decimalMonths(new Date(), patient.birthDate)
    const lastMeasurementAge = patientData.length > 1 ? patientData[patientData.length - 1].ageInMonths : 0
    const clampedMaxAge = Math.ceil(Math.max(lastMeasurementAge, patientAgeNow, 6)) + 2
    const ticks = Array.from({ length: clampedMaxAge + 1 }, (_, i) => i)

    return { patientData, estimatedBirthSize, clampedMaxAge, ticks }
  }, [patient])

  const referenceData = useMemo(
    () => referenceCurves
      .filter((r) => r.month <= clampedMaxAge)
      .map((r) => ({ ageInMonths: r.month, p3: r.p3, p15: r.p15, p50: r.p50, p85: r.p85, p97: r.p97 })),
    [referenceCurves, clampedMaxAge]
  )

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
            <LineChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
                  data={referenceData}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray={dash}
                  dot={false}
                  name={label}
                />
              ))}

              <Line
                data={patientData}
                type="monotone"
                dataKey="size"
                stroke="#14b8a6"
                strokeWidth={3}
                name="Patient"
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
                  <p className="text-lg font-semibold text-gray-800">{estimatedBirthSize.toFixed(1)} cm</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Birth Size (Estimated)</p>
                <p className="text-lg font-semibold text-gray-800">{estimatedBirthSize.toFixed(1)} cm</p>
              </>
            )}
          </div>
          <div className="bg-gradient-secondary p-3 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Current Size</p>
            <p className="text-lg font-semibold text-gray-800">
              {patientData[patientData.length - 1].size.toFixed(1)} cm
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function calculateEstimatedBirthSizeFromMeasurements(measurements: Measurement[], birthDate: Date): number {
  const sorted = [...measurements].sort((a, b) => a.date.getTime() - b.date.getTime())
  const earliest = sorted[0]
  const ageInMonths = decimalMonths(earliest.date, birthDate)
  const sizeDifference = earliest.size - calculateExpectedSize(ageInMonths)
  return Math.max(calculateExpectedSize(0) + sizeDifference, 30)
}
