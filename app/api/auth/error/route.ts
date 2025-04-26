import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error") || "unknown"

  // Redirect to our custom error page with the error parameter
  return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url))
}
