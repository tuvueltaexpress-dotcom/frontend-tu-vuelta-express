"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-destructive dark:text-red-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
  }

  const bgColors = {
    success: "bg-white dark:bg-slate-900 border-green-200 dark:border-green-800",
    error: "bg-white dark:bg-slate-900 border-destructive/30 dark:border-red-800/50",
    info: "bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800",
  }

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right ${bgColors[toast.type]}`}
      role="alert"
    >
      {icons[toast.type]}
      <p className="text-sm font-medium text-foreground dark:text-gray-100">{toast.message}</p>
      <button
        onClick={onClose}
        className="ml-auto p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-muted-foreground dark:text-gray-400"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
