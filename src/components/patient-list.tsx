import { useState, useEffect } from "react"
import { Search, Plus, Calendar, User, ArrowUpDown, Pencil, Trash2, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import EditPatientDialog from "@/components/edit-patient-dialog"
import { usePatientStore } from "@/lib/patient-store"
import { useAuth } from "@/lib/auth-context"
import type { Patient } from "@/lib/types"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useLocalDate } from "@/i18n/use-local-date"

interface PatientListProps {
  onPatientSelect: (patient: Patient) => void
  onAddNewPatient: () => void
}

export default function PatientList({ onPatientSelect, onAddNewPatient }: PatientListProps) {
  const { patients, isLoading, deletePatient } = usePatientStore()
  const { accessToken, user } = useAuth()
  const isFree = user?.plan === "free"
  const atLimit = isFree && (user?.patientCount ?? 0) >= 10
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"name" | "age" | "birthDate" | "records">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])

  const { t } = useTranslation("patients")
  const { formatDate, calculateAge } = useLocalDate()

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const nameTiebreak = (a: Patient, b: Patient) =>
      `${a.firstName} ${a.lastName}`.toLowerCase().localeCompare(`${b.firstName} ${b.lastName}`.toLowerCase())

    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortField === "age") {
        // asc = youngest first (most recent birthDate = largest timestamp)
        const diff = sortDirection === "asc"
          ? b.birthDate.getTime() - a.birthDate.getTime()
          : a.birthDate.getTime() - b.birthDate.getTime()
        return diff !== 0 ? diff : nameTiebreak(a, b)
      } else if (sortField === "birthDate") {
        // asc = earliest birthDate first (oldest patient)
        const diff = sortDirection === "asc"
          ? a.birthDate.getTime() - b.birthDate.getTime()
          : b.birthDate.getTime() - a.birthDate.getTime()
        return diff !== 0 ? diff : nameTiebreak(a, b)
      } else {
        // measurements is [] in list view — use measurementCount from API
        const countA = a.measurementCount ?? a.measurements.length
        const countB = b.measurementCount ?? b.measurements.length
        const diff = sortDirection === "asc" ? countA - countB : countB - countA
        return diff !== 0 ? diff : nameTiebreak(a, b)
      }
    })

    setFilteredPatients(sorted)
  }, [patients, searchQuery, sortField, sortDirection])

  const handleSort = (field: "name" | "age" | "birthDate" | "records") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t("list.searchPlaceholder")}
              className="pl-10 pr-4 py-2 h-12 rounded-full border-gray-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            {isFree && (
              <span className={`text-xs ${atLimit ? "text-red-500 font-medium" : "text-gray-400"}`}>
                {t("list.patientCount", { count: user?.patientCount ?? 0 })}
              </span>
            )}
            <Button
              onClick={atLimit ? undefined : onAddNewPatient}
              disabled={atLimit}
              className={atLimit
                ? "h-12 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-primary hover:opacity-90 transition-opacity h-12 rounded-full shadow-md shadow-teal-200/50"
              }
              title={atLimit ? t("list.limitReached") : undefined}
            >
              {atLimit ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {atLimit ? t("list.limitReachedButton") : t("list.newPatient")}
            </Button>
          </div>
        </div>

        <Card className="shadow-md border-0 overflow-hidden">
          <CardHeader className="bg-gradient-secondary pb-3">
            <CardTitle className="text-xl font-bold text-gray-800">{t("list.title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-500 border-b">
              <div className="col-span-4 flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                <span>{t("list.colName")}</span>
                {sortField === "name" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("age")}>
                <span>{t("list.colAge")}</span>
                {sortField === "age" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
              <div className="col-span-3 flex items-center cursor-pointer" onClick={() => handleSort("birthDate")}>
                <span>{t("list.colBirthDate")}</span>
                {sortField === "birthDate" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("records")}>
                <span>{t("list.colRecords")}</span>
                {sortField === "records" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="divide-y">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 p-4 animate-pulse">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded" />
                        <div className="h-3 w-24 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="h-4 w-16 bg-gray-200 rounded" />
                    </div>
                    <div className="col-span-3 flex items-center">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="h-6 w-16 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPatients.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="divide-y">
                {filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    variants={item}
                    className="grid grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer transition-colors card-hover-effect"
                    onClick={() => onPatientSelect(patient)}
                  >
                    <div className="col-span-4 font-medium text-gray-700 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-gray-600 flex items-center">{calculateAge(patient.birthDate)}</div>
                    <div className="col-span-3 text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(patient.birthDate)}
                    </div>
                    <div className="col-span-1 text-gray-600 flex items-center">
                      <span className="pill-badge pill-badge-primary">
                        {t("list.record", { count: patient.measurementCount ?? patient.measurements.length })}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                        onClick={(e) => { e.stopPropagation(); setPatientToEdit(patient) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                        onClick={(e) => { e.stopPropagation(); setPatientToDelete(patient) }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : searchQuery ? (
              <div className="p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t("list.noResults")}</h3>
                <p className="text-gray-500">{t("list.noResultsSearch")}</p>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-5">
                  <User className="h-8 w-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("list.emptyTitle")}</h3>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">{t("list.emptyDesc")}</p>
                <div className="flex justify-center gap-8 mb-8 text-sm text-gray-500">
                  {([1, 2, 3] as const).map((step) => (
                    <div key={step} className="flex flex-col items-center gap-2 max-w-[100px]">
                      <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-600 font-semibold flex items-center justify-center">
                        {step}
                      </div>
                      <span>{t(`list.emptyStep${step}`)}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={onAddNewPatient}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity rounded-full shadow-md shadow-teal-200/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("list.addFirstPatient")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {patientToEdit && (
        <EditPatientDialog
          patient={patientToEdit}
          open={!!patientToEdit}
          onOpenChange={(open) => !open && setPatientToEdit(null)}
        />
      )}

      <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("list.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("list.deleteDescription", {
                firstName: patientToDelete?.firstName,
                lastName: patientToDelete?.lastName,
              })}
              {isFree && (
                <span className="block mt-2 text-amber-600">
                  {t("list.deleteCountWarning")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel", { ns: "common" })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (patientToDelete && accessToken) {
                  await deletePatient(accessToken, patientToDelete.id)
                  setPatientToDelete(null)
                }
              }}
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
