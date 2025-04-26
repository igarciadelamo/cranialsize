"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Calendar, User, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePatientStore } from "@/lib/patient-store"
import type { Patient } from "@/lib/types"
import { formatDate, calculateAge } from "@/lib/utils"
import { motion } from "framer-motion"

interface PatientListProps {
  onPatientSelect: (patient: Patient) => void
  onAddNewPatient: () => void
}

export default function PatientList({ onPatientSelect, onAddNewPatient }: PatientListProps) {
  const { patients } = usePatientStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<"name" | "age" | "records">("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])

  useEffect(() => {
    // Filter patients based on search query
    const filtered = patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    // Sort patients based on sort field and direction
    const sorted = [...filtered].sort((a, b) => {
      if (sortField === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortField === "age") {
        return sortDirection === "asc"
          ? a.birthDate.getTime() - b.birthDate.getTime()
          : b.birthDate.getTime() - a.birthDate.getTime()
      } else {
        // records
        return sortDirection === "asc"
          ? a.measurements.length - b.measurements.length
          : b.measurements.length - a.measurements.length
      }
    })

    setFilteredPatients(sorted)
  }, [patients, searchQuery, sortField, sortDirection])

  const handleSort = (field: "name" | "age" | "records") => {
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
              placeholder="Search patients by name..."
              className="pl-10 pr-4 py-2 h-12 rounded-full border-gray-200 focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={onAddNewPatient}
            className="bg-gradient-primary hover:opacity-90 transition-opacity h-12 rounded-full shadow-md shadow-teal-200/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        </div>

        <Card className="shadow-md border-0 overflow-hidden">
          <CardHeader className="bg-gradient-secondary pb-3">
            <CardTitle className="text-xl font-bold text-gray-800">Patient Registry</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 bg-gray-50 p-4 text-sm font-medium text-gray-500 border-b">
              <div className="col-span-5 flex items-center cursor-pointer" onClick={() => handleSort("name")}>
                <span>Patient Name</span>
                {sortField === "name" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("age")}>
                <span>Age</span>
                {sortField === "age" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
              <div className="col-span-3 flex items-center cursor-pointer">
                <span>Birth Date</span>
              </div>
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort("records")}>
                <span>Records</span>
                {sortField === "records" && (
                  <ArrowUpDown
                    className={`ml-1 h-3 w-3 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                  />
                )}
              </div>
            </div>

            {filteredPatients.length > 0 ? (
              <motion.div variants={container} initial="hidden" animate="show" className="divide-y">
                {filteredPatients.map((patient) => (
                  <motion.div
                    key={patient.id}
                    variants={item}
                    className="grid grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer transition-colors card-hover-effect"
                    onClick={() => onPatientSelect(patient)}
                  >
                    <div className="col-span-5 font-medium text-gray-700 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{patient.id}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-gray-600 flex items-center">{calculateAge(patient.birthDate)}</div>
                    <div className="col-span-3 text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {formatDate(patient.birthDate)}
                    </div>
                    <div className="col-span-2 text-gray-600 flex items-center">
                      <span className="pill-badge pill-badge-primary">
                        {patient.measurements.length} {patient.measurements.length === 1 ? "record" : "records"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
                <p className="text-gray-500">
                  {searchQuery ? "Try adjusting your search query" : "Add your first patient to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={onAddNewPatient} className="mt-4 bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
