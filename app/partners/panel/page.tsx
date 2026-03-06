'use client'

import { useEffect, useState } from 'react'
import { authApi, type PartnerDashboardStats } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Folder, Truck, Store, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PartnerDashboardPage() {
  const [data, setData] = useState<PartnerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const dashboardData = await authApi.partners.getDashboard()
      setData(dashboardData)
    } catch (err) {
      const error = err as Error & { statusCode?: number }
      if (error.statusCode === 404) {
        window.location.href = '/partners/panel/tienda'
        return
      }
      addToast(error.message || 'Error al cargar dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const hasStore = data?.store !== null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasStore) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu panel de control
        </p>
      </div>

      {!hasStore ? (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-4">
                <Store className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold dark:text-white">¡Crea tu tienda!</h2>
                <p className="text-muted-foreground mt-1">
                  Aún no tienes una tienda registrada. Comienza a vender hoy.
                </p>
              </div>
              <Link href="/partners/panel/tienda">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tienda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Productos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{data?.stats.productsCount}</div>
                <p className="text-xs text-muted-foreground">
                  En tu catálogo
                </p>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categorías
                </CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{data?.stats.categoriesCount}</div>
                <p className="text-xs text-muted-foreground">
                  De productos
                </p>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Opciones de Delivery
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{data?.stats.deliveryOptionsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Configuradas
                </p>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tu Tienda
                </CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate dark:text-white">{data?.store?.name}</div>
                <p className="text-xs text-muted-foreground">
                  {data?.store?.category?.name}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/partners/panel/tienda">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Mi Tienda</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Edita la información de tu negocio
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/partners/panel/productos">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Productos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu catálogo de productos
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/partners/panel/delivery">
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">Delivery</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Configura tus opciones de entrega
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
