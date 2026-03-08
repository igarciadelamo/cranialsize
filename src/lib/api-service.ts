const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export interface UserResponse {
  id: string
  name: string
  email: string
  picture: string
  plan: "free" | "premium"
  createdAt: string
  token: string
}

export const userService = {
  async doLogin(idToken: string): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    })

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  },
}
