"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePatientStore } from "@/lib/patient-store"
import type { Measurement, Patient } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Ruler } from "lucide-react"
import { useState } from "react"

interface SkullMeasurementFormProps {
  patient: Patient
  onSubmit: (data: Measurement) => void
  onCancel: () => void
}

export default function SkullMeasurementForm({ patient, onSubmit, onCancel }: SkullMeasurementFormProps) {
  const [measurementDate, setMeasurementDate] = useState<Date>(new Date())
  const [currentSize, setCurrentSize] = useState("")
  const [errors, setErrors] = useState<{
    currentSize?: string
  }>({})

  const { addMeasurement } = usePatientStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {
      currentSize?: string
    } = {}

    const value = currentSize.trim()
    const numValue = parseFloat(value)

    if (!value || isNaN(numValue) || numValue <= 0 || numValue > 100) {
      newErrors.currentSize = "Please enter a valid measurement between 0 and 100 cm"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const newMeasurement: Measurement = {
        date: measurementDate,
        size: numValue,
      }

      addMeasurement(patient.id, newMeasurement)
      onSubmit(newMeasurement)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-2 bg-gradient-primary"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            New Measurement for {patient.firstName} {patient.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="measurement-form" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="measurementDate">Measurement Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !measurementDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                    {measurementDate ? format(measurementDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    value={measurementDate}
                    onChange={setMeasurementDate}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSize" className="flex items-center">
                <Ruler className="h-4 w-4 mr-2 text-teal-600" />
                Skull Circumference (cm)
              </Label>
              <div className="relative">
                <Input
                  id="currentSize"
                  type="text"
                  inputMode="decimal"
                  value={currentSize}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      const numValue = value === "" ? 0 : parseFloat(value);
                      if (value === "" || (numValue >= 0 && numValue <= 100)) {
                        setCurrentSize(value);
                        setErrors({});
                      }
                    }
                  }}
                  className="h-12 border-gray-200 text-gray-900"
                  placeholder="e.g. 35.0"
                />
              </div>
              {errors.currentSize && <p className="text-sm text-red-500">{errors.currentSize}</p>}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Measurement Tips</h4>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>Measure at the widest part of the head</li>
                <li>Use a flexible measuring tape</li>
                <li>Ensure the tape is snug but not tight</li>
                <li>Record to the nearest 0.1 cm</li>
              </ul>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="measurement-form"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Save Measurement
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
