'use client'

import { useState, useEffect } from 'react'
import { usePartnerAuth } from '@/lib/use-partner-auth'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Mail, Phone, Building, Save } from 'lucide-react'

interface ProfileFormData {
  email: string
  businessName: string
  phone: string
}

interface OriginalData {
  email: string
  businessName: string
  phone: string
}

const initialFormData: ProfileFormData = {
  email: '',
  businessName: '',
  phone: '',
}

export default function PartnerPerfilPage() {
  const { partner } = usePartnerAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData)
  const [originalData, setOriginalData] = useState<OriginalData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    if (partner) {
      setFormData({
        email: partner.email,
        businessName: partner.businessName,
        phone: partner.phone,
      })
      setOriginalData({
        email: partner.email,
        businessName: partner.businessName,
        phone: partner.phone,
      })
    }
    setLoading(false)
  }, [partner])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.email.trim()) {
      setError('El email es requerido')
      return
    }
    if (!formData.businessName.trim()) {
      setError('El nombre del negocio es requerido')
      return
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es requerido')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (originalData) {
        const hasChanges = 
          formData.email !== originalData.email ||
          formData.businessName !== originalData.businessName ||
          formData.phone !== originalData.phone

        if (!hasChanges) {
          setSuccess('No hay cambios para guardar')
          return
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.setItem('partner_user', JSON.stringify({
        ...partner,
        email: formData.email,
        businessName: formData.businessName,
        phone: formData.phone,
      }))

      setOriginalData({
        email: formData.email,
        businessName: formData.businessName,
        phone: formData.phone,
      })

      setSuccess('Perfil actualizado correctamente')
      addToast('Perfil actualizado correctamente', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Activo',
    PENDING_APPROVAL: 'Pendiente de Aprobación',
    REJECTED: 'Rechazado',
    INACTIVE: 'Inactivo',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Mi Perfil</h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Gestiona tu información personal y de tu negocio
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <User className="h-5 w-5" />
              Información del Perfil
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Datos de tu cuenta en Tu Vuelta Express
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-slate-800">
              <div className="rounded-full bg-primary/10 p-2">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Email</p>
                <p className="font-medium dark:text-white">{partner?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-slate-800">
              <div className="rounded-full bg-primary/10 p-2">
                <Building className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Nombre del Negocio</p>
                <p className="font-medium dark:text-white">{partner?.businessName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-slate-800">
              <div className="rounded-full bg-primary/10 p-2">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Teléfono</p>
                <p className="font-medium dark:text-white">{partner?.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 dark:bg-slate-800">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Estado de Cuenta</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[partner?.status || 'INACTIVE']}`}>
                  {statusLabels[partner?.status || 'INACTIVE']}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Save className="h-5 w-5" />
              Actualizar Información
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Modifica los datos de tu perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="businessName">Nombre del Negocio</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Mi Restaurante"
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              )}

              <Button type="submit" disabled={saving} className="w-full">
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar Cambios
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
