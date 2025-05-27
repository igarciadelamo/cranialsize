import { userService } from "@/lib/api-service"
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          const userData = await userService.doLogin(account.id_token)
          account.userData = userData
          return true
        } catch (error) {
          console.error("Error in login process:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.userData) {
        // Usamos los datos del backend
        token.id = account.userData.id
        token.plan = account.userData.plan
        token.createdAt = account.userData.createdAt
        token.picture = account.userData.picture // Usamos picture en lugar de image
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.plan = token.plan as 'free' | 'premium'
        session.user.createdAt = token.createdAt as string
        session.user.image = token.picture as string // Usamos picture en lugar de image
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
