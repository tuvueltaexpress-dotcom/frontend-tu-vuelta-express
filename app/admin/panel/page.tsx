import { adminApi } from "@/lib/api"
import { Package, Store, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  let stats = { storesCount: 0, productsCount: 0 }

  try {
    stats = await adminApi.dashboard()
  } catch {
    // Use default values on error
  }

  const statCards = [
    {
      title: "Aliados",
      value: stats.storesCount,
      icon: Store,
      color: "bg-blue-500",
    },
    {
      title: "Productos",
      value: stats.productsCount,
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "Pedidos",
      value: 0,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">Resumen de tu plataforma</p>
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
                  <p className="text-2xl font-bold dark:text-white">{card.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
