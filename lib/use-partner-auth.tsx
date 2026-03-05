"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface PartnerUser {
  id: number
  email: string
  businessName: string
  phone: string
  status: string
}

export function usePartnerAuth() {
  const [isReady, setIsReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [partner, setPartner] = useState<PartnerUser | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("partner_token")
      const userStr = localStorage.getItem("partner_user")

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as PartnerUser
          setPartner(user)
          setIsAuthenticated(true)
        } catch {
          localStorage.removeItem("partner_token")
          localStorage.removeItem("partner_user")
        }
      }
      setIsReady(true)
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem("partner_token")
    localStorage.removeItem("partner_user")
    window.location.href = "/partners/login"
  }

  return { isReady, isAuthenticated, partner, logout }
}

export function ProtectedPartnerRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isReady, isAuthenticated } = usePartnerAuth()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/partners/login")
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
