const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ApiError {
  message: string
  statusCode?: number
  errors?: string[]
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      message: "Error en la solicitud",
    }))
    const errorMessage = error.errors?.[0] || error.message
    throw new Error(errorMessage)
  }

  return res.json()
}

export interface LoginResponse {
  token: string
  admin: {
    id: number
    username: string
    email: string
    role: string
  }
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
}

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    fetchAPI<LoginResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (data: RegisterRequest) =>
    fetchAPI<RegisterResponse>("/admin/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
