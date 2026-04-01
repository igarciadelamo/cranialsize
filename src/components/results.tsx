import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { referenceService } from "@/lib/api-service"
import { calculateEstimatedBirthSize } from "@/lib/skull-calculations"
import type { Measurement, Patient } from "@/lib/types"
import { differenceInDays, differenceInMonths } from "date-fns"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ArrowLeft, Calendar, Ruler } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocalDate } from "@/i18n/use-local-date"

interface ResultsProps {
  patient: Patient
  data: Measurement
  onBack: () => void
}

export default function Results({ patient, data, onBack }: ResultsProps) {
  const { birthDate } = patient
  const { date: measurementDate, size: currentSize } = data

  const ageInDays = differenceInDays(measurementDate, birthDate)
  const ageInMonths = differenceInMonths(measurementDate, birthDate)

  const [p50, setP50] = useState<number | null>(null)

  const { t } = useTranslation("measurements")
  const { formatDate } = useLocalDate()

  useEffect(() => {
    referenceService.getHeadCircumferenceCurves(patient.sex)
      .then((curves) => {
        const point = curves.find((c) => c.month === ageInMonths)
        setP50(point?.p50 ?? null)
      })
      .catch(() => {})
  }, [patient.sex, ageInMonths])

  const estimatedBirthSize = calculateEstimatedBirthSize(currentSize, ageInMonths)
  const sizeDifference = p50 != null ? currentSize - p50 : null
  const percentile = data.percentile

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-2 bg-gradient-primary"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">{t("results.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">{t("results.patient")}</p>
                <p className="text-lg font-semibold text-gray-800">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{t("results.measurementDate")}</p>
                <p className="text-base text-gray-700 flex items-center justify-end">
                  <Calendar className="h-4 w-4 mr-1 text-teal-600" />
                  {formatDate(measurementDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="bg-teal-50 p-4 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-500">{t("results.ageAtMeasurement")}</p>
              <p className="text-lg font-semibold text-gray-800">
                {t("results.ageMonths", { months: ageInMonths })}{" "}
                <span className="text-sm font-normal text-gray-500">{t("results.ageDays", { days: ageInDays })}</span>
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-teal-50 p-4 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-500">{t("results.measuredSize")}</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <Ruler className="h-4 w-4 mr-1 text-teal-600" />
                {currentSize.toFixed(1)} cm
              </p>
            </motion.div>
          </div>

          <div className="space-y-3">
            {p50 != null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <p className="text-sm text-gray-500">{t("results.expectedSize")}</p>
                <p className="text-lg font-semibold text-gray-800">{p50.toFixed(1)} cm</p>
                {sizeDifference != null && (
                  <p className={`text-sm ${sizeDifference >= 0 ? "text-green-600" : "text-amber-600"} flex items-center`}>
                    {t("results.fromExpected", {
                      diff: `${sizeDifference >= 0 ? "+" : ""}${sizeDifference.toFixed(1)}`,
                    })}
                  </p>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              {patient.birthHeadCircumference ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t("results.birthSizeActual")}</p>
                    <p className="text-lg font-semibold text-gray-800">{patient.birthHeadCircumference.toFixed(1)} cm</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <p className="text-sm text-gray-500">{t("results.birthSizeEstimated")}</p>
                    <p className="text-lg font-semibold text-gray-800">{estimatedBirthSize.toFixed(1)} cm</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">{t("results.birthSizeEstimated")}</p>
                  <p className="text-lg font-semibold text-gray-800">{estimatedBirthSize.toFixed(1)} cm</p>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{t("results.percentile")}</p>
              {percentile ? (
                <span className="pill-badge pill-badge-primary text-base px-3 py-1 mt-1 inline-block">{percentile}</span>
              ) : (
                <p className="text-sm text-gray-400 mt-1">{t("results.percentileNA")}</p>
              )}
            </motion.div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("results.backToPatient")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
