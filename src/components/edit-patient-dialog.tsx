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
import type { Patient, UpdatePatientData } from "@/lib/types"
import { HC_BIRTH_MIN, HC_BIRTH_MAX } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useLocalDate } from "@/i18n/use-local-date"

interface EditPatientDialogProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditPatientDialog({ patient, open, onOpenChange }: EditPatientDialogProps) {
  const [firstName, setFirstName] = useState(patient.firstName)
  const [lastName, setLastName] = useState(patient.lastName)
  const [birthDate, setBirthDate] = useState<Date>(patient.birthDate)
  const [sex, setSex] = useState<"M" | "F">(patient.sex)
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
  const { t } = useTranslation("patients")
  const { formatLong } = useLocalDate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!firstName.trim()) newErrors.firstName = t("form.firstNameRequired")
    if (!lastName.trim()) newErrors.lastName = t("form.lastNameRequired")
    if (!birthDate) newErrors.birthDate = t("form.birthDateRequired")
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const data: UpdatePatientData = {
        firstName,
        lastName,
        birthDate,
        sex,
        birthHeadCircumference: birthHeadCircumference ? parseFloat(birthHeadCircumference) : null,
      }
      await editPatient(accessToken!, patient.id, data)
      onOpenChange(false)
    } catch {
      toast.error(t("edit.saveError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>
          <DialogDescription>
            {t("edit.description", { firstName: patient.firstName, lastName: patient.lastName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-patient-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-firstName">{t("form.firstName")}</Label>
            <Input
              id="edit-firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={cn("h-12 border-gray-200", errors.firstName && "border-red-500")}
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-lastName">{t("form.lastName")}</Label>
            <Input
              id="edit-lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={cn("h-12 border-gray-200", errors.lastName && "border-red-500")}
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("form.sex")}</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSex("M")}
                className={cn(
                  "flex-1 h-12 rounded-md border text-sm font-medium transition-colors",
                  sex === "M"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {t("form.male")}
              </button>
              <button
                type="button"
                onClick={() => setSex("F")}
                className={cn(
                  "flex-1 h-12 rounded-md border text-sm font-medium transition-colors",
                  sex === "F"
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {t("form.female")}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("form.birthDate")}</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !birthDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                  {birthDate ? formatLong(birthDate) : <span>{t("pickDate", { ns: "common" })}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar value={birthDate} onChange={(date) => { setBirthDate(date); setCalendarOpen(false) }} className="rounded-md" />
              </PopoverContent>
            </Popover>
            {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-birthHeadCircumference">{t("form.birthHC")}</Label>
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
                        birthHeadCircumference: t("edit.hcRangeError", { min: HC_BIRTH_MIN, max: HC_BIRTH_MAX }),
                      }))
                    }
                  }
                }
              }}
              className="h-12 border-gray-200"
              placeholder={t("form.birthHCPlaceholder")}
            />
            {errors.birthHeadCircumference && (
              <p className="text-sm text-red-500">{errors.birthHeadCircumference}</p>
            )}
          </div>
        </form>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("cancel", { ns: "common" })}
          </Button>
          <Button
            type="submit"
            form="edit-patient-form"
            disabled={isSubmitting}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? t("saving", { ns: "common" }) : t("edit.saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
