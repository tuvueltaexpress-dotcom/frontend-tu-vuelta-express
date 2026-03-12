"use client"

import { ToastProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/lib/use-theme"
import { SearchProvider } from "@/components/shared/search-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SearchProvider>
        <ToastProvider>{children}</ToastProvider>
      </SearchProvider>
    </ThemeProvider>
  )
}
