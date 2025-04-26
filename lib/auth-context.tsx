"use client"

import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { createContext, useContext, type ReactNode } from "react"

// Define user type
export interface User {
  id: string
  name: string
  email: string
  image: string
  accessToken?: string
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
})

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/auth/signin")
  }

  const user = session?.user ? {
    id: session.user.id as string,
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || "",
    accessToken: session.user.accessToken as string,
  } : null

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading",
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
