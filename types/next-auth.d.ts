import { UserResponse } from '@/lib/api-service'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      plan: 'free' | 'premium'
      createdAt: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    plan: 'free' | 'premium'
    createdAt: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan: 'free' | 'premium'
    createdAt: string
    picture?: string
  }
}

// Extend the Account type to include our custom userData
declare module 'next-auth' {
  interface Account {
    userData?: UserResponse
  }
} 