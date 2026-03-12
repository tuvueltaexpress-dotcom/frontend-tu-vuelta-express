'use client'

import { useState, useEffect } from 'react'
import { partnerApi, type DeliveryOption } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Loader2, Truck } from 'lucide-react'

interface DeliveryFormData {
  name: string
  fee: string
}

interface OriginalData {
  name: string
  fee: number
}

const initialFormData: DeliveryFormData = {
  name: '',
  fee: '',
}

export default function PartnerDeliveryPage() {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null)
  const [originalData, setOriginalData] = useState<OriginalData | null>(null)
  const [formData, setFormData] = useState<DeliveryFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    loadDeliveryOptions()
  }, [])

  useEffect(() => {
    if (!dialogOpen) {
      setEditingOption(null)
      setOriginalData(null)
      setFormData(initialFormData)
      setError('')
    }
  }, [dialogOpen])

  async function loadDeliveryOptions() {
    try {
      setLoading(true)
      const data = await partnerApi.deliveryOptions.list()
      setDeliveryOptions(data)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar opciones de delivery', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingOption(null)
    setOriginalData(null)
    setFormData(initialFormData)
    setError('')
    setDialogOpen(true)
  }

  function openEditDialog(option: DeliveryOption) {
    setEditingOption(option)
    setOriginalData({
      name: option.name,
      fee: option.fee,
    })
    setFormData({
      name: option.name,
      fee: option.fee.toString(),
    })
    setError('')
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!formData.fee || parseFloat(formData.fee) < 0) {
      setError('La tarifa es requerida')
      return
    }

    try {
      setSaving(true)
      setError('')

      if (editingOption && originalData) {
        const payload: { name?: string; fee?: number } = {}

        if (formData.name && formData.name !== originalData.name) {
          payload.name = formData.name
        }
        if (formData.fee && parseFloat(formData.fee) !== originalData.fee) {
          payload.fee = parseFloat(formData.fee)
        }

        if (Object.keys(payload).length === 0) {
          addToast('No hay cambios para guardar', 'info')
          setDialogOpen(false)
          return
        }

        await partnerApi.deliveryOptions.update(editingOption.id, payload)
        addToast('Opción de delivery actualizada correctamente', 'success')
      } else {
        await partnerApi.deliveryOptions.create({
          name: formData.name,
          fee: parseFloat(formData.fee),
        })
        addToast('Opción de delivery creada correctamente', 'success')
      }

      setDialogOpen(false)
      loadDeliveryOptions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(option: DeliveryOption) {
    if (!confirm(`¿Estás seguro de eliminar "${option.name}"?`)) return

    try {
      await partnerApi.deliveryOptions.delete(option.id)
      addToast('Opción de delivery eliminada correctamente', 'success')
      loadDeliveryOptions()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Opciones de Delivery</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Configura las opciones de entrega disponibles para tus clientes
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Opción
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border dark:border-slate-800 p-6">
              <div className="h-6 bg-muted dark:bg-slate-800 rounded animate-pulse w-1/2 mb-4" />
              <div className="h-4 bg-muted dark:bg-slate-800 rounded animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      ) : deliveryOptions.length === 0 ? (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-4">
                <Truck className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold dark:text-white">¡Configura el delivery!</h2>
                <p className="text-muted-foreground mt-1">
                  Agrega las opciones de entrega disponibles para tus clientes.
                </p>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Crear opción de delivery
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deliveryOptions.map((option) => (
            <Card key={option.id} className="dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-white">{option.name}</h3>
                      <p className="text-2xl font-bold text-primary">
                        ${option.fee.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(option)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(option)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-2">
                  Creado el {new Date(option.createdAt).toLocaleDateString('es-ES')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md p-6 bg-background dark:bg-slate-900 rounded-lg shadow-lg border dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {editingOption ? 'Editar Opción de Delivery' : 'Nueva Opción de Delivery'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Zona Centro, Zona Norte..."
                  autoFocus
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="fee">Tarifa ($)</Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  placeholder="0.00"
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                  className="dark:border-slate-700 dark:text-white"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingOption ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
