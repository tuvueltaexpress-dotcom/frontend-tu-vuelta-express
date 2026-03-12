'use client'

import { useState, useEffect, useRef } from 'react'
import { adminApi, type Product, type Store, type ProductCategory } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react'

interface ProductFormData {
  title: string
  price: string
  images: string[]
  description: string
  storeId: string
  categoryId: string
}

interface OriginalProductData {
  title: string
  price: number
  images: string[]
  description: string
  storeId: number
  categoryId: number
}

const initialFormData: ProductFormData = {
  title: '',
  price: '',
  images: [],
  description: '',
  storeId: '',
  categoryId: '',
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [originalData, setOriginalData] = useState<OriginalProductData | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  useEffect(() => {
    loadProducts()
    loadStores()
  }, [page])

  useEffect(() => {
    if (!dialogOpen) {
      setEditingProduct(null)
      setOriginalData(null)
      setFormData(initialFormData)
      setError('')
    }
  }, [dialogOpen])

  useEffect(() => {
    if (formData.storeId) {
      loadCategoriesByStore(parseInt(formData.storeId))
    } else {
      setCategories([])
    }
  }, [formData.storeId])

  async function loadProducts() {
    try {
      setLoading(true)
      const response = await adminApi.products.list(page, 10)
      setProducts(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al cargar productos', 'error')
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

  async function loadCategoriesByStore(storeId: number) {
    try {
      const response = await adminApi.productsCategories.list(1, 100)
      setCategories(response.data.filter(c => c.storeId === storeId))
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  function openCreateDialog() {
    setEditingProduct(null)
    setOriginalData(null)
    setFormData(initialFormData)
    setError('')
    setDialogOpen(true)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
    setOriginalData({
      title: product.title,
      price: product.price,
      images: product.images,
      description: product.description,
      storeId: product.storeId,
      categoryId: product.categoryId,
    })
    setFormData({
      title: '',
      price: '',
      images: [],
      description: '',
      storeId: '',
      categoryId: '',
    })
    setError('')
    setDialogOpen(true)
  }

  function handleImageAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setFormData(prev => ({ ...prev, images: [...prev.images, base64] }))
    }
    reader.readAsDataURL(file)
  }

  function removeImage(index: number) {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!editingProduct) {
      if (!formData.title.trim()) {
        setError('El título es requerido')
        return
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('El precio es requerido')
        return
      }
      if (formData.images.length === 0) {
        setError('Al menos una imagen es requerida')
        return
      }
      if (!formData.description.trim()) {
        setError('La descripción es requerida')
        return
      }
      if (!formData.storeId) {
        setError('El aliado es requerido')
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

      if (editingProduct && originalData) {
        const payload: { title?: string; price?: number; images?: string[]; description?: string; categoryId?: number } = {}

        if (formData.title && formData.title !== originalData.title) {
          payload.title = formData.title
        }
        if (formData.price && parseFloat(formData.price) !== originalData.price) {
          payload.price = parseFloat(formData.price)
        }
        if (formData.images.length > 0) {
          payload.images = formData.images
        }
        if (formData.description && formData.description !== originalData.description) {
          payload.description = formData.description
        }
        if (formData.categoryId && parseInt(formData.categoryId) !== originalData.categoryId) {
          payload.categoryId = parseInt(formData.categoryId)
        }

        if (Object.keys(payload).length === 0) {
          addToast('No hay cambios para guardar', 'info')
          setDialogOpen(false)
          return
        }

        await adminApi.products.update(editingProduct.id, payload)
        addToast('Producto actualizado correctamente', 'success')
      } else {
        await adminApi.products.create({
          title: formData.title,
          price: parseFloat(formData.price),
          images: formData.images,
          description: formData.description,
          storeId: parseInt(formData.storeId),
          categoryId: parseInt(formData.categoryId),
        })
        addToast('Producto creado correctamente', 'success')
      }

      setDialogOpen(false)
      loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Estás seguro de eliminar "${product.title}"?`)) return

    try {
      await adminApi.products.delete(product.id)
      addToast('Producto eliminado correctamente', 'success')
      loadProducts()
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Error al eliminar', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Productos</h1>
          <p className="text-muted-foreground dark:text-gray-400">Gestiona los productos de tus aliados</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border dark:border-slate-800 overflow-hidden">
              <div className="aspect-square bg-muted dark:bg-slate-800 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted dark:bg-slate-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No hay productos registrados</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border dark:border-slate-800 overflow-hidden bg-card dark:bg-slate-900 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => openEditDialog(product)}
            >
              <div className="aspect-square relative overflow-hidden">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
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
                      openEditDialog(product)
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
                      handleDelete(product)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate dark:text-white">{product.title}</h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  {product.store?.name || 'Sin aliado'}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  ${product.price.toFixed(2)}
                </p>
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
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Hamburguesa Clásica"
                />
              </div>

              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>

              {!editingProduct && (
                <>
                  <div>
                    <Label>Aliado</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                      value={formData.storeId}
                      onChange={(e) => setFormData({ ...formData, storeId: e.target.value, categoryId: '' })}
                    >
                      <option value="">Seleccionar aliado</option>
                      {stores.map((store) => (
                        <option key={store.id} value={store.id}>{store.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Categoría</Label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      disabled={!formData.storeId}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {editingProduct && (
                <div>
                  <Label>Categoría</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-slate-700 dark:bg-slate-800 dark:text-white mt-1"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>Imágenes</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border dark:border-slate-700">
                      <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted dark:hover:bg-slate-800 dark:border-slate-700">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageAdd}
                    />
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </label>
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
                  {editingProduct ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
