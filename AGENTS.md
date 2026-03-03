# Tu Vuelta Express - Frontend

## Resumen del Proyecto

Frontend de Tu Vuelta Express construido con Next.js 16, TypeScript y Tailwind CSS v4.

---

## Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Carruseles | Swiper |
| Estado Global | Zustand |
| HTTP | fetch nativo |

---

## Estructura de Carpetas

```
frontend/
├── app/                        # App Router Next.js
│   ├── (routes)/              # Route groups
│   │   ├── page.tsx          # Dashboard (/)
│   │   ├── aliados/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Página de aliado
│   │   └── admin/
│   │       ├── login/
│   │       │   └── page.tsx
│   │       └── panel/
│   │           ├── layout.tsx  # Layout admin con sidebar
│   │           └── page.tsx    # Dashboard
│   ├── api/                   # API routes (Route Handlers)
│   ├── layout.tsx            # Root layout
│   ├── globals.css
│   └── page.tsx              # Redirect to (routes)
├── components/
│   ├── ui/                   # Componentes shadcn/base
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── textarea.tsx
│   ├── shared/               # Componentes compartidos
│   └── admin/
│       └── sidebar.tsx        # Sidebar admin con menú
├── lib/
│   ├── api.ts               # Funciones API
│   ├── use-auth.tsx         # Hook de autenticación
│   └── utils.ts             # Utilidades (cn)
├── stores/                   # Zustand stores
├── types/                   # Tipos TypeScript
└── public/
```

---

## Convenciones de Código

### Naming

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Componentes | PascalCase | `StoreCard.tsx` |
| Hooks | camelCase + prefijo `use` | `useCartStore.ts` |
| Utilidades | camelCase | `api.ts`, `utils.ts` |
| Types/Interfaces | PascalCase | `CartItem` |
| Constantes | UPPER_SNAKE_CASE | `API_ENDPOINTS` |
| Archivos de página | kebab-case | `admin-panel.tsx` |

### Reglas de Código

- **NO agregar comentarios** a menos que sea explícitamente solicitado
- Usar **funciones flecha** para callbacks y event handlers
- **Evitar `any`**: usar `unknown` o tipos genéricos
- **Interfaces sobre types** para estructuras que pueden extenderse
- **Usar const** para referencias inmutables

### Imports

```typescript
// ✅ Orden recomendado:
// 1. React/Next imports
// 2. External libraries
// 3. Internal components
// 4. Types
// 5. Utils/stores

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StoreCard } from '@/components/shared/StoreCard'
import type { Store } from '@/types'
import { cn } from '@/lib/utils'
```

---

## Patrones de Arquitectura

### Server Components vs Client Components

```typescript
// ✅ Server Component (default)
export default async function DashboardPage() {
  const stores = await fetchStores()
  return <StoreList stores={stores} />
}

// ✅ Client Component (solo cuando necesita interacción)
'use client'

export function AddToCartButton({ productId }: { productId: string }) {
  const addItem = useCartStore((s) => s.addItem)
  return <Button onClick={() => addItem(productId)}>Agregar</Button>
}
```

**Usar Client Components solo cuando:**
- Usar hooks de React (`useState`, `useEffect`, `useRef`)
- Usar event handlers (`onClick`, `onChange`)
- Usar browser APIs (localStorage, window)
- Usar librerías de terceros que dependan de hooks
- Necesitar `useSearchParams` o `usePathname`

### Fetching de Datos

```typescript
// ✅ Server Component: fetch directo
async function getStore(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores/${id}`)
  if (!res.ok) throw new Error('Failed to fetch store')
  return res.json()
}

// ✅ Con caching (default en Next.js)
const res = await fetch(`${API_URL}/stores`, { cache: 'force-cache' })

// ✅ SSR (dynamic)
const res = await fetch(`${API_URL}/stores`, { cache: 'no-store' })
```

### Manejo de Estado (Zustand)

```typescript
// stores/useCartStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
  name: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.productId === item.productId)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }
        return { items: [...state.items, { ...item, id: crypto.randomUUID() }] }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        )
      })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    }),
    { name: 'cart-storage' }
  )
)
```

### Patrón de Componentes UI

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-white shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

---

## API Integration

### Funciones API Centralizadas

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('admin_token') 
    : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message)
  }

  return res.json()
}

export const api = {
  stores: {
    list: () => fetchAPI<Store[]>('/stores'),
    get: (id: string) => fetchAPI<Store>(`/stores/${id}`),
    getProducts: (id: string) => fetchAPI<Product[]>(`/stores/${id}/products`),
  },
  categories: {
    list: () => fetchAPI<Category[]>('/products-categories'),
  },
  auth: {
    login: (credentials: LoginCredentials) =>
      fetchAPI<AuthResponse>('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
  },
}
```

---

## Variables de Entorno

```env
# Obligatorio
NEXT_PUBLIC_API_URL=http://localhost:3000

# Opcional (production)
# NEXT_PUBLIC_API_URL=https://api.jf3-delivery.com
```

---

## Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `next dev` | Servidor desarrollo |
| `build` | `next build` | Build producción |
| `start` | `next start` | Servidor producción |
| `lint` | `next lint` | ESLint |

---

## Rutas

| Ruta | Componente | Tipo |
|------|------------|------|
| `/` | Dashboard público | Server Component |
| `/aliados/[id]` | Página de tienda | Server Component |
| `/admin/login` | Login admin | Client Component |
| `/admin/panel` | Dashboard admin | Client Component (protegido) |
| `/admin/panel/aliados` | Lista de aliados | Client Component |
| `/admin/panel/aliados/categorias` | Categorías de aliados | Client Component |
| `/admin/panel/productos` | Lista de productos | Client Component |
| `/admin/panel/productos/categorias` | Categorías de productos | Client Component |
| `/admin/panel/delivery-zonas` | Zonas de delivery | Client Component |

---

## Autenticación

### Protección de Rutas

```typescript
// lib/use-auth.tsx
import { useAuth, ProtectedRoute } from '@/lib/use-auth'

// Usar en layouts o páginas
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
```

### Login

```typescript
// Guardar token tras login
localStorage.setItem('admin_token', response.token)
localStorage.setItem('admin_user', JSON.stringify(response.admin))

// Recuperar en API
const token = localStorage.getItem('admin_token')
headers: { Authorization: `Bearer ${token}` }
```

### Logout

```typescript
const logout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  window.location.href = '/admin/login'
}
```

---

## Integración con Backend

- **URL:** Configurable via `NEXT_PUBLIC_API_URL`
- **Autenticación:** JWT (header `Authorization: Bearer <token>`)
- **Endpoints principales:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/admin/login` | Login admin |
| POST | `/admin/register` | Registro admin |
| GET | `/admin/dashboard` | Estadísticas del dashboard |
| GET | `/stores` | Listar tiendas |
| GET | `/stores/:id` | Detalle tienda |
| GET | `/stores/:id/products` | Productos por tienda |
| GET | `/products-categories` | Categorías de productos |
| GET | `/stores-categories` | Categorías de tiendas |
| GET | `/delivery-options` | Opciones de delivery |
| POST | `/stores` | Crear tienda |
| PUT | `/stores/:id` | Actualizar tienda |
| DELETE | `/stores/:id` | Eliminar tienda |
| POST | `/stores-categories` | Crear categoría de tienda |
| PUT | `/stores-categories/:id` | Actualizar categoría de tienda |
| DELETE | `/stores-categories/:id` | Eliminar categoría de tienda |
| POST | `/products` | Crear producto |
| PUT | `/products/:id` | Actualizar producto |
| DELETE | `/products/:id` | Eliminar producto |
| POST | `/products-categories` | Crear categoría de producto |
| PUT | `/products-categories/:id` | Actualizar categoría de producto |
| DELETE | `/products-categories/:id` | Eliminar categoría de producto |
| POST | `/delivery-options` | Crear opción de delivery |
| PUT | `/delivery-options/:id` | Actualizar opción de delivery |
| DELETE | `/delivery-options/:id` | Eliminar opción de delivery |

---

## Errores y Handling

### Error Boundaries

```typescript
// app/(routes)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2>Algo salió mal</h2>
      <button onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  )
}
```

### Not Found

```typescript
// En Server Components
import { notFound } from 'next/navigation'

const store = await getStore(id)
if (!store) notFound()
```

---

## Roadmap

### Fase 1: Panel de Administración
- [x] Setup Next.js + Tailwind + shadcn
- [x] Login/Registro admin
- [x] Dashboard con estadísticas
- [x] Sidebar con menú de navegación
- [x] CRUD Aliados (lista, crear, editar, eliminar)
- [x] CRUD Categorías de Aliados
- [x] CRUD Productos
- [x] CRUD Categorías de Productos
- [x] CRUD Zonas de Delivery

### Fase 2: Web Pública
- [ ] Landing page / Dashboard público
- [ ] Página de aliados
- [ ] Página de detalle de tienda
- [ ] Carrito de compras
- [ ] Integración WhatsApp para pedidos
- [ ] Navegación mobile

### Fase 3: Extras
- [ ] Sistema de usuarios (clientes)
- [ ] Historial de pedidos
- [ ] Notificaciones
