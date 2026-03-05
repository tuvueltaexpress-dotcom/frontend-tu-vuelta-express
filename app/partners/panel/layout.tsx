'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProtectedPartnerRoute } from '@/lib/use-partner-auth'
import { usePartnerAuth } from '@/lib/use-partner-auth'
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Truck, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Sun, 
  Moon,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useState as useReactState } from 'react'

interface MenuItem {
  label: string
  href?: string
  icon?: React.ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/partners/panel",
    icon: <LayoutDashboard />,
  },
  {
    label: "Mi Tienda",
    href: "/partners/panel/tienda",
    icon: <StoreIcon />,
  },
  {
    label: "Productos",
    href: "/partners/panel/productos",
    icon: <PackageIcon />,
  },
  {
    label: "Delivery",
    href: "/partners/panel/delivery",
    icon: <TruckIcon />,
  },
  {
    label: "Perfil",
    href: "/partners/panel/perfil",
    icon: <UserIcon />,
  },
]

function StoreIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.29 7 12 12l8.71-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

function PartnerSidebar({ 
  isOpen, 
  onClose,
  expanded = true 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  expanded?: boolean;
}) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-background dark:bg-slate-900 border-r dark:border-slate-800 transform transition-all duration-200",
          expanded ? "w-64 lg:translate-x-0" : "w-16 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:block hidden"
        )}
      >
        <div className={cn(
          "flex items-center h-16 border-b dark:border-slate-800 px-4",
          expanded ? "justify-between" : "justify-center"
        )}>
          {expanded ? (
            <>
              <Link href="/partners/panel" className="flex items-center gap-2 font-semibold">
                <span className="text-xl dark:text-white">Tu Vuelta Express</span>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-md lg:hidden hover:bg-accent dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link href="/partners/panel" className="flex items-center justify-center w-full font-semibold">
              <span className="text-xl dark:text-white">T</span>
            </Link>
          )}
        </div>
        {expanded ? (
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href || "#"}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent dark:hover:bg-slate-800 dark:text-gray-200"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        ) : (
          <nav className="p-2 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href || "#"}
                className={cn(
                  "flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent dark:hover:bg-slate-800"
                )}
                title={item.label}
              >
                {item.icon}
              </Link>
            ))}
          </nav>
        )}
      </aside>
    </>
  )
}

function PartnerHeader({ 
  onMenuClick,
  onToggleSidebar,
  sidebarExpanded 
}: { 
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
}) {
  const { partner, logout } = usePartnerAuth()

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/95 dark:bg-slate-900/95 backdrop-blur border-b dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md lg:hidden hover:bg-accent dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5 dark:text-white" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="hidden lg:flex p-2 rounded-md hover:bg-accent dark:hover:bg-slate-800 transition-colors"
          title={sidebarExpanded ? "Ocultar sidebar" : "Mostrar sidebar"}
        >
          {sidebarExpanded ? (
            <PanelLeftClose className="h-5 w-5 dark:text-gray-300" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 dark:text-gray-300" />
          )}
        </button>
        <h1 className="text-lg font-semibold lg:hidden dark:text-white">Tu Vuelta Express</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground dark:text-gray-400">Hola,</span>
          <span className="font-medium dark:text-white">{partner?.businessName}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md hover:bg-accent dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  return (
    <ProtectedPartnerRoute>
      <div className="min-h-screen bg-background dark:bg-slate-950">
        <PartnerSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          expanded={sidebarExpanded}
        />
        <div className={sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'}>
          <PartnerHeader 
            onMenuClick={() => setSidebarOpen(true)} 
            onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
            sidebarExpanded={sidebarExpanded}
          />
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedPartnerRoute>
  );
}
