import { Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./lib/auth-context"
import SignIn from "./pages/SignIn"
import Home from "./pages/Home"
import Settings from "./pages/Settings"
import AuthError from "./pages/AuthError"

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/error" element={<AuthError />} />
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
