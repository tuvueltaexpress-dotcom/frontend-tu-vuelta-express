'use client';

import { useEffect, useState, useRef } from 'react';
import {
  partnerApi,
  type PartnerStoreResponse,
  type StoreCategory,
} from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Image as ImageIcon, X, Pencil, Save } from 'lucide-react';

interface StoreFormData {
  name: string;
  image: string;
  coverImage: string;
  categoryId: string;
  ha: string;
  hc: string;
}

const initialFormData: StoreFormData = {
  name: '',
  image: '',
  coverImage: '',
  categoryId: '',
  ha: '',
  hc: '',
};

export default function PartnerTiendaPage() {
  const [store, setStore] = useState<PartnerStoreResponse | null>(null);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadStore();
  }, []);

  async function loadStore() {
    try {
      setLoading(true);
      const storeData = await partnerApi.store.get();
      setStore(storeData);
      
      if (storeData) {
        setFormData({
          name: storeData.name,
          image: storeData.image,
          coverImage: storeData.coverImage || '',
          categoryId: storeData.categoryId.toString(),
          ha: storeData.ha || '',
          hc: storeData.hc || '',
        });
        setImagePreview(storeData.image);
        setCoverPreview(storeData.coverImage || null);
      }
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Error al cargar datos',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }

  async function startEditing() {
    try {
      setLoadingCategories(true);
      const categoriesData = await partnerApi.getStoreCategories();
      setCategories(categoriesData.data);
      setIsEditing(true);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Error al cargar categorías',
        'error',
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'image' | 'coverImage',
  ) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (field === 'image') {
          setFormData({ ...formData, image: base64 });
          setImagePreview(base64);
        } else {
          setFormData({ ...formData, coverImage: base64 });
          setCoverPreview(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function validateForm() {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'El nombre es requerido';
    else if (formData.name.length < 2) newErrors.name = 'Mínimo 2 caracteres';
    if (!formData.image) newErrors.image = 'La imagen es requerida';
    if (!formData.categoryId)
      newErrors.categoryId = 'La categoría es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (store) {
        const changedData: Partial<{
          name: string;
          image: string;
          coverImage: string | undefined;
          categoryId: number;
          ha: string | undefined;
          hc: string | undefined;
        }> = {};

        if (formData.name !== store.name) changedData.name = formData.name;
        if (formData.image !== store.image) changedData.image = formData.image;
        if (formData.coverImage !== (store.coverImage || '')) changedData.coverImage = formData.coverImage || undefined;
        if (parseInt(formData.categoryId) !== store.categoryId) changedData.categoryId = parseInt(formData.categoryId);
        if (formData.ha !== (store.ha || '')) changedData.ha = formData.ha || undefined;
        if (formData.hc !== (store.hc || '')) changedData.hc = formData.hc || undefined;

        if (Object.keys(changedData).length === 0) {
          addToast('No hay cambios para guardar', 'success');
          setIsEditing(false);
          return;
        }

        const updated = await partnerApi.store.update(store.id, changedData);
        setStore(updated);
        addToast('Tienda actualizada exitosamente', 'success');
      } else {
        const data = {
          name: formData.name,
          image: formData.image,
          coverImage: formData.coverImage || undefined,
          categoryId: parseInt(formData.categoryId),
          ha: formData.ha || undefined,
          hc: formData.hc || undefined,
        };
        const created = await partnerApi.store.create(data);
        setStore(created);
        addToast('Tienda creada exitosamente', 'success');
      }
      setIsEditing(false);
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : 'Error al guardar',
        'error',
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    if (store) {
      setFormData({
        name: store.name,
        image: store.image,
        coverImage: store.coverImage || '',
        categoryId: store.categoryId.toString(),
        ha: store.ha || '',
        hc: store.hc || '',
      });
      setImagePreview(store.image);
      setCoverPreview(store.coverImage || null);
    }
    setIsEditing(false);
    setErrors({});
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!store && !isEditing) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Mi Tienda</h1>
          <p className='text-muted-foreground'>
            Gestiona la información de tu negocio
          </p>
        </div>

        <Card className='border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='rounded-full bg-amber-100 dark:bg-amber-900 p-4'>
                <ImageIcon className='h-8 w-8 text-amber-600 dark:text-amber-400' />
              </div>
              <div>
                <h2 className='text-xl font-semibold dark:text-white'>¡Crea tu tienda!</h2>
                <p className='text-muted-foreground mt-1'>
                  Completa los datos de tu negocio para comenzar a vender
                </p>
              </div>
              <Button onClick={startEditing} disabled={loadingCategories}>
                {loadingCategories ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Cargando...
                  </>
                ) : (
                  <>
                    <ImageIcon className='h-4 w-4 mr-2' />
                    Crear tienda
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingCategories) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!store && !isEditing) {
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Mi Tienda</h1>
          <p className='text-muted-foreground'>
            Gestiona la información de tu negocio
          </p>
        </div>

        <Card className='border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='rounded-full bg-amber-100 dark:bg-amber-900 p-4'>
                <ImageIcon className='h-8 w-8 text-amber-600 dark:text-amber-400' />
              </div>
              <div>
                <h2 className='text-xl font-semibold'>¡Crea tu tienda!</h2>
                <p className='text-muted-foreground mt-1'>
                  Completa los datos de tu negocio para comenzar a vender
                </p>
              </div>
              <Button onClick={startEditing}>
                <ImageIcon className='h-4 w-4 mr-2' />
                Crear tienda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Mi Tienda</h1>
          <p className='text-muted-foreground'>
            {store ? 'Gestiona la información de tu negocio' : 'Crea tu tienda'}
          </p>
        </div>
        {store && !isEditing && (
          <Button variant='outline' onClick={startEditing}>
            <Pencil className='h-4 w-4 mr-2' />
            Editar
          </Button>
        )}
      </div>

      {(isEditing || !store) && (
        <form onSubmit={handleSubmit}>
          <Card className="dark:bg-slate-900">
            <CardHeader>
              <CardTitle>{store ? 'Editar tienda' : 'Crear tienda'}</CardTitle>
              <CardDescription>
                Completa los datos de tu negocio
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Nombre de la tienda *</Label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Mi Restaurant'
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className='text-xs text-destructive'>{errors.name}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>Categoría *</Label>
                  <select
                    id='category'
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                    aria-invalid={!!errors.categoryId}
                  >
                    <option value=''>Selecciona una categoría</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className='text-xs text-destructive'>
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='ha'>Hora de apertura</Label>
                  <Input
                    id='ha'
                    type='time'
                    value={formData.ha}
                    onChange={(e) =>
                      setFormData({ ...formData, ha: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='hc'>Hora de cierre</Label>
                  <Input
                    id='hc'
                    type='time'
                    value={formData.hc}
                    onChange={(e) =>
                      setFormData({ ...formData, hc: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Imagen de perfil *</Label>
                <div className='flex items-start gap-4'>
                  <div className='relative w-32 h-32 rounded-lg overflow-hidden border bg-muted'>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt='Preview'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <ImageIcon className='h-8 w-8 text-muted-foreground' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <input
                      ref={imageInputRef}
                      type='file'
                      accept='image/*'
                      onChange={(e) => handleImageChange(e, 'image')}
                      className='hidden'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => imageInputRef.current?.click()}
                    >
                      Seleccionar imagen
                    </Button>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Formato: JPG, PNG. Máx 5MB
                    </p>
                    {errors.image && (
                      <p className='text-xs text-destructive'>{errors.image}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Imagen de portada</Label>
                <div className='flex items-start gap-4'>
                  <div className='relative w-full h-40 rounded-lg overflow-hidden border bg-muted'>
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt='Preview'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <ImageIcon className='h-8 w-8 text-muted-foreground' />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    ref={coverInputRef}
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleImageChange(e, 'coverImage')}
                    className='hidden'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Seleccionar imagen de portada
                  </Button>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Esta imagen aparecerá en la cabecera de tu página
                  </p>
                </div>
              </div>

              <div className='flex gap-2'>
                {isEditing && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={cancelEditing}
                  >
                    Cancelar
                  </Button>
                )}
                <Button type='submit' disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className='mr-2 h-4 w-4' />
                      {store ? 'Actualizar' : 'Crear tienda'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {store && !isEditing && (
        <div className='grid gap-6 md:grid-cols-2'>
          <Card className="dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label className='text-muted-foreground'>Nombre</Label>
                <p className='font-medium dark:text-white'>{store.name}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Categoría</Label>
                <p className='font-medium dark:text-white'>{store.category?.name}</p>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground'>Apertura</Label>
                  <p className='font-medium dark:text-white'>{store.ha || 'No definido'}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Cierre</Label>
                  <p className='font-medium dark:text-white'>{store.hc || 'No definido'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label className='text-muted-foreground mb-2 block'>
                  Imagen de perfil
                </Label>
                <div className='w-32 h-32 rounded-lg overflow-hidden border dark:border-slate-700'>
                  <img
                    src={store.image}
                    alt={store.name}
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>
              {store.coverImage && (
                <div>
                  <Label className='text-muted-foreground mb-2 block'>
                    Imagen de portada
                  </Label>
                  <div className='w-full h-40 rounded-lg overflow-hidden border dark:border-slate-700'>
                    <img
                      src={store.coverImage}
                      alt='Cover'
                      className='w-full h-full object-cover'
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
