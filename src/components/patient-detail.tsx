"use client"

import PatientGrowthChart from "@/components/patient-growth-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateExpectedSize } from "@/lib/skull-calculations"
import type { Measurement, Patient } from "@/lib/types"
import { calculateAge, formatDate, formatDateTime } from "@/lib/utils"
import { differenceInMonths } from "date-fns"
import { motion } from "framer-motion"
import { Calendar, Clock, Plus, Ruler, X } from "lucide-react"
import { useState } from "react"

interface PatientDetailProps {
  patient: Patient
  onBack: () => void
  onAddMeasurement: () => void
}

export default function PatientDetail({ patient, onBack, onAddMeasurement }: PatientDetailProps) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const handleMeasurementClick = (measurement: Measurement) => {
    setSelectedMeasurement(measurement)
  }

  const handleCloseDialog = () => {
    setSelectedMeasurement(null)
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="shadow-md border-0 overflow-hidden">
          <div className="h-2 bg-gradient-primary"></div>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {patient.firstName} {patient.lastName}
                </CardTitle>
                <p className="text-gray-500 mt-1">Patient ID: {patient.id}</p>
              </div>
              <Button
                onClick={onAddMeasurement}
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-sm shadow-teal-200/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Measurement
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Age</p>
                <p className="text-xl font-semibold text-gray-800">{calculateAge(patient.birthDate)}</p>
              </div>
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Birth Date</p>
                <p className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                  {formatDate(patient.birthDate)}
                </p>
              </div>
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">Measurements</p>
                <p className="text-xl font-semibold text-gray-800">
                  {patient.measurements.length} {patient.measurements.length === 1 ? "record" : "records"}
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="measurements">Measurement History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <PatientGrowthChart patient={patient} />
              </TabsContent>
              <TabsContent value="measurements" className="space-y-4">
                {patient.measurements.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-500 border-b">
                      <div className="col-span-3">Date</div>
                      <div className="col-span-3">Age at Measure</div>
                      <div className="col-span-3">Measurement</div>
                      <div className="col-span-3">Percentile</div>
                    </div>

                    <div className="divide-y">
                      {patient.measurements.map((measurement, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleMeasurementClick(measurement)}
                        >
                          <div className="col-span-3 text-gray-600">{formatDate(measurement.date)}</div>
                          <div className="col-span-3 text-gray-600">
                            {calculateAge(patient.birthDate, measurement.date)}
                          </div>
                          <div className="col-span-3 text-gray-700 font-medium flex items-center">
                            <Ruler className="h-4 w-4 mr-2 text-teal-600" />
                            {measurement.size.toFixed(1)} cm
                          </div>
                          <div className="col-span-3 text-gray-600">
                            <span className="pill-badge pill-badge-primary">
                              {measurement.percentile || "25th-75th"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-xl p-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Ruler className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No measurements recorded yet</h3>
                    <p className="text-gray-500 mb-4">Add the first measurement to start tracking growth</p>
                    <Button onClick={onAddMeasurement} className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Measurement
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={onBack} className="w-full">
              Back to Patient List
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Measurement Detail Dialog */}
      <Dialog open={!!selectedMeasurement} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Measurement Details</DialogTitle>
            <DialogDescription>
              Detailed information about the measurement taken on{" "}
              {selectedMeasurement && formatDate(selectedMeasurement.date)}.
            </DialogDescription>
          </DialogHeader>

          {selectedMeasurement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-secondary p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Measurement Date</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-teal-600" />
                    {formatDate(selectedMeasurement.date)}
                  </p>
                </div>
                <div className="bg-gradient-secondary p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Time Recorded</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-teal-600" />
                    {formatDateTime(selectedMeasurement.date)}
                  </p>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Measurement</p>
                    <p className="text-lg font-semibold text-gray-800 flex items-center">
                      <Ruler className="h-4 w-4 mr-1 text-teal-600" />
                      {selectedMeasurement.size.toFixed(1)} cm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Percentile</p>
                    <p className="text-sm font-medium">
                      <span className="pill-badge pill-badge-primary">
                        {selectedMeasurement.percentile || "25th-75th"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Analysis</p>
                <div className="bg-white border p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Age at Measurement:</span>
                    <span className="font-medium">{calculateAge(patient.birthDate, selectedMeasurement.date)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected Size (50th percentile):</span>
                    <span className="font-medium">
                      {calculateExpectedSize(differenceInMonths(selectedMeasurement.date, patient.birthDate)).toFixed(
                        1,
                      )}{" "}
                      cm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Difference from Expected:</span>
                    <span
                      className={
                        selectedMeasurement.size -
                          calculateExpectedSize(differenceInMonths(selectedMeasurement.date, patient.birthDate)) >=
                        0
                          ? "font-medium text-green-600"
                          : "font-medium text-amber-600"
                      }
                    >
                      {(
                        selectedMeasurement.size -
                        calculateExpectedSize(differenceInMonths(selectedMeasurement.date, patient.birthDate))
                      ).toFixed(1)}{" "}
                      cm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
