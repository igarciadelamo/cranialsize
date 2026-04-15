import AppHeader from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Settings() {
  const { user, updateLanguagePreference, deleteAccount } = useAuth()
  const { t, i18n } = useTranslation("auth")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()

  if (!user) return null

  const userInitials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "U"

  const currentLang = i18n.language.startsWith("es") ? "es" : "en"

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      navigate("/signin")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLanguageChange = async (lang: string) => {
    if (lang === currentLang || isUpdating) return
    setIsUpdating(true)
    try {
      await updateLanguagePreference(lang)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <AppHeader currentView="settings" />
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <Card className="border border-gray-100 overflow-hidden">
                <div className="bg-teal-50/80 px-6 py-3 border-b border-teal-100/50">
                  <h2 className="text-sm font-medium text-teal-700">{t("settings.user")}</h2>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16 rounded-full border-2 border-gray-100">
                      <AvatarImage src={user.image} alt={user.name || ""} />
                      <AvatarFallback className="bg-teal-50 text-teal-600 text-lg">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                        <Badge variant="outline" className="text-xs font-normal bg-gray-50">
                          <FcGoogle className="mr-1 h-3 w-3" />
                          {t("settings.googleAccount")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 overflow-hidden">
                <div className="bg-teal-50/80 px-6 py-3 border-b border-teal-100/50">
                  <h2 className="text-sm font-medium text-teal-700">{t("settings.language")}</h2>
                </div>
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleLanguageChange("en")}
                      disabled={isUpdating}
                      className={cn(
                        "flex-1 h-10 rounded-md border text-sm font-medium transition-colors",
                        currentLang === "en"
                          ? "border-teal-600 bg-teal-50 text-teal-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      )}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageChange("es")}
                      disabled={isUpdating}
                      className={cn(
                        "flex-1 h-10 rounded-md border text-sm font-medium transition-colors",
                        currentLang === "es"
                          ? "border-teal-600 bg-teal-50 text-teal-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      )}
                    >
                      Español
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-100 overflow-hidden">
                <div className="bg-teal-50/80 px-6 py-3 border-b border-teal-100/50">
                  <h2 className="text-sm font-medium text-teal-700">{t("settings.plan")}</h2>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {user.plan === "premium" ? t("settings.premiumPlan") : t("settings.freePlan")}
                    </h3>
                    <span className="flex items-center text-xs text-teal-600">
                      <span className="h-1.5 w-1.5 bg-teal-500 rounded-full mr-1"></span>
                      {t("settings.active")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-red-100 overflow-hidden">
                <div className="bg-red-50/80 px-6 py-3 border-b border-red-100/50">
                  <h2 className="text-sm font-medium text-red-700">{t("settings.dangerZone")}</h2>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-600">{t("settings.deleteAccountDescription")}</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="shrink-0 px-4 h-9 rounded-md border border-red-300 text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors">
                          {t("settings.deleteAccount")}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("settings.deleteAccountConfirmTitle")}</AlertDialogTitle>
                          <AlertDialogDescription>{t("settings.deleteAccountConfirmDescription")}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("settings.deleteAccountCancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            {t("settings.deleteAccountConfirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
