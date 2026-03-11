import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Settings from "./Settings"

vi.mock("@/components/app-header", () => ({
  default: () => <div data-testid="app-header" />,
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

const mockUseAuth = vi.fn()
vi.mock("@/lib/auth-context", () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}))

function renderSettings() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({
    user: { name: "Isidro Garcia", email: "isidro@example.com", image: "", plan: "free" },
  })
})

describe("Settings", () => {
  it("renders nothing when user is null", () => {
    mockUseAuth.mockReturnValue({ user: null })
    const { container } = renderSettings()
    expect(container).toBeEmptyDOMElement()
  })

  it("shows user name", () => {
    renderSettings()
    expect(screen.getByText("Isidro Garcia")).toBeInTheDocument()
  })

  it("shows user email", () => {
    renderSettings()
    expect(screen.getByText("isidro@example.com")).toBeInTheDocument()
  })

  it("shows user initials in avatar fallback", () => {
    renderSettings()
    expect(screen.getByText("IG")).toBeInTheDocument()
  })

  it("shows 'U' as initials when user has no name", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "", email: "test@example.com", image: "", plan: "free" },
    })
    renderSettings()
    expect(screen.getByText("U")).toBeInTheDocument()
  })

  it("shows 'Free Plan' for free plan users", () => {
    renderSettings()
    expect(screen.getByText("Free Plan")).toBeInTheDocument()
  })

  it("shows 'Premium Plan' for premium plan users", () => {
    mockUseAuth.mockReturnValue({
      user: { name: "Isidro Garcia", email: "isidro@example.com", image: "", plan: "premium" },
    })
    renderSettings()
    expect(screen.getByText("Premium Plan")).toBeInTheDocument()
  })

  it("shows Google Account badge", () => {
    renderSettings()
    expect(screen.getByText("Google Account")).toBeInTheDocument()
  })

  it("shows Active status", () => {
    renderSettings()
    expect(screen.getByText("Active")).toBeInTheDocument()
  })
})
