'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Share2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, type CartItem } from '@/stores/useCartStore';
import type { Store, Product, ProductCategory } from '@/lib/api';

interface StoreDetailClientProps {
  store: Store;
  products: Product[];
  categories: ProductCategory[];
  isOpen: boolean;
}

export function StoreDetailClient({
  store,
  products,
  categories,
  isOpen,
}: StoreDetailClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clear);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExitModal, setShowExitModal] = useState(false);

  const hasItemsFromOtherStore =
    items.length > 0 && items.some((i) => i.storeId !== store.id);

  const handleExitConfirm = () => {
    clearCart();
    setShowExitModal(false);
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const filteredProducts = products
    .filter(
      (p) => selectedCategory === null || p.categoryId === selectedCategory,
    )
    .filter(
      (p) =>
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const handleAddToCart = (product: Product) => {
    if (hasItemsFromOtherStore) {
      setShowExitModal(true);
      return;
    }

    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '/placeholder.png',
      storeId: store.id,
      storeName: store.name,
    };
    addItem(cartItem);
  };

  const getItemQuantity = (productId: number) => {
    const item = items.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const handleWhatsAppOrder = () => {
    const phone = '+584124676968';
    let message = `*Nuevo Pedido - Tu Vuelta Express*\n\n`;

    const storeItems = items.filter((i) => i.storeId === store.id);
    storeItems.forEach((item) => {
      message += `• ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Total: $${total().toFixed(2)}*\n\n`;
    message += `Tienda: ${store.name}\n`;
    message += `Cliente: [Nombre del cliente]`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className='min-h-screen bg-[#f5f5f8] dark:bg-[#0f0f23] pb-24 md:pb-8'>
      <nav className='sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f23]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800'>
        <button
          onClick={() => router.back()}
          className='flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <h1 className='text-base font-bold tracking-tight text-center flex-1 truncate px-2'>
          {store.name}
        </h1>
        <div className='flex gap-2'>
          <button className='flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'>
            <Share2 className='h-5 w-5' />
          </button>
        </div>
      </nav>

      <header className='relative w-full h-48 sm:h-56 md:h-64 lg:h-80 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10'></div>
        <img
          alt={`Fondo ${store.name}`}
          className='w-full h-full object-cover'
          src={store.coverImage || store.image}
        />
        <div className='absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 z-20 flex items-end gap-3 sm:gap-4'>
          <div className='w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl md:rounded-2xl bg-white p-1 shadow-xl shrink-0 overflow-hidden'>
            <img
              alt={`Logo ${store.name}`}
              className='w-full h-full object-cover rounded-lg md:rounded-xl'
              src={store.image}
            />
          </div>
          <div className='mb-0.5 text-white flex-1 min-w-0'>
            <h2 className='text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold leading-tight truncate'>
              {store.name}
            </h2>
            {store.category && (
              <p className='text-xs sm:text-sm md:text-lg text-white/80 font-medium truncate'>
                {store.category.name}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className='p-3 sm:p-4'>
        <div className='relative group'>
          <div className='absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-slate-400'>
            <Search className='h-4 w-4 sm:h-5 sm:w-5' />
          </div>
          <input
            className='w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border-none rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-sky-600 outline-none transition-all placeholder:text-slate-400 shadow-sm text-sm'
            placeholder={`Buscar en ${store.name}...`}
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <div className='sticky top-[52px] sm:top-[56px] z-40 bg-[#f5f5f8] dark:bg-[#0f0f23] border-b border-slate-200 dark:border-slate-800'>
        <div className='flex overflow-x-auto no-scrollbar px-3 sm:px-4'>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'border-sky-700 text-sky-700 dark:text-sky-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'border-sky-700 text-sky-700 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <section className='p-3 sm:p-4 md:py-6 md:px-4 lg:px-8 max-w-7xl mx-auto pt-16 md:pt-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'>
          {filteredProducts.map((product) => {
            const quantity = getItemQuantity(product.id);
            return (
              <Link
                href={`/productos/${product.slug || product.id}`}
                key={product.id}
                className='group bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-300 cursor-pointer flex flex-col'
              >
                <div className='relative h-36 sm:h-40 md:h-48 overflow-hidden'>
                  <img
                    alt={product.title}
                    className='w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-500'
                    src={product.images?.[0] || '/placeholder.png'}
                  />
                  <div className='absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-1 rounded-lg text-sky-700 dark:text-sky-400 font-bold shadow-sm text-sm sm:text-base'>
                    ${product.price.toFixed(2)}
                  </div>
                </div>
                <div className='p-3 sm:p-4 md:p-5 flex-1 flex flex-col'>
                  <h4 className='text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors mb-1 sm:mb-2 line-clamp-2'>
                    {product.title}
                  </h4>
                  <p className='text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 sm:mb-4 flex-1'>
                    {product.description || 'Delicioso producto'}
                  </p>
                  <Button
                    size='sm'
                    className='w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-2 sm:py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 shadow-lg shadow-sky-700/20 text-xs sm:text-sm'
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                    disabled={isOpen ? false : true}
                  >
                    <ShoppingCart className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                    {isOpen ? 'Agregar' : 'Cerrado'}
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {showExitModal && (
        <div
          className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6'
          onClick={handleExitCancel}
        >
          <div
            className='w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='p-8 text-center'>
              <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30'>
                <AlertTriangle className='h-8 w-8 text-orange-600 dark:text-orange-400' />
              </div>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight'>
                ¿Deseas vaciar tu carrito actual?
              </h2>
              <p className='text-slate-600 dark:text-slate-400 leading-relaxed'>
                Al agregar este producto de una tienda diferente, se eliminarán
                los artículos que ya tienes en tu carrito.
              </p>
            </div>
            <div className='flex flex-col gap-3 p-6 pt-0'>
              <Button
                onClick={handleExitConfirm}
                className='w-full py-4 rounded-xl font-bold text-white bg-sky-700 shadow-lg shadow-sky-700/30 active:scale-95 transition-transform'
              >
                Aceptar
              </Button>
              <Button
                onClick={handleExitCancel}
                className='w-full py-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-transform'
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
