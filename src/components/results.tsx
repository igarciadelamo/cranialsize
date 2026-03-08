"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateEstimatedBirthSize, calculateExpectedSize } from "@/lib/skull-calculations"
import type { Measurement, Patient } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { differenceInDays, differenceInMonths } from "date-fns"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, ChevronRight, Ruler } from "lucide-react"

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

  const expectedSize = calculateExpectedSize(ageInMonths)
  const estimatedBirthSize = calculateEstimatedBirthSize(currentSize, ageInMonths)

  const sizeDifference = currentSize - expectedSize
  const percentile = getPercentile(currentSize, ageInMonths)

  // Save percentile to the measurement
  data.percentile = percentile

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
          <CardTitle className="text-xl font-bold text-gray-800">Measurement Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="text-lg font-semibold text-gray-800">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Measurement Date</p>
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
              <p className="text-sm text-gray-500">Age at Measurement</p>
              <p className="text-lg font-semibold text-gray-800">
                {ageInMonths} months
                <span className="text-sm font-normal text-gray-500 ml-1">({ageInDays} days)</span>
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-teal-50 p-4 rounded-xl shadow-sm"
            >
              <p className="text-sm text-gray-500">Measured Size</p>
              <p className="text-lg font-semibold text-gray-800 flex items-center">
                <Ruler className="h-4 w-4 mr-1 text-teal-600" />
                {currentSize.toFixed(1)} cm
              </p>
            </motion.div>
          </div>

          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">Expected Size (50th percentile)</p>
              <p className="text-lg font-semibold text-gray-800">{expectedSize.toFixed(1)} cm</p>
              <p className={`text-sm ${sizeDifference >= 0 ? "text-green-600" : "text-amber-600"} flex items-center`}>
                <span className={`mr-1 ${sizeDifference >= 0 ? "text-green-600" : "text-amber-600"}`}>
                  {sizeDifference >= 0 ? "+" : ""}
                  {sizeDifference.toFixed(1)} cm
                </span>
                from expected
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="bg-white border rounded-xl p-4 shadow-sm"
            >
              {patient.birthHeadCircumference ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Birth Size (Actual)</p>
                    <p className="text-lg font-semibold text-gray-800">{patient.birthHeadCircumference.toFixed(1)} cm</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <p className="text-sm text-gray-500">Birth Size (Estimated)</p>
                    <p className="text-lg font-semibold text-gray-800">{estimatedBirthSize.toFixed(1)} cm</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Birth Size (Estimated)</p>
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
              <p className="text-sm text-gray-500">Approximate Percentile</p>
              <div className="flex items-center justify-between mt-1">
                <span className="pill-badge pill-badge-primary text-base px-3 py-1">{percentile}</span>
                <ChevronRight className="h-4 w-4 text-teal-600" />
              </div>
            </motion.div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onBack} variant="outline" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

// Helper function to determine approximate percentile
function getPercentile(size: number, ageInMonths: number): string {
  const expected = calculateExpectedSize(ageInMonths)
  const difference = size - expected

  if (difference > 2) return "Above 95th"
  if (difference > 1) return "75th-95th"
  if (difference > -1) return "25th-75th"
  if (difference > -2) return "5th-25th"
  return "Below 5th"
}
