import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import SignIn from "./SignIn"

const mockNavigate = vi.fn()
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

const mockLogin = vi.fn().mockResolvedValue(undefined)
const mockUseAuth = vi.fn()
vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}))

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }: { onSuccess: (r: any) => void; onError: () => void }) => (
    <button
      onClick={() => onSuccess({ credential: "mock-id-token" })}
      data-testid="google-login"
    >
      Sign in with Google
    </button>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ login: mockLogin, user: null })
})

describe("SignIn", () => {
  it("renders the app name", () => {
    render(<SignIn />)
    expect(screen.getByText("CranialSize")).toBeInTheDocument()
  })

  it("renders the sign in heading", () => {
    render(<SignIn />)
    expect(screen.getByText(/sign in to get started/i)).toBeInTheDocument()
  })

  it("renders the Google login button", () => {
    render(<SignIn />)
    expect(screen.getByTestId("google-login")).toBeInTheDocument()
  })

  it("calls login with the credential on Google success", async () => {
    render(<SignIn />)
    screen.getByTestId("google-login").click()
    expect(mockLogin).toHaveBeenCalledWith("mock-id-token")
  })

  it("navigates to / after successful login", async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<SignIn />)
    screen.getByTestId("google-login").click()
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/")
    })
  })

  it("redirects to / if user is already logged in", () => {
    mockUseAuth.mockReturnValue({ login: mockLogin, user: { name: "Emma" } })
    render(<SignIn />)
    expect(mockNavigate).toHaveBeenCalledWith("/")
  })

  it("renders the terms and privacy notice", () => {
    render(<SignIn />)
    expect(screen.getByText(/terms of service and privacy policy/i)).toBeInTheDocument()
  })
})
