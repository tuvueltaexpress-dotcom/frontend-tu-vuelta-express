'use client'

import { useState, useEffect } from 'react'
import { adminApi, type DeliveryOption, type Store } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Truck } from 'lucide-react'

interface DeliveryFormData {
  name: string
  fee: string
  storeId: string
}

interface OriginalData {
  name: string
  fee: number
  storeId: number
}

const initialFormData: DeliveryFormData = {
  name: '',
  fee: '',
  storeId: '',
}

export default function DeliveryZonasPage() {
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<DeliveryOption | null>(null)
  const [originalData, setOriginalData] = useState<OriginalData | null>(null)
  const [formData, setFormData] = useState<DeliveryFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    loadDeliveryOptions()
    loadStores()
  }, [page])

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
      const response = await adminApi.deliveryOptions.list(page, 10)
      setDeliveryOptions(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar zonas de delivery', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadStores() {
    try {
      const response = await adminApi.stores.list(1, 100)
      setStores(response.data)
    } catch (err) {
      console.error('Error loading stores:', err)
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
      storeId: option.storeId,
    })
    setFormData(initialFormData)
    setError('')
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingOption) {
      if (!formData.name.trim()) {
        setError('El nombre es requerido')
        return
      }
      if (!formData.fee || parseFloat(formData.fee) < 0) {
        setError('La tarifa es requerida')
        return
      }
      if (!formData.storeId) {
        setError('El aliado es requerido')
        return
      }
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

        await adminApi.deliveryOptions.update(editingOption.id, payload)
        addToast('Zona de delivery actualizada correctamente', 'success')
      } else {
        await adminApi.deliveryOptions.create({
          name: formData.name,
          fee: parseFloat(formData.fee),
          storeId: parseInt(formData.storeId),
        })
        addToast('Zona de delivery creada correctamente', 'success')
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
      await adminApi.deliveryOptions.delete(option.id)
      addToast('Zona de delivery eliminada correctamente', 'success')
      loadDeliveryOptions()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Zonas de Delivery</h1>
          <p className="text-muted-foreground dark:text-gray-400">Gestiona las opciones de delivery de tus aliados</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Zona
        </Button>
      </div>

      <div className="rounded-md border dark:border-slate-800">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">ID</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Nombre</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Tarifa</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Aliado</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Fecha Creación</th>
              <th className="text-right p-3 text-sm font-medium dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : deliveryOptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No hay zonas de delivery registradas
                </td>
              </tr>
            ) : (
              deliveryOptions.map((option) => (
                <tr key={option.id} className="border-t dark:border-slate-800">
                  <td className="p-3 dark:text-gray-300">{option.id}</td>
                  <td className="p-3 font-medium dark:text-white">{option.name}</td>
                  <td className="p-3 dark:text-gray-300">${option.fee.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground dark:text-gray-400">
                    {option.store?.name || 'Sin aliado'}
                  </td>
                  <td className="p-3 text-muted-foreground dark:text-gray-400">
                    {new Date(option.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm dark:text-gray-300">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md p-6 bg-background dark:bg-slate-900 rounded-lg shadow-lg border dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {editingOption ? 'Editar Zona de Delivery' : 'Nueva Zona de Delivery'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Delivery Normal"
                  autoFocus
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
                />
              </div>

              {!editingOption && (
                <div>
                  <Label>Aliado</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                    value={formData.storeId}
                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                  >
                    <option value="">Seleccionar aliado</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
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
