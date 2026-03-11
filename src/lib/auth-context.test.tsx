import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider, useAuth } from "./auth-context"

vi.mock("./api-service", () => ({
  userService: { doLogin: vi.fn() },
}))

function TestConsumer() {
  const { user, accessToken, isLoading, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="user">{user?.name ?? "no user"}</span>
      <span data-testid="token">{accessToken ?? "no token"}</span>
      <button onClick={() => login("test-token")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe("AuthProvider", () => {
  it("starts in loading state then becomes ready", async () => {
    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready")
    })
  })

  it("starts with no user when localStorage is empty", async () => {
    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no user")
    })
  })

  it("restores user and token from localStorage on mount", async () => {
    localStorage.setItem(
      "cranialsize_user",
      JSON.stringify({ name: "John Doe", email: "john@test.com", image: "", plan: "free" })
    )
    localStorage.setItem("cranialsize_token", "saved-token")

    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("John Doe")
      expect(screen.getByTestId("token")).toHaveTextContent("saved-token")
    })
  })

  it("handles corrupted localStorage gracefully", async () => {
    localStorage.setItem("cranialsize_user", "{{invalid-json")
    localStorage.setItem("cranialsize_token", "some-token")

    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no user")
    })
    expect(localStorage.getItem("cranialsize_user")).toBeNull()
  })

  it("login stores user and token in state and localStorage", async () => {
    const { userService } = await import("./api-service")
    vi.mocked(userService.doLogin).mockResolvedValueOnce({
      name: "Jane Doe",
      email: "jane@test.com",
      picture: "https://example.com/avatar.jpg",
      plan: "free",
      token: "new-token",
    })

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("ready"))
    await userEvent.click(screen.getByText("Login"))

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Jane Doe")
      expect(screen.getByTestId("token")).toHaveTextContent("new-token")
    })
    expect(localStorage.getItem("cranialsize_token")).toBe("new-token")
  })

  it("logout clears user, token and localStorage", async () => {
    localStorage.setItem(
      "cranialsize_user",
      JSON.stringify({ name: "John", email: "john@test.com", image: "", plan: "free" })
    )
    localStorage.setItem("cranialsize_token", "token-123")

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("John"))
    await userEvent.click(screen.getByText("Logout"))

    expect(screen.getByTestId("user")).toHaveTextContent("no user")
    expect(screen.getByTestId("token")).toHaveTextContent("no token")
    expect(localStorage.getItem("cranialsize_token")).toBeNull()
  })
})
