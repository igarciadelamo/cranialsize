import { GoogleLogin } from "@react-oauth/google"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export default function SignIn() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation("auth")

  useEffect(() => {
    if (user) navigate("/")
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <div className="text-center md:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 flex justify-center md:justify-start"
            >
              <div className="relative">
                <img src="/cranialsize-logo.png" alt="CranialSize Logo" className="h-24 w-auto animate-float" />
                <div className="absolute -z-10 inset-0 bg-teal-200 rounded-full blur-2xl opacity-20"></div>
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              {t("header.appName")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg text-gray-600 mb-6"
            >
              {t("signIn.tagline")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="hidden md:block"
            >
              <div className="flex space-x-4 mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                      <path d="M12 12 2.1 9.1a10 10 0 0 0 9.8 12.9L12 12Z" />
                      <path d="M12 12v10a10 10 0 0 0 10-10h-10Z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{t("signIn.trackGrowth")}</p>
                    <p className="text-sm text-gray-500">{t("signIn.trackGrowthDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{t("signIn.patientRecords")}</p>
                    <p className="text-sm text-gray-500">{t("signIn.patientRecordsDesc")}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0 overflow-hidden">
            <div className="h-2 bg-gradient-primary"></div>
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-2xl font-bold text-center">{t("signIn.title")}</CardTitle>
            </CardHeader>
            <CardContent className="pb-6 space-y-6">
              <p className="text-center text-gray-500">{t("signIn.subtitle")}</p>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(response) => {
                    if (response.credential) {
                      login(response.credential).then(() => navigate("/"))
                    }
                  }}
                  onError={() => console.error("Google login failed")}
                  theme="outline"
                  size="large"
                  width="320"
                  text="signin_with"
                />
              </div>

              <div className="pt-4">
                <p className="text-xs text-center text-gray-500">
                  {t("signIn.terms")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
