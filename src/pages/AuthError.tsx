import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have access to this resource.",
  OAuthSignin: "Error in the OAuth sign-in process.",
  OAuthCallback: "Error in the OAuth callback process.",
  Callback: "Error in the OAuth callback handler.",
  LoginFailed: "Login failed. Please try again.",
}

export default function AuthError() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("An authentication error occurred")

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setErrorMessage(ERROR_MESSAGES[error] ?? "An unexpected error occurred. Please try again.")
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
          <Button variant="outline" onClick={() => navigate("/auth/signin")}>
            Back to Sign In
          </Button>
          <Button onClick={() => navigate("/")} className="bg-teal-600 hover:bg-teal-700">
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
