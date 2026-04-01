import EditMeasurementDialog from "@/components/edit-measurement-dialog"
import PatientGrowthChart from "@/components/patient-growth-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Measurement, Patient } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { usePatientStore } from "@/lib/patient-store"
import { motion } from "framer-motion"
import { Calendar, Pencil, Plus, Ruler, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocalDate } from "@/i18n/use-local-date"

interface PatientDetailProps {
  patient: Patient
  onBack: () => void
  onAddMeasurement: () => void
}

export default function PatientDetail({ patient: patientProp, onBack, onAddMeasurement }: PatientDetailProps) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const { accessToken } = useAuth()
  const { patients, loadMeasurements, isMeasurementsLoading, deleteMeasurement } = usePatientStore()
  const patient = patients.find((p) => p.id === patientProp.id) ?? patientProp

  const { t } = useTranslation("patients")
  const { formatDate, calculateAge } = useLocalDate()

  useEffect(() => {
    if (accessToken) {
      loadMeasurements(accessToken, patientProp.id)
    }
  }, [patientProp.id, accessToken])

  const handleDeleteMeasurement = async () => {
    if (!selectedMeasurement?.id || !accessToken) return
    await deleteMeasurement(accessToken, patient.id, selectedMeasurement.id)
    setShowDeleteConfirm(false)
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
              </div>
              <Button
                onClick={onAddMeasurement}
                className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-sm shadow-teal-200/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("detail.newMeasurement")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">{t("detail.age")}</p>
                <p className="text-xl font-semibold text-gray-800">{calculateAge(patient.birthDate)}</p>
              </div>
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">{t("detail.birthDate")}</p>
                <p className="text-xl font-semibold text-gray-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                  {formatDate(patient.birthDate)}
                </p>
              </div>
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">{t("detail.sex")}</p>
                <p className="text-xl font-semibold text-gray-800">
                  {patient.sex === "M" ? t("detail.sexMale") : t("detail.sexFemale")}
                </p>
              </div>
              <div className="bg-gradient-secondary p-4 rounded-xl shadow-sm">
                <p className="text-sm text-gray-500">{t("detail.measurements")}</p>
                <p className="text-xl font-semibold text-gray-800">
                  {t("detail.record", { count: patient.measurements.length })}
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">{t("detail.tabOverview")}</TabsTrigger>
                <TabsTrigger value="measurements">{t("detail.tabHistory")}</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                {isMeasurementsLoading ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <div className="h-8 w-8 border-4 border-t-teal-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <PatientGrowthChart patient={patient} />
                )}
              </TabsContent>
              <TabsContent value="measurements" className="space-y-4">
                {isMeasurementsLoading ? (
                  <div className="space-y-2 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-12 p-4 border rounded-xl">
                        <div className="col-span-3"><div className="h-4 w-24 bg-gray-200 rounded" /></div>
                        <div className="col-span-3"><div className="h-4 w-20 bg-gray-200 rounded" /></div>
                        <div className="col-span-3"><div className="h-4 w-16 bg-gray-200 rounded" /></div>
                        <div className="col-span-3"><div className="h-4 w-20 bg-gray-200 rounded" /></div>
                      </div>
                    ))}
                  </div>
                ) : patient.measurements.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-500 border-b">
                      <div className="col-span-3">{t("detail.colDate")}</div>
                      <div className="col-span-3">{t("detail.colAgeAtMeasure")}</div>
                      <div className="col-span-3">{t("detail.colMeasurement")}</div>
                      <div className="col-span-2">{t("detail.colPercentile")}</div>
                      <div className="col-span-1"></div>
                    </div>

                    <div className="divide-y">
                      {patient.measurements.map((measurement, index) => (
                        <div
                          key={measurement.id ?? index}
                          className="grid grid-cols-12 p-4 hover:bg-gray-50 transition-colors items-center"
                        >
                          <div className="col-span-3 text-gray-600">{formatDate(measurement.date)}</div>
                          <div className="col-span-3 text-gray-600">
                            {calculateAge(patient.birthDate, measurement.date)}
                          </div>
                          <div className="col-span-3 text-gray-700 font-medium flex items-center">
                            <Ruler className="h-4 w-4 mr-2 text-teal-600" />
                            {measurement.size.toFixed(1)} cm
                          </div>
                          <div className="col-span-2 text-gray-600">
                            <span className="pill-badge pill-badge-primary">
                              {measurement.percentile ?? "—"}
                            </span>
                          </div>
                          <div className="col-span-1 flex gap-1 justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedMeasurement(measurement); setShowEditDialog(true) }}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors"
                              aria-label="Edit measurement"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedMeasurement(measurement); setShowDeleteConfirm(true) }}
                              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Delete measurement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t("detail.noMeasurements")}</h3>
                    <p className="text-gray-500 mb-4">{t("detail.noMeasurementsDesc")}</p>
                    <Button onClick={onAddMeasurement} className="bg-teal-600 hover:bg-teal-700">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("detail.addMeasurement")}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={onBack} className="w-full">
              {t("detail.backToList")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {selectedMeasurement && (
        <EditMeasurementDialog
          patientId={patient.id}
          measurement={selectedMeasurement}
          open={showEditDialog}
          onOpenChange={(open) => { setShowEditDialog(open); if (!open) setSelectedMeasurement(null) }}
        />
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("detail.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("detail.deleteDescription", {
                date: selectedMeasurement ? formatDate(selectedMeasurement.date) : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel", { ns: "common" })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeasurement}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete", { ns: "common" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
