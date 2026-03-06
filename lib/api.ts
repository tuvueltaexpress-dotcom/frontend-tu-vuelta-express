const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface ApiError {
  message: string
  statusCode?: number
  errors?: string[]
}

function getAuthHeaders(authType: 'admin' | 'partner' = 'admin'): HeadersInit {
  if (typeof window === "undefined") return {}
  const tokenKey = authType === 'partner' ? "partner_token" : "admin_token"
  const token = localStorage.getItem(tokenKey)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit, authType: 'admin' | 'partner' = 'admin'): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(authType),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error: ApiError = await res.json().catch(() => ({
      message: "Error en la solicitud",
    }))
    const errorMessage = error.errors?.[0] || error.message
    const err = new Error(errorMessage)
    ;(err as any).statusCode = res.status
    throw err
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

export interface PartnerLoginResponse {
  token: string
  partner: {
    id: number
    email: string
    businessName: string
    phone: string
    status: string
  }
}

export interface PartnerRegisterRequest {
  email: string
  password: string
  businessName: string
  phone: string
}

export interface PartnerRegisterResponse {
  message: string
  status: string
}

export interface Partner {
  id: number
  email: string
  businessName: string
  phone: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface PartnerStore {
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

export interface PartnerDashboardStats {
  store: PartnerStore | null
  stats: {
    productsCount: number
    categoriesCount: number
    deliveryOptionsCount: number
  }
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

  partners: {
    login: (credentials: { email: string; password: string }) =>
      fetchAPI<PartnerLoginResponse>("/partners/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    register: (data: PartnerRegisterRequest) =>
      fetchAPI<PartnerRegisterResponse>("/partners/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getDashboard: () =>
      fetchAPI<PartnerDashboardStats>("/partners/dashboard", undefined, 'partner'),
  },
}

export interface PartnerStoreRequest {
  name: string
  image: string
  coverImage?: string
  categoryId: number
  ha?: string
  hc?: string
}

export interface PartnerStoreResponse {
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

export const partnerApi = {
  store: {
    get: () =>
      fetchAPI<PartnerStoreResponse | null>("/partners/store", undefined, 'partner'),
    create: (data: PartnerStoreRequest) =>
      fetchAPI<PartnerStoreResponse>("/partners/store", {
        method: "POST",
        body: JSON.stringify(data),
      }, 'partner'),
    update: (id: number, data: Partial<PartnerStoreRequest>) =>
      fetchAPI<PartnerStoreResponse>(`/partners/store/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }, 'partner'),
  },
  products: {
    list: (page = 1, limit = 20) =>
      fetchAPI<PaginatedResponse<Product>>(`/partners/products?page=${page}&limit=${limit}`, undefined, 'partner'),
    create: (data: { title: string; price: number; images: string[]; description: string; categoryId: number }) =>
      fetchAPI<Product>("/partners/products", {
        method: "POST",
        body: JSON.stringify(data),
      }, 'partner'),
    update: (id: number, data: { title?: string; price?: number; images?: string[]; description?: string; categoryId?: number }) =>
      fetchAPI<Product>(`/partners/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }, 'partner'),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/partners/products/${id}`, {
        method: "DELETE",
      }, 'partner'),
  },
  productsCategories: {
    list: () =>
      fetchAPI<ProductCategory[]>("/partners/products-categories", undefined, 'partner'),
    create: (data: { name: string }) =>
      fetchAPI<ProductCategory>("/partners/products-categories", {
        method: "POST",
        body: JSON.stringify(data),
      }, 'partner'),
    update: (id: number, data: { name?: string }) =>
      fetchAPI<ProductCategory>(`/partners/products-categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }, 'partner'),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/partners/products-categories/${id}`, {
        method: "DELETE",
      }, 'partner'),
  },
  deliveryOptions: {
    list: () =>
      fetchAPI<DeliveryOption[]>("/partners/delivery-options", undefined, 'partner'),
    create: (data: { name: string; fee: number }) =>
      fetchAPI<DeliveryOption>("/partners/delivery-options", {
        method: "POST",
        body: JSON.stringify(data),
      }, 'partner'),
    update: (id: number, data: { name?: string; fee?: number }) =>
      fetchAPI<DeliveryOption>(`/partners/delivery-options/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }, 'partner'),
    delete: (id: number) =>
      fetchAPI<{ message: string }>(`/partners/delivery-options/${id}`, {
        method: "DELETE",
      }, 'partner'),
  },
  getStoreCategories: async () => {
    const data = await fetchAPI<PaginatedResponse<StoreCategory>>("/stores-categories?page=1&limit=100", undefined, 'partner')
    return { data: data.data }
  },
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

  partners: {
    listPending: () =>
      fetchAPI<Partner[]>("/admin/partners/pending"),
    approve: (id: number) =>
      fetchAPI<{ message: string }>(`/admin/partners/${id}/approve`, {
        method: "PATCH",
      }),
    reject: (id: number) =>
      fetchAPI<{ message: string }>(`/admin/partners/${id}/reject`, {
        method: "PATCH",
      }),
  },
}
