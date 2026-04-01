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
import type { Measurement } from "@/lib/types"
import { HC_GENERAL_MIN, HC_GENERAL_MAX } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useLocalDate } from "@/i18n/use-local-date"

interface EditMeasurementDialogProps {
  patientId: string
  measurement: Measurement
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EditMeasurementDialog({ patientId, measurement, open, onOpenChange }: EditMeasurementDialogProps) {
  const [date, setDate] = useState<Date>(measurement.date)
  const [size, setSize] = useState(measurement.size.toString())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ date?: string; size?: string }>({})

  const { accessToken } = useAuth()
  const { editMeasurement } = usePatientStore()
  const { t } = useTranslation("measurements")
  const { formatLong } = useLocalDate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: typeof errors = {}
    if (!date) newErrors.date = t("edit.dateRequired")
    const sizeNum = parseFloat(size)
    if (!size || isNaN(sizeNum)) {
      newErrors.size = t("edit.sizeRequired")
    } else if (sizeNum < HC_GENERAL_MIN || sizeNum > HC_GENERAL_MAX) {
      newErrors.size = t("edit.rangeError", { min: HC_GENERAL_MIN, max: HC_GENERAL_MAX })
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await editMeasurement(accessToken!, patientId, measurement.id!, { date, size: sizeNum })
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
            {t("edit.description", { date: formatLong(measurement.date) })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="edit-measurement-form" className="space-y-4">
          <div className="space-y-2">
            <Label>{t("edit.measurementDate")}</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                  {date ? formatLong(date) : <span>{t("pickDate", { ns: "common" })}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar value={date} onChange={(d) => { setDate(d); setCalendarOpen(false) }} className="rounded-md" />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-measurement-size">{t("edit.headCircumference")}</Label>
            <Input
              id="edit-measurement-size"
              type="text"
              inputMode="decimal"
              value={size}
              onChange={(e) => {
                const value = e.target.value
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setSize(value)
                  const num = parseFloat(value)
                  if (value === "" || isNaN(num)) {
                    setErrors((prev) => ({ ...prev, size: undefined }))
                  } else if (num >= HC_GENERAL_MIN && num <= HC_GENERAL_MAX) {
                    setErrors((prev) => ({ ...prev, size: undefined }))
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      size: t("edit.rangeError", { min: HC_GENERAL_MIN, max: HC_GENERAL_MAX }),
                    }))
                  }
                }
              }}
              className={cn("h-12 border-gray-200", errors.size && "border-red-500")}
              placeholder={t("edit.placeholder")}
            />
            {errors.size && <p className="text-sm text-red-500">{errors.size}</p>}
          </div>
        </form>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("cancel", { ns: "common" })}
          </Button>
          <Button
            type="submit"
            form="edit-measurement-form"
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
