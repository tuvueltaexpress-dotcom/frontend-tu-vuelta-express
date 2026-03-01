"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
}

export function useAuth() {
  const [isReady, setIsReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("admin_token")
      const userStr = localStorage.getItem("admin_user")

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as AdminUser
          setAdmin(user)
          setIsAuthenticated(true)
        } catch {
          localStorage.removeItem("admin_token")
          localStorage.removeItem("admin_user")
        }
      }
      setIsReady(true)
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem("admin_token")
    localStorage.removeItem("admin_user")
    window.location.href = "/admin/login"
  }

  return { isReady, isAuthenticated, admin, logout }
}

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isReady, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isReady, isAuthenticated, router])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
