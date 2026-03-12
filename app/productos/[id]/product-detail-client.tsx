"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Plus, Minus, X, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, type CartItem } from '@/stores/useCartStore';
import type { Product, Store as StoreType } from '@/lib/api';

interface ProductDetailClientProps {
  product: Product;
  store: StoreType | null;
  isOpen: boolean;
}

export function ProductDetailClient({
  product,
  store,
  isOpen,
}: ProductDetailClientProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clear);

  const quantity = items.find((i) => i.productId === product.id)?.quantity || 0;
  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder.png'];

  const hasItemsFromOtherStore = items.length > 0 && items.some((item) => item.storeId !== store?.id);

  const handleAddToCart = () => {
    if (!store) return;
    
    if (hasItemsFromOtherStore) {
      setShowExitModal(true);
      return;
    }

    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: images[0],
      storeId: store.id,
      storeName: store.name,
    };
    addItem(cartItem);
  };

  const handleExitConfirm = () => {
    if (!store) return;
    clearCart();
    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: images[0],
      storeId: store.id,
      storeName: store.name,
    };
    addItem(cartItem);
    setShowExitModal(false);
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleAddWithCheck = () => {
    if (!store) return;
    
    if (hasItemsFromOtherStore) {
      setShowExitModal(true);
      return;
    }

    const cartItem: Omit<CartItem, 'id'> = {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: images[0],
      storeId: store.id,
      storeName: store.name,
    };
    addItem(cartItem);
  };

  const handleWhatsAppOrder = () => {
    const phone = '593999999999';
    let message = `*Nuevo Pedido - Tu Vuelta Express*\n\n`;
    
    items.forEach((item) => {
      message += `• ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Total: $${total().toFixed(2)}*\n\n`;
    message += `Tienda: ${store?.name || 'Varias'}\n`;
    message += `Cliente: [Nombre del cliente]`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f8] dark:bg-[#0f0f23] pb-24 md:pb-8">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f23]/80 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight">Detalle del Producto</h2>
        <button className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Share2 className="h-5 w-5" />
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square md:aspect-[4/3] lg:aspect-square w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800">
              <img
                alt={product.title}
                className="w-full h-full object-cover"
                src={images[activeImageIndex]}
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === activeImageIndex 
                        ? 'border-sky-700 ring-2 ring-sky-700/20' 
                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <img
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      src={img}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4 sm:mb-6">
              {product.category && (
                <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1 sm:mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 sm:mb-4 leading-tight">
                {product.title}
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-sky-700 dark:text-sky-400 mb-4 sm:mb-6">
                ${product.price.toFixed(2)} 
                <span className="text-sm font-normal text-slate-500 ml-1">por unidad</span>
              </p>
              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4 sm:mb-6"></div>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                {product.description || 'Delicioso producto disponible para entrega a domicilio.'}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 sm:mb-4">Cantidad</label>
                <div className="flex items-center w-full sm:w-40 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => {
                      if (quantity === 0) {
                        if (store) handleAddWithCheck();
                      } else if (quantity === 1) {
                        removeItem(product.id);
                      } else {
                        updateQuantity(product.id, quantity - 1);
                      }
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {quantity === 0 ? (
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                  <input 
                    className="w-full bg-transparent border-none text-center font-bold focus:ring-0 text-sm sm:text-base" 
                    type="number" 
                    value={quantity || 1}
                    readOnly
                  />
                  <button 
                    onClick={() => {
                      if (quantity === 0 && store) {
                        handleAddWithCheck();
                      } else {
                        updateQuantity(product.id, quantity + 1);
                      }
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={() => {
                  if (quantity === 0 && store) {
                    handleAddWithCheck();
                  } else if (quantity > 0) {
                    router.push('/carrito');
                  }
                }}
                disabled={!isOpen || !store}
                className="flex-1 bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-all active:scale-95 shadow-lg shadow-sky-700/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                {quantity > 0 
                  ? `Agregado (${quantity})` 
                  : 'Agregar al carrito'
                }
              </Button>
              {quantity > 0 && (
                <Button
                  onClick={() => router.push('/carrito')}
                  variant="outline"
                  className="px-6 sm:px-8 rounded-xl font-bold"
                >
                  Ver Carrito
                </Button>
              )}
            </div>

            {store && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href={`/aliados/${store.slug || store.id}`}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 transition-colors"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      alt={store.name}
                      className="w-full h-full object-cover"
                      src={store.image}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                      {store.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                      {store.category?.name}
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {showExitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={handleExitCancel}>
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                ¿Deseas vaciar tu carrito actual?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Al agregar este producto de una tienda diferente, se eliminarán los artículos que ya tienes en tu carrito.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 pt-0">
              <Button
                onClick={handleExitConfirm}
                className="w-full py-4 rounded-xl font-bold text-white bg-sky-700 shadow-lg shadow-sky-700/30 active:scale-95 transition-transform"
              >
                Aceptar
              </Button>
              <Button
                onClick={handleExitCancel}
                className="w-full py-4 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-transform"
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
