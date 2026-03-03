import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Menu, X, LogOut, Sun, Moon, PanelLeftClose, PanelLeftOpen, FolderClosed } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/use-auth"
import { useTheme } from "@/lib/use-theme"

export interface MenuItem {
  label: string
  href?: string
  icon?: React.ReactNode
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: "Aliados",
    icon: <StoreIcon />,
    children: [
      { label: "Aliados", href: "/admin/panel/aliados", icon: <StoreIcon /> },
      { label: "Categorías Aliados", href: "/admin/panel/aliados/categorias", icon: <FolderIcon /> },
      { label: "Productos", href: "/admin/panel/productos", icon: <PackageIcon /> },
      { label: "Categorías Productos", href: "/admin/panel/productos/categorias", icon: <FolderIcon /> },
      { label: "Zonas delivery", href: "/admin/panel/delivery-zonas", icon: <MapPinIcon /> },
    ],
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

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
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

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
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

export function Sidebar({ 
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
              <Link href="/admin/panel" className="flex items-center gap-2 font-semibold">
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
            <Link href="/admin/panel" className="flex items-center justify-center w-full font-semibold">
              <span className="text-xl dark:text-white">T</span>
            </Link>
          )}
        </div>
        {expanded ? (
          <nav className="p-4 space-y-2">
            <Link
              href="/admin/panel"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/admin/panel"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent dark:hover:bg-slate-800"
              )}
            >
              <DashboardIcon />
              Dashboard
            </Link>
            {menuItems.map((item) => (
              <MenuDropdown key={item.label} item={item} pathname={pathname} />
            ))}
          </nav>
        ) : (
          <nav className="p-2 space-y-2">
            <Link
              href="/admin/panel"
              className={cn(
                "flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors",
                pathname === "/admin/panel"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent dark:hover:bg-slate-800"
              )}
              title="Dashboard"
            >
              <DashboardIcon />
            </Link>
            {menuItems.map((item) => (
              <MenuDropdownCollapsed key={item.label} item={item} pathname={pathname} />
            ))}
          </nav>
        )}
      </aside>
    </>
  )
}

function MenuDropdown({ item, pathname }: { item: MenuItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(() => {
    return item.children?.some((child) => pathname.startsWith(child.href || "")) ?? false
  })

  const hasActiveChild = item.children?.some((child) => pathname.startsWith(child.href || ""))

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          hasActiveChild
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent dark:hover:bg-slate-800 dark:text-gray-200"
        )}
      >
        <div className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      {isOpen && item.children && (
        <div className="ml-4 mt-1 space-y-1 border-l dark:border-slate-700 pl-2">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href || "#"}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === child.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent dark:hover:bg-slate-800 dark:text-gray-300"
              )}
            >
              {child.icon}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function MenuDropdownCollapsed({ item, pathname }: { item: MenuItem; pathname: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const hasActiveChild = item.children?.some((child) => pathname.startsWith(child.href || ""))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-center p-2 rounded-md text-sm font-medium transition-colors w-full",
          hasActiveChild
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent dark:hover:bg-slate-800"
        )}
        title={item.label}
      >
        {item.icon ? (
          <span className={hasActiveChild ? "text-primary-foreground" : "dark:text-gray-300"}>
            {item.icon}
          </span>
        ) : (
          <FolderClosed className={hasActiveChild ? "text-primary-foreground" : "dark:text-gray-300"} />
        )}
      </button>
      {isOpen && item.children && (
        <div className="absolute left-full top-0 ml-1 bg-background dark:bg-slate-800 border dark:border-slate-700 rounded-md shadow-lg p-2 min-w-[180px] z-50">
          <p className="text-xs font-semibold text-muted-foreground dark:text-gray-400 px-2 pb-2 border-b dark:border-slate-700 mb-2">
            {item.label}
          </p>
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href || "#"}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                pathname === child.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent dark:hover:bg-slate-700 dark:text-gray-200"
              )}
            >
              {child.icon}
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function AdminHeader({ 
  onMenuClick,
  onToggleSidebar,
  sidebarExpanded 
}: { 
  onMenuClick: () => void;
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
}) {
  const { admin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

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
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-accent dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
          title={theme === "light" ? "Modo oscuro" : "Modo claro"}
        >
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-muted-foreground dark:text-gray-400">Hola,</span>
          <span className="font-medium dark:text-white">{admin?.username}</span>
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
