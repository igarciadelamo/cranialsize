"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PatientList from "@/components/patient-list"
import NewPatientForm from "@/components/new-patient-form"
import PatientDetail from "@/components/patient-detail"
import SkullMeasurementForm from "@/components/skull-measurement-form"
import Results from "@/components/results"
import AppHeader from "@/components/app-header"
import { usePatientStore } from "@/lib/patient-store"
import { useAuth } from "@/lib/auth-context"
import type { Patient, Measurement } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<
    "patients" | "newPatient" | "patientDetail" | "newMeasurement" | "results"
  >("patients")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [currentMeasurement, setCurrentMeasurement] = useState<Measurement | null>(null)

  const { patients, initializeStore } = usePatientStore()

  useEffect(() => {
    // Redirect to sign in if not authenticated and not loading
    if (!isLoading && !user) {
      router.push("/auth/signin")
    }
  }, [isLoading, user, router])

  useEffect(() => {
    // Initialize store with sample data if empty
    if (patients.length === 0 && user) {
      initializeStore()
    }
  }, [patients.length, initializeStore, user])

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentView("patientDetail")
  }

  const handleAddNewPatient = () => {
    setCurrentView("newPatient")
  }

  const handleAddMeasurement = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentView("newMeasurement")
  }

  const handleMeasurementSubmit = (measurement: Measurement) => {
    setCurrentMeasurement(measurement)
    setCurrentView("results")
  }

  const handleBackToPatients = () => {
    setCurrentView("patients")
    setSelectedPatient(null)
  }

  const handleBackToPatientDetail = () => {
    setCurrentView("patientDetail")
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 border-4 border-t-teal-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!user) {
    return null
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "patients":
        return <PatientList onPatientSelect={handlePatientSelect} onAddNewPatient={handleAddNewPatient} />

      case "newPatient":
        return <NewPatientForm onCancel={handleBackToPatients} onComplete={handlePatientSelect} />

      case "patientDetail":
        return selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            onBack={handleBackToPatients}
            onAddMeasurement={() => handleAddMeasurement(selectedPatient)}
          />
        ) : null

      case "newMeasurement":
        return selectedPatient ? (
          <SkullMeasurementForm
            patient={selectedPatient}
            onSubmit={handleMeasurementSubmit}
            onCancel={handleBackToPatientDetail}
          />
        ) : null

      case "results":
        return currentMeasurement && selectedPatient ? (
          <Results patient={selectedPatient} data={currentMeasurement} onBack={handleBackToPatientDetail} />
        ) : null

      default:
        return <PatientList onPatientSelect={handlePatientSelect} onAddNewPatient={handleAddNewPatient} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <AppHeader currentView={currentView} onBackToPatients={handleBackToPatients} />
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto max-w-7xl px-4 py-6 md:py-8"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}
