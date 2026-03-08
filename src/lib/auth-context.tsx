import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { userService, type UserResponse } from "./api-service"

export interface User {
  id: string
  name: string
  email: string
  image: string
  plan: "free" | "premium"
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (idToken: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

const STORAGE_KEY = "cranialsize_user"
const TOKEN_KEY = "cranialsize_token"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
        setAccessToken(storedToken)
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(TOKEN_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (idToken: string) => {
    const data: UserResponse = await userService.doLogin(idToken)

    const userData: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      image: data.picture,
      plan: data.plan,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    localStorage.setItem(TOKEN_KEY, data.token)
    setUser(userData)
    setAccessToken(data.token)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
