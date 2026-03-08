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

export interface PatientResponse {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  birthDate: string
  birthHeadCircumference: number | null
  createdAt: string
}

export interface CreatePatientPayload {
  firstName: string
  lastName: string
  birthDate: string
  birthHeadCircumference?: number
}

async function apiFetch<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json()
}

export const patientService = {
  async getAll(token: string): Promise<PatientResponse[]> {
    return apiFetch("/patients/", token)
  },

  async create(token: string, payload: CreatePatientPayload): Promise<PatientResponse> {
    return apiFetch("/patients/", token, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
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
