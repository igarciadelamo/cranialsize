"use client"

import { Button } from "@/components/ui/button"
import UserMenu from "@/components/user-menu"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ChevronLeft, Home, Menu, Users, X } from "lucide-react"
import { useEffect, useState } from "react"

interface AppHeaderProps {
  currentView: "patients" | "newPatient" | "patientDetail" | "newMeasurement" | "results" | "settings"
  onBackToPatients?: () => void
}

export default function AppHeader({ currentView, onBackToPatients }: AppHeaderProps) {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getTitle = () => {
    switch (currentView) {
      case "patients":
        return "Patient Registry"
      case "newPatient":
        return "Add New Patient"
      case "patientDetail":
        return "Patient Details"
      case "newMeasurement":
        return "New Measurement"
      case "results":
        return "Measurement Results"
      case "settings":
        return "Settings"
      default:
        return "CranialSize"
    }
  }

  const showBackButton = currentView !== "patients" && currentView !== "settings"

  return (
    <header
      className={cn(
        "sticky top-0 z-10 transition-all duration-200",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white border-b border-gray-200",
      )}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={onBackToPatients} className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-sm">
                {currentView === "patients" ? (
                  <Users className="h-5 w-5 text-white" />
                ) : (
                  <Home className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">{getTitle()}</h1>
                {currentView === "patients" && user?.name && (
                  <p className="text-sm text-gray-500 hidden md:block">Welcome back, {user.name.split(" ")[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-8 w-8 bg-teal-50 rounded-full flex items-center justify-center"
              >
                <img src="/cranialsize-logo.png" alt="CranialSize Logo" className="h-5 w-5" />
              </motion.div>
              <span className="font-medium text-teal-700">CranialSize</span>
            </div>
            <UserMenu />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="flex flex-col p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-teal-50 rounded-full flex items-center justify-center">
                    <img src="/cranialsize-logo.png" alt="CranialSize Logo" className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-teal-700">CranialSize</span>
                </div>
                <UserMenu />
              </div>
              {currentView === "patients" && user?.name && (
                <p className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                  Welcome back, {user.name.split(" ")[0]}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
