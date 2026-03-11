import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import UserMenu from "./user-menu"

const mockNavigate = vi.fn()
const mockLogout = vi.fn()
const mockUseAuth = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}))

function renderMenu() {
  return render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    user: { name: "Isidro Garcia", email: "isidro@example.com", image: "", plan: "free" },
    logout: mockLogout,
  })
})

describe("UserMenu", () => {
  it("shows Sign In button when no user", () => {
    mockUseAuth.mockReturnValue({ user: null, logout: mockLogout })
    renderMenu()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("navigates to /auth/signin when Sign In is clicked", async () => {
    mockUseAuth.mockReturnValue({ user: null, logout: mockLogout })
    renderMenu()
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }))
    expect(mockNavigate).toHaveBeenCalledWith("/auth/signin")
  })

  it("shows user initials in avatar when logged in", () => {
    renderMenu()
    expect(screen.getByText("IG")).toBeInTheDocument()
  })

  it("shows 'U' as initials when user has no name", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "", email: "test@example.com", image: "", plan: "free" },
      logout: mockLogout,
    })
    renderMenu()
    expect(screen.getByText("U")).toBeInTheDocument()
  })

  it("opens dropdown and shows user name and email", async () => {
    renderMenu()
    await userEvent.click(screen.getByRole("button"))
    expect(screen.getByText("Isidro Garcia")).toBeInTheDocument()
    expect(screen.getByText("isidro@example.com")).toBeInTheDocument()
  })

  it("navigates to /settings when Settings is clicked", async () => {
    renderMenu()
    await userEvent.click(screen.getByRole("button"))
    await userEvent.click(screen.getByText(/settings/i))
    expect(mockNavigate).toHaveBeenCalledWith("/settings")
  })

  it("calls logout when Sign out is clicked", async () => {
    renderMenu()
    await userEvent.click(screen.getByRole("button"))
    await userEvent.click(screen.getByText(/sign out/i))
    await waitFor(() => expect(mockLogout).toHaveBeenCalledOnce(), { timeout: 1000 })
  })
})
