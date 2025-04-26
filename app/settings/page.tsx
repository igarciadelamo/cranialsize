"use client"

import AppHeader from "@/components/app-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) return null

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

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
              {/* Profile Section */}
              <Card className="border border-gray-100 overflow-hidden">
                <div className="bg-teal-50/80 px-6 py-3 border-b border-teal-100/50">
                  <h2 className="text-sm font-medium text-teal-700">User</h2>
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
                          Google Account
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Section */}
              <Card className="border border-gray-100 overflow-hidden">
                <div className="bg-teal-50/80 px-6 py-3 border-b border-teal-100/50">
                  <h2 className="text-sm font-medium text-teal-700">Plan</h2>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Free Plan</h3>
                    <span className="flex items-center text-xs text-teal-600">
                      <span className="h-1.5 w-1.5 bg-teal-500 rounded-full mr-1"></span>
                      Active
                    </span>
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