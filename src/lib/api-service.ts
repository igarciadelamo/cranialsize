const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export interface UserResponse {
  name: string
  email: string
  picture: string
  plan: "free" | "premium"
  token: string
}

export interface PatientResponse {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  birthDate: string
  sex: string
  birthHeadCircumference: number | null
  createdAt: string
  measurementCount: number
}

export interface CreatePatientPayload {
  firstName: string
  lastName: string
  birthDate: string
  sex: string
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

  if (response.status === 204) {
    return undefined as T
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

  async patch(token: string, patientId: string, payload: Partial<CreatePatientPayload>): Promise<PatientResponse> {
    return apiFetch(`/patients/${patientId}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async delete(token: string, patientId: string): Promise<void> {
    return apiFetch(`/patients/${patientId}`, token, { method: "DELETE" })
  },
}

export interface MeasurementResponse {
  id: string
  patientId: string
  measuredAt: string
  headCircumference: number
  createdAt: string
  percentile?: string
}

export interface CreateMeasurementPayload {
  measuredAt: string
  headCircumference: number
}

export const measurementService = {
  async getAll(token: string, patientId: string): Promise<MeasurementResponse[]> {
    return apiFetch(`/patients/${patientId}/measurements/`, token)
  },

  async create(token: string, patientId: string, payload: CreateMeasurementPayload): Promise<MeasurementResponse> {
    return apiFetch(`/patients/${patientId}/measurements/`, token, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async patch(token: string, patientId: string, measurementId: string, payload: { measuredAt?: string; headCircumference?: number }): Promise<MeasurementResponse> {
    return apiFetch(`/patients/${patientId}/measurements/${measurementId}`, token, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
  },

  async delete(token: string, patientId: string, measurementId: string): Promise<void> {
    return apiFetch(`/patients/${patientId}/measurements/${measurementId}`, token, {
      method: "DELETE",
    })
  },
}

export interface ReferencePoint {
  month: number
  p3: number
  p15: number
  p50: number
  p85: number
  p97: number
}

export const referenceService = {
  async getHeadCircumferenceCurves(sex: "M" | "F"): Promise<ReferencePoint[]> {
    const response = await fetch(`${API_BASE_URL}/reference/head-circumference?sex=${sex}`)
    if (!response.ok) throw new Error(`${response.status}`)
    return response.json()
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
