import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HC_GENERAL_MIN, HC_GENERAL_MAX } from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"
import { usePatientStore } from "@/lib/patient-store"
import type { Measurement, Patient } from "@/lib/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Ruler } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useLocalDate } from "@/i18n/use-local-date"

interface SkullMeasurementFormProps {
  patient: Patient
  onSubmit: (data: Measurement) => void
  onCancel: () => void
}

export default function SkullMeasurementForm({ patient, onSubmit, onCancel }: SkullMeasurementFormProps) {
  const [measurementDate, setMeasurementDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [currentSize, setCurrentSize] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ currentSize?: string }>({})

  const { accessToken } = useAuth()
  const { addMeasurement } = usePatientStore()
  const { t } = useTranslation("measurements")
  const { formatLong } = useLocalDate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const value = currentSize.trim()
    const numValue = parseFloat(value)

    if (!value || isNaN(numValue) || numValue <= HC_GENERAL_MIN || numValue > HC_GENERAL_MAX) {
      setErrors({ currentSize: t("form.rangeError", { min: HC_GENERAL_MIN, max: HC_GENERAL_MAX }) })
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const newMeasurement: Measurement = {
        date: measurementDate,
        size: numValue,
      }

      await addMeasurement(accessToken!, patient.id, newMeasurement)
      onSubmit(newMeasurement)
    } catch {
      toast.error(t("form.saveError"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-md border-0 overflow-hidden">
        <div className="h-2 bg-gradient-primary"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            {t("form.title", { firstName: patient.firstName, lastName: patient.lastName })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="measurement-form" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="measurementDate">{t("form.measurementDate")}</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !measurementDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                    {measurementDate ? formatLong(measurementDate) : <span>{t("pickDate", { ns: "common" })}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    value={measurementDate}
                    onChange={(date) => { setMeasurementDate(date); setCalendarOpen(false) }}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSize" className="flex items-center">
                <Ruler className="h-4 w-4 mr-2 text-teal-600" />
                {t("form.skullCircumference")}
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
                      if (value === "" || (numValue >= HC_GENERAL_MIN && numValue <= HC_GENERAL_MAX)) {
                        setCurrentSize(value);
                        setErrors({});
                      }
                    }
                  }}
                  className="h-12 border-gray-200 text-gray-900"
                  placeholder={t("form.placeholder")}
                />
              </div>
              {errors.currentSize && <p className="text-sm text-red-500">{errors.currentSize}</p>}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-1">{t("form.tipsTitle")}</h4>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>{t("form.tip1")}</li>
                <li>{t("form.tip2")}</li>
                <li>{t("form.tip3")}</li>
                <li>{t("form.tip4")}</li>
              </ul>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("cancel", { ns: "common" })}
          </Button>
          <Button
            type="submit"
            form="measurement-form"
            disabled={isSubmitting}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? t("saving", { ns: "common" }) : t("form.saveMeasurement")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
