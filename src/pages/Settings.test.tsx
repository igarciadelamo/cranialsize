import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

const mockUpdateLanguagePreference = vi.fn()

function renderSettings() {
  return render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdateLanguagePreference.mockResolvedValue(undefined)
  mockUseAuth.mockReturnValue({
    user: { name: "Isidro Garcia", email: "isidro@example.com", image: "", plan: "free" },
    accessToken: "test-token",
    updateLanguagePreference: mockUpdateLanguagePreference,
  })
})

describe("Settings", () => {
  it("renders nothing when user is null", () => {
    mockUseAuth.mockReturnValue({ user: null, updateLanguagePreference: mockUpdateLanguagePreference })
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
      updateLanguagePreference: mockUpdateLanguagePreference,
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
      updateLanguagePreference: mockUpdateLanguagePreference,
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

  it("shows language selector with English and Español buttons", () => {
    renderSettings()
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument()
  })

  it("calls updateLanguagePreference with 'es' when Español is clicked", async () => {
    renderSettings()
    await userEvent.click(screen.getByRole("button", { name: "Español" }))
    await waitFor(() => {
      expect(mockUpdateLanguagePreference).toHaveBeenCalledWith("es")
    })
  })

  it("does not call updateLanguagePreference when the active language is clicked", async () => {
    renderSettings()
    await userEvent.click(screen.getByRole("button", { name: "English" }))
    expect(mockUpdateLanguagePreference).not.toHaveBeenCalled()
  })
})
