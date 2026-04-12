import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { userService, type UserResponse } from "./api-service"
import i18n from "@/i18n"

export interface User {
  name: string
  email: string
  image: string
  plan: "free" | "premium"
  languagePreference?: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (idToken: string) => Promise<void>
  logout: () => void
  updateLanguagePreference: (lang: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  updateLanguagePreference: async () => {},
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
        const parsed = JSON.parse(storedUser) as User
        setUser(parsed)
        setAccessToken(storedToken)
        if (parsed.languagePreference) {
          i18n.changeLanguage(parsed.languagePreference)
        }
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
    const data: UserResponse = await userService.doLogin(idToken, i18n.resolvedLanguage ?? "es")

    const lang = data.language_preference ?? i18n.language
    i18n.changeLanguage(lang)

    const userData: User = {
      name: data.name,
      email: data.email,
      image: data.picture,
      plan: data.plan,
      languagePreference: lang,
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

  const updateLanguagePreference = async (lang: string) => {
    if (!accessToken) return
    await userService.updateLanguagePreference(accessToken, lang)
    await i18n.changeLanguage(lang)
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, languagePreference: lang }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, updateLanguagePreference }}>
      {children}
    </AuthContext.Provider>
  )
}
