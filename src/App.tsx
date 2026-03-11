import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./lib/auth-context"
import { Toaster } from "@/components/ui/sonner"
import SignIn from "./pages/SignIn"
import Home from "./pages/Home"
import Settings from "./pages/Settings"

export default function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
