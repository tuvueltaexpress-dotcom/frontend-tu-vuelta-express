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

export interface StoreCategory {
  id: number
  name: string
  createdAt: string
  updatedAt: string
  stores?: Store[]
}

export interface ProductCategory {
  id: number
  name: string
  storeId: number
  store?: { id: number; name: string }
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  title: string
  price: number
  images: string[]
  description: string
  storeId: number
  categoryId: number
  store?: { id: number; name: string }
  category?: { id: number; name: string }
  createdAt: string
  updatedAt: string
}

export interface DeliveryOption {
  id: number
  name: string
  fee: number
  storeId: number
  store?: { id: number; name: string }
  createdAt: string
  updatedAt: string
}

export const adminApi = {
  dashboard: () => fetchAPI<DashboardStats>("/admin/dashboard"),
  
  stores: {
    list: (page = 1, limit = 20, categoryId?: number) =>
      fetchAPI<PaginatedResponse<Store>>(`/stores?page=${page}&limit=${limit}${categoryId ? `&categoryId=${categoryId}` : ''}`),
    get: (id: number) => fetchAPI<Store>(`/stores/${id}`),
    create: (data: { name: string; image: string; coverImage: string; categoryId: number; ha?: string; hc?: string }) =>
      fetchAPI<Store>("/stores", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name?: string; image?: string; coverImage?: string; categoryId?: number; ha?: string; hc?: string }) =>
      fetchAPI<Store>(`/stores/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/stores/${id}`, {
        method: "DELETE",
      }),
  },

  storesCategories: {
    list: (page = 1, limit = 20) =>
      fetchAPI<PaginatedResponse<StoreCategory>>(`/stores-categories?page=${page}&limit=${limit}`),
    get: (id: number) => fetchAPI<StoreCategory>(`/stores-categories/${id}`),
    create: (data: { name: string }) =>
      fetchAPI<StoreCategory>("/stores-categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name: string }) =>
      fetchAPI<StoreCategory>(`/stores-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/stores-categories/${id}`, {
        method: "DELETE",
      }),
  },

  productsCategories: {
    list: (page = 1, limit = 20) =>
      fetchAPI<PaginatedResponse<ProductCategory>>(`/products-categories?page=${page}&limit=${limit}`),
    get: (id: number) => fetchAPI<ProductCategory>(`/products-categories/${id}`),
    create: (data: { name: string; storeId: number }) =>
      fetchAPI<ProductCategory>("/products-categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name?: string }) =>
      fetchAPI<ProductCategory>(`/products-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/products-categories/${id}`, {
        method: "DELETE",
      }),
  },

  products: {
    list: (page = 1, limit = 20, storeId?: number) =>
      fetchAPI<PaginatedResponse<Product>>(`/products?page=${page}&limit=${limit}${storeId ? `&storeId=${storeId}` : ''}`),
    get: (id: number) => fetchAPI<Product>(`/products/${id}`),
    create: (data: { title: string; price: number; images: string[]; description: string; storeId: number; categoryId: number }) =>
      fetchAPI<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { title?: string; price?: number; images?: string[]; description?: string; categoryId?: number }) =>
      fetchAPI<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/products/${id}`, {
        method: "DELETE",
      }),
  },

  deliveryOptions: {
    list: (page = 1, limit = 20) =>
      fetchAPI<PaginatedResponse<DeliveryOption>>(`/delivery-options?page=${page}&limit=${limit}`),
    get: (id: number) => fetchAPI<DeliveryOption>(`/delivery-options/${id}`),
    create: (data: { name: string; fee: number; storeId: number }) =>
      fetchAPI<DeliveryOption>("/delivery-options", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { name?: string; fee?: number }) =>
      fetchAPI<DeliveryOption>(`/delivery-options/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/delivery-options/${id}`, {
        method: "DELETE",
      }),
  },
}
