const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ApiError {
  message: string
  statusCode?: number
  errors?: string[]
}

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("admin_token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
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

export interface DashboardStats {
  storesCount: number
  productsCount: number
}

export interface Store {
  id: number
  name: string
  image: string
  coverImage: string
  ha: string
  hc: string
  categoryId: number
  category?: { id: number; name: string }
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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

export const adminApi = {
  dashboard: () => fetchAPI<DashboardStats>("/admin/dashboard"),
  
  stores: {
    list: (page = 1, limit = 20) =>
      fetchAPI<PaginatedResponse<Store>>(`/stores?page=${page}&limit=${limit}`),
    get: (id: number) => fetchAPI<Store>(`/stores/${id}`),
  },
}
