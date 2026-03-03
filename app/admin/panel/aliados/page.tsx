'use client'

import { useState, useEffect, useRef } from 'react'
import { adminApi, type Store, type StoreCategory } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react'

interface StoreFormData {
  name: string
  image: string
  coverImage: string
  categoryId: string
  ha: string
  hc: string
}

interface OriginalStoreData {
  name: string
  image: string
  coverImage: string
  categoryId: number
  ha: string
  hc: string
}

const initialFormData: StoreFormData = {
  name: '',
  image: '',
  coverImage: '',
  categoryId: '',
  ha: '',
  hc: '',
}

export default function AliadosPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [originalData, setOriginalData] = useState<OriginalStoreData | null>(null)
  const [formData, setFormData] = useState<StoreFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  useEffect(() => {
    loadStores()
    loadCategories()
  }, [page])

  useEffect(() => {
    if (!dialogOpen) {
      setEditingStore(null)
      setOriginalData(null)
      setFormData(initialFormData)
      setImagePreview(null)
      setCoverPreview(null)
      setError('')
    }
  }, [dialogOpen])

  async function loadStores() {
    try {
      setLoading(true)
      const response = await adminApi.stores.list(page, 10)
      setStores(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar aliados', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const response = await adminApi.storesCategories.list(1, 100)
      setCategories(response.data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  function openCreateDialog() {
    setEditingStore(null)
    setOriginalData(null)
    setFormData(initialFormData)
    setImagePreview(null)
    setCoverPreview(null)
    setError('')
    setDialogOpen(true)
  }

  function openEditDialog(store: Store) {
    setEditingStore(store)
    setOriginalData({
      name: store.name,
      image: store.image,
      coverImage: store.coverImage,
      categoryId: store.categoryId,
      ha: store.ha || '',
      hc: store.hc || '',
    })
    setFormData(initialFormData)
    setImagePreview(null)
    setCoverPreview(null)
    setError('')
    setDialogOpen(true)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'coverImage') {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFormData(prev => ({ ...prev, [field]: base64 }))
      if (field === 'image') {
        setImagePreview(base64)
      } else {
        setCoverPreview(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  function removeImage(field: 'image' | 'coverImage') {
    setFormData(prev => ({ ...prev, [field]: '' }))
    if (field === 'image') {
      setImagePreview(null)
      if (imageInputRef.current) imageInputRef.current.value = ''
    } else {
      setCoverPreview(null)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingStore) {
      if (!formData.name.trim()) {
        setError('El nombre es requerido')
        return
      }
      if (!formData.image) {
        setError('La imagen es requerida')
        return
      }
      if (!formData.coverImage) {
        setError('La imagen de portada es requerida')
        return
      }
      if (!formData.categoryId) {
        setError('La categoría es requerida')
        return
      }
    }

    try {
      setSaving(true)
      setError('')

      if (editingStore && originalData) {
        const payload: { name?: string; image?: string; coverImage?: string; categoryId?: number; ha?: string; hc?: string } = {}

        if (formData.name && formData.name !== originalData.name) {
          payload.name = formData.name
        }
        if (formData.image && formData.image !== originalData.image) {
          payload.image = formData.image
        }
        if (formData.coverImage && formData.coverImage !== originalData.coverImage) {
          payload.coverImage = formData.coverImage
        }
        if (formData.categoryId && parseInt(formData.categoryId) !== originalData.categoryId) {
          payload.categoryId = parseInt(formData.categoryId)
        }
        if (formData.ha !== originalData.ha) {
          payload.ha = formData.ha || undefined
        }
        if (formData.hc !== originalData.hc) {
          payload.hc = formData.hc || undefined
        }

        if (Object.keys(payload).length === 0) {
          addToast('No hay cambios para guardar', 'info')
          setDialogOpen(false)
          return
        }

        await adminApi.stores.update(editingStore.id, payload)
        addToast('Aliado actualizado correctamente', 'success')
      } else {
        const payload = {
          name: formData.name,
          image: formData.image,
          coverImage: formData.coverImage,
          categoryId: parseInt(formData.categoryId),
          ha: formData.ha || undefined,
          hc: formData.hc || undefined,
        }
        await adminApi.stores.create(payload)
        addToast('Aliado creado correctamente', 'success')
      }

      setDialogOpen(false)
      loadStores()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(store: Store) {
    if (!confirm(`¿Estás seguro de eliminar "${store.name}"?`)) return

    try {
      await adminApi.stores.delete(store.id)
      addToast('Aliado eliminado correctamente', 'success')
      loadStores()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Aliados</h1>
          <p className="text-muted-foreground dark:text-gray-400">Gestiona tus aliados comerciales</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Aliado
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border dark:border-slate-800 overflow-hidden">
              <div className="aspect-video bg-muted dark:bg-slate-800 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted dark:bg-slate-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No hay aliados registrados</p>
          </div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className="rounded-lg border dark:border-slate-800 overflow-hidden bg-card dark:bg-slate-900 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => openEditDialog(store)}
            >
              <div className="aspect-video relative overflow-hidden">
                {store.coverImage ? (
                  <img
                    src={store.coverImage}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted dark:bg-slate-800 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditDialog(store)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(store)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    {store.image ? (
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted dark:bg-slate-800 flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate dark:text-white">{store.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      {store.category?.name || 'Sin categoría'}
                    </p>
                  </div>
                </div>
                {store.ha && store.hc && (
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                    {store.ha} - {store.hc}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 bg-background dark:bg-slate-900 rounded-lg shadow-lg border dark:border-slate-800">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {editingStore ? 'Editar Aliado' : 'Nuevo Aliado'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mi Restaurante"
                />
              </div>

              <div>
                <Label>Categoría</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ha">Hora de apertura</Label>
                  <Input
                    id="ha"
                    type="time"
                    value={formData.ha}
                    onChange={(e) => setFormData({ ...formData, ha: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hc">Hora de cierre</Label>
                  <Input
                    id="hc"
                    type="time"
                    value={formData.hc}
                    onChange={(e) => setFormData({ ...formData, hc: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Imagen del negocio</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border dark:border-slate-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('image')}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted dark:hover:bg-slate-800 dark:border-slate-700">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, 'image')}
                      />
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Imagen de portada</Label>
                <div className="mt-2">
                  {coverPreview ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border dark:border-slate-700">
                      <img
                        src={coverPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('coverImage')}
                        className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted dark:hover:bg-slate-800 dark:border-slate-700">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e, 'coverImage')}
                      />
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </label>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-2 pt-4">
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
                  {editingStore ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
