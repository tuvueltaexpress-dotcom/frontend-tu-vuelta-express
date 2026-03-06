'use client'

import { useState, useEffect } from 'react'
import { partnerApi, type ProductCategory } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Loader2, Folder } from 'lucide-react'

interface CategoryFormData {
  name: string
}

interface OriginalData {
  name: string
}

const initialFormData: CategoryFormData = {
  name: '',
}

export default function PartnerCategoriasProductosPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [originalData, setOriginalData] = useState<OriginalData | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (!dialogOpen) {
      setEditingCategory(null)
      setOriginalData(null)
      setFormData(initialFormData)
      setError('')
    }
  }, [dialogOpen])

  async function loadCategories() {
    try {
      setLoading(true)
      const data = await partnerApi.productsCategories.list()
      setCategories(data)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar categorías', 'error')
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingCategory(null)
    setOriginalData(null)
    setFormData(initialFormData)
    setError('')
    setDialogOpen(true)
  }

  function openEditDialog(category: ProductCategory) {
    setEditingCategory(category)
    setOriginalData({
      name: category.name,
    })
    setFormData({
      name: category.name,
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

    try {
      setSaving(true)
      setError('')

      if (editingCategory && originalData) {
        const payload: { name?: string } = {}

        if (formData.name && formData.name !== originalData.name) {
          payload.name = formData.name
        }

        if (Object.keys(payload).length === 0) {
          addToast('No hay cambios para guardar', 'info')
          setDialogOpen(false)
          return
        }

        await partnerApi.productsCategories.update(editingCategory.id, payload)
        addToast('Categoría actualizada correctamente', 'success')
      } else {
        await partnerApi.productsCategories.create({
          name: formData.name,
        })
        addToast('Categoría creada correctamente', 'success')
      }

      setDialogOpen(false)
      loadCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: ProductCategory) {
    if (!confirm(`¿Estás seguro de eliminar "${category.name}"?`)) return

    try {
      await partnerApi.productsCategories.delete(category.id)
      addToast('Categoría eliminada correctamente', 'success')
      loadCategories()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">Categorías de Productos</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Organiza tus productos en categorías
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="rounded-md border dark:border-slate-800">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">ID</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Nombre</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Productos</th>
              <th className="text-left p-3 text-sm font-medium dark:text-gray-300">Fecha Creación</th>
              <th className="text-right p-3 text-sm font-medium dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No hay categorías registradas
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-t dark:border-slate-800">
                  <td className="p-3 dark:text-gray-300">{category.id}</td>
                  <td className="p-3 font-medium dark:text-white">{category.name}</td>
                  <td className="p-3 text-muted-foreground dark:text-gray-400">
                    -
                  </td>
                  <td className="p-3 text-muted-foreground dark:text-gray-400">
                    {new Date(category.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category)}
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

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md p-6 bg-background dark:bg-slate-900 rounded-lg shadow-lg border dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Hamburguesas, Bebidas, Postres..."
                  autoFocus
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
                  {editingCategory ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
