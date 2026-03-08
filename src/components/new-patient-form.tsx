"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePatientStore } from "@/lib/patient-store"
import type { Patient } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"

interface NewPatientFormProps {
  onCancel: () => void
  onComplete: (patient: Patient) => void
}

export default function NewPatientForm({ onCancel, onComplete }: NewPatientFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthDate, setBirthDate] = useState<Date>()
  const [birthHeadCircumference, setBirthHeadCircumference] = useState<string>("")
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    birthDate?: string
    birthHeadCircumference?: string
  }>({})

  const { addPatient } = usePatientStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: {
      firstName?: string
      lastName?: string
      birthDate?: string
      birthHeadCircumference?: string
    } = {}

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && birthDate) {
      const newPatient = {
        id: Date.now().toString(),
        firstName,
        lastName,
        birthDate,
        birthHeadCircumference: birthHeadCircumference ? parseFloat(birthHeadCircumference) : undefined,
        measurements: [],
      }

      addPatient(newPatient)
      onComplete(newPatient)
    }
  }

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
          <CardTitle className="text-xl font-bold text-gray-800">Add New Patient</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="new-patient-form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={cn(
                  "h-12 border-gray-200",
                  errors.firstName && "border-red-500 focus:border-red-500 focus:ring-red-200",
                )}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={cn(
                  "h-12 border-gray-200",
                  errors.lastName && "border-red-500 focus:border-red-500 focus:ring-red-200",
                )}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthHeadCircumference">Birth Head Circumference (cm) - Optional</Label>
              <Input
                id="birthHeadCircumference"
                type="text"
                inputMode="decimal"
                value={birthHeadCircumference}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setBirthHeadCircumference(value);
                    if (value === "") {
                      setErrors(prev => ({ ...prev, birthHeadCircumference: undefined }));
                    } else {
                      const numValue = parseFloat(value);
                      if (numValue >= 20 && numValue <= 50) {
                        setErrors(prev => ({ ...prev, birthHeadCircumference: undefined }));
                      } else {
                        setErrors(prev => ({ ...prev, birthHeadCircumference: "Please enter a valid measurement between 20 and 50 cm" }));
                      }
                    }
                  }
                }}
                className="h-12 border-gray-200 text-gray-900"
                placeholder="e.g. 35.0"
              />
              {errors.birthHeadCircumference && (
                <p className="text-sm text-red-500">{errors.birthHeadCircumference}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                    {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    value={birthDate}
                    onChange={setBirthDate}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
              {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-patient-form"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            Save Patient
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
