"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AuthError() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred")

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setErrorMessage("You do not have access to this resource.")
          break
        case "Verification":
          setErrorMessage("The verification link may have been expired or already used.")
          break
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth sign-in process.")
          break
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.")
          break
        case "OAuthCreateAccount":
          setErrorMessage("Could not create OAuth provider user in the database.")
          break
        case "EmailCreateAccount":
          setErrorMessage("Could not create email provider user in the database.")
          break
        case "Callback":
          setErrorMessage("Error in the OAuth callback handler.")
          break
        case "OAuthAccountNotLinked":
          setErrorMessage("The email on the account is already linked, but not with this OAuth account.")
          break
        case "EmailSignin":
          setErrorMessage("The e-mail could not be sent.")
          break
        case "CredentialsSignin":
          setErrorMessage("The sign in attempt failed. Check the details you provided are correct.")
          break
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page.")
          break
        default:
          setErrorMessage(`An unexpected error occurred. Please try again.`)
          break
      }
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <p className="text-gray-500 mb-4">Please try again or contact support if the problem persists.</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/auth/signin")}>
            Back to Sign In
          </Button>
          <Button onClick={() => router.push("/")} className="bg-teal-600 hover:bg-teal-700">
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
