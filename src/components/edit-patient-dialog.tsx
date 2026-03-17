import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/lib/auth-context"
import { usePatientStore } from "@/lib/patient-store"
import type { Patient } from "@/lib/types"
import { HC_BIRTH_MIN, HC_BIRTH_MAX } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface EditPatientDialogProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditPatientDialog({ patient, open, onOpenChange }: EditPatientDialogProps) {
  const [firstName, setFirstName] = useState(patient.firstName)
  const [lastName, setLastName] = useState(patient.lastName)
  const [birthDate, setBirthDate] = useState<Date>(patient.birthDate)
  const [birthHeadCircumference, setBirthHeadCircumference] = useState(
    patient.birthHeadCircumference?.toString() ?? ""
  )
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    birthDate?: string
    birthHeadCircumference?: string
  }>({})

  const { accessToken } = useAuth()
  const { editPatient } = usePatientStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!firstName.trim()) newErrors.firstName = "First name is required"
    if (!lastName.trim()) newErrors.lastName = "Last name is required"
    if (!birthDate) newErrors.birthDate = "Birth date is required"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await editPatient(accessToken!, patient.id, {
        firstName,
        lastName,
        birthDate,
        birthHeadCircumference: birthHeadCircumference ? parseFloat(birthHeadCircumference) : undefined,
      })
      onOpenChange(false)
    } catch {
      toast.error("Error saving patient. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>
            Update the details for {patient.firstName} {patient.lastName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-patient-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-firstName">First Name</Label>
            <Input
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={cn("h-12 border-gray-200", errors.firstName && "border-red-500")}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-lastName">Last Name</Label>
            <Input
              id="edit-lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={cn("h-12 border-gray-200", errors.lastName && "border-red-500")}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-birthHeadCircumference">Birth Head Circumference (cm) - Optional</Label>
            <Input
              id="edit-birthHeadCircumference"
              type="text"
              inputMode="decimal"
              value={birthHeadCircumference}
              onChange={(e) => {
                const value = e.target.value
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setBirthHeadCircumference(value)
                  if (value === "") {
                    setErrors((prev) => ({ ...prev, birthHeadCircumference: undefined }))
                  } else {
                    const num = parseFloat(value)
                    if (num >= HC_BIRTH_MIN && num <= HC_BIRTH_MAX) {
                      setErrors((prev) => ({ ...prev, birthHeadCircumference: undefined }))
                    } else {
                      setErrors((prev) => ({
                        ...prev,
                        birthHeadCircumference: `Please enter a value between ${HC_BIRTH_MIN} and ${HC_BIRTH_MAX} cm`,
                      }))
                    }
                  }
                }
              }}
              className="h-12 border-gray-200"
              placeholder="e.g. 35.0"
            />
            {errors.birthHeadCircumference && (
              <p className="text-sm text-red-500">{errors.birthHeadCircumference}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Birth Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !birthDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                  {birthDate ? format(birthDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar value={birthDate} onChange={(date) => { setBirthDate(date); setCalendarOpen(false) }} className="rounded-md" />
              </PopoverContent>
            </Popover>
            {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
          </div>
        </form>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-patient-form"
            disabled={isSubmitting}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
