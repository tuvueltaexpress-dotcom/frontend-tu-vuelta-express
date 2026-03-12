'use client'

import { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { Package, Store, TrendingUp } from 'lucide-react'

interface DashboardStats {
  storesCount: number
  productsCount: number
  partnersCount: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    storesCount: 0,
    productsCount: 0,
    partnersCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      const data = await adminApi.dashboard()
      setStats(data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Aliados',
      value: stats.partnersCount,
      icon: Store,
      color: 'bg-blue-500',
    },
    {
      title: 'Productos',
      value: stats.productsCount,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: 'Pedidos',
      value: 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">
          Resumen de tu plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="p-6 rounded-xl border bg-card dark:bg-slate-800 text-card-foreground dark:text-white shadow-sm"
          >
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                    {card.title}
                  </p>
                  {loading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold dark:text-white">
                      {card.value}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
