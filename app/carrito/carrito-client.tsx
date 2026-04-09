"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MapPin, ChevronDown, Minus, Plus, X, ShoppingBag, MessageSquare, Check, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore';
import { publicApi } from '@/lib/api';
import type { DeliveryOption } from '@/lib/api';

interface DeliveryOptionWithPrice extends DeliveryOption {
  price: number;
}

interface CarritoClientProps {
  deliveryOptions: DeliveryOption[];
}

export function CarritoClient({ deliveryOptions: initialDeliveryOptions }: CarritoClientProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total);
  const [instructions, setInstructions] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(initialDeliveryOptions);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOptionWithPrice | null>(null);
  const [expandedStore, setExpandedStore] = useState<number | null>(
    items.length > 0 ? items[0].storeId : null
  );

  useEffect(() => {
    const loadDeliveryOptions = async () => {
      if (items.length > 0) {
        const storeId = items[0].storeId;
        try {
          const response = await publicApi.deliveryOptions.getByStore(storeId);
          const options = response.data || response;
          setDeliveryOptions(options);
          if (options.length > 0 && !selectedDelivery) {
            setSelectedDelivery({
              ...options[0],
              price: Number(options[0].price) || Number(options[0].fee) || 0,
            });
          }
        } catch {
          setDeliveryOptions([]);
        }
      }
    };
    loadDeliveryOptions();
  }, [items.length, items[0]?.storeId]);

  const stores = [...new Map(items.map(item => [item.storeId, item])).values()].map(
    item => item.storeId
  );

  const getStoreItems = (storeId: number) => items.filter(i => i.storeId === storeId);
  const getStoreName = (storeId: number) => items.find(i => i.storeId === storeId)?.storeName || '';

  const deliveryPrice = selectedDelivery?.price || 0;
  const productsTotal = total();
  const finalTotal = productsTotal + deliveryPrice;

  const handleWhatsAppOrder = () => {
    const phone = '593999999999';
    let message = `*Nuevo Pedido - Tu Vuelta Express*\n\n`;
    
    if (selectedDelivery) {
      message += `*Delivery:* ${selectedDelivery.name} - $${deliveryPrice.toFixed(2)}\n\n`;
    }
    
    stores.forEach((storeId) => {
      const storeItems = getStoreItems(storeId);
      const storeName = getStoreName(storeId);
      message += `*Tienda: ${storeName}*\n`;
      storeItems.forEach((item) => {
        message += `• ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
      });
      message += '\n';
    });
    
    message += `*Total productos:* $${productsTotal.toFixed(2)}\n`;
    message += `*Total envío:* $${deliveryPrice.toFixed(2)}\n`;
    message += `*Total a pagar:* $${finalTotal.toFixed(2)}\n\n`;
    
    if (instructions.trim()) {
      message += `*Instrucciones:* ${instructions}\n\n`;
    }
    
    message += `Cliente: [Nombre del cliente]`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleSelectDelivery = (option: DeliveryOption) => {
    setSelectedDelivery({
      ...option,
      price: Number(option.price) || Number(option.fee) || 0,
    });
    setShowDeliveryModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f8] dark:bg-[#0f0f23] pb-32 lg:pb-12">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f23]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:bg-white lg:dark:bg-[#0f0f23]">
        <div className="flex items-center p-3 sm:p-4 justify-between max-w-7xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="hidden lg:flex items-center gap-6 flex-1">
            <h1 className="text-3xl font-black tracking-tight">Tu Carrito</h1>
            <button 
              onClick={() => setShowDeliveryModal(true)}
              className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              <MapPin className="h-5 w-5 text-sky-700" />
              {selectedDelivery ? selectedDelivery.name : 'Elegir zona'}
              {selectedDelivery && selectedDelivery.price > 0 && ` - $${selectedDelivery.price.toFixed(2)}`}
            </button>
          </div>
          <h1 className="text-lg font-bold flex-1 text-center lg:hidden">Tu Carrito</h1>
          <button 
            onClick={() => router.back()}
            className="hidden lg:flex items-center gap-2 text-sky-700 font-semibold hover:underline"
          >
            <ArrowLeft className="h-5 w-5" />
            Seguir comprando
          </button>
          <div className="size-10 lg:hidden"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-12 pb-28 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          <div className="flex-1 space-y-6 lg:space-y-10 w-full">
            <button 
              onClick={() => setShowDeliveryModal(true)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold py-3 sm:py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-between transition-all active:scale-[0.98] lg:hidden"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="h-5 w-5 text-sky-700" />
                <span className="text-sm sm:text-base">
                  {selectedDelivery ? selectedDelivery.name : 'Elegir zona'}
                  {selectedDelivery && selectedDelivery.price > 0 && ` - $${selectedDelivery.price.toFixed(2)}`}
                </span>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </button>

            {items.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
                <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">Tu carrito está vacío</p>
                <Link href="/">
                  <Button className="bg-sky-700 hover:bg-sky-800 text-white">
                    Ver tiendas
                  </Button>
                </Link>
              </div>
            ) : (
              stores.map((storeId) => {
                const storeItems = getStoreItems(storeId);
                const storeName = getStoreName(storeId);
                const isExpanded = expandedStore === storeId;
                
                return (
                  <section 
                    key={storeId}
                    className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden lg:border lg:rounded-xl"
                  >
                    <button
                      onClick={() => setExpandedStore(isExpanded ? null : storeId)}
                      className="w-full p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 lg:cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-sky-700 p-2 rounded-lg text-white">
                          <Store className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-sky-700 dark:text-sky-400 leading-tight">
                            {storeName}
                          </h2>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-sky-700 transition-transform lg:hidden ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {storeItems.map((item) => (
                        <div key={item.id} className="p-4 lg:p-6 flex items-center gap-4 lg:gap-6 group">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-slate-100 shadow-sm hidden lg:block"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 lg:text-base">{item.title}</h4>
                            {item.variant && (
                              <p className="text-sm text-slate-500 italic">{item.variant}</p>
                            )}
                            <div className="mt-2 lg:mt-3 flex items-center gap-3 lg:gap-4">
                              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <button 
                                  onClick={() => {
                                    if (item.quantity === 1) {
                                      removeItem(item.productId);
                                    } else {
                                      updateQuantity(item.productId, item.quantity - 1);
                                    }
                                  }}
                                  className="px-2 lg:px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 lg:px-3 py-1 font-bold text-sm min-w-[32px] text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="px-2 lg:px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeItem(item.productId)}
                                className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                              >
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Quitar</span>
                              </button>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-sky-700 dark:text-sky-400">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })
            )}

            {items.length > 0 && (
              <div className="space-y-3 sm:space-y-4 lg:bg-white lg:dark:bg-slate-900 lg:rounded-xl lg:border lg:border-slate-200 lg:dark:border-slate-800 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Instrucciones de entrega</h3>
                </div>
                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-700 focus:border-transparent transition-all outline-none resize-none placeholder:text-slate-400 p-4"
                  placeholder="Ej: Dejar en portería, el timbre no funciona, llamar al llegar..."
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            )}
          </div>

          {items.length > 0 && (
            <aside className="hidden lg:block w-full lg:w-[400px] shrink-0 lg:sticky lg:top-10">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
                <h3 className="text-xl font-black mb-6 tracking-tight">Resumen del pedido</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Total productos</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">${productsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Costos de envío</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">${deliveryPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="pt-6 mb-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total a pagar</span>
                  <span className="text-2xl font-black text-sky-700 dark:text-sky-400">${finalTotal.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-sky-700 hover:bg-sky-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-sky-700/25 flex items-center justify-center gap-2 group"
                >
                  Confirmar pedido
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </aside>
          )}
        </div>

        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-6 sm:pb-4 pt-3 sm:pt-4 px-3 sm:px-4 z-50 lg:hidden">
            <div className="max-w-lg mx-auto space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2 px-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total productos</span>
                  <span className="font-medium">${productsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total envío</span>
                  <span className="font-medium">${deliveryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-base sm:text-lg font-bold">Total a pagar</span>
                  <span className="text-xl sm:text-2xl font-bold text-sky-700 dark:text-sky-400">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={handleWhatsAppOrder}
                className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-3.5 sm:py-4 rounded-xl shadow-lg shadow-sky-700/30 flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
              >
                Confirmar pedido
              </Button>
            </div>
          </div>
        )}
      </main>

      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center md:items-center justify-center" onClick={() => setShowDeliveryModal(false)}>
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl md:rounded-2xl max-h-[80vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Elegir zona de entrega
              </h2>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
              {deliveryOptions.length === 0 ? (
                <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                  No hay opciones de delivery disponibles
                </p>
              ) : (
                deliveryOptions.map((option) => {
                  const price = Number(option.price) || Number(option.fee) || 0;
                  const isSelected = selectedDelivery?.id === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectDelivery(option)}
                      className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'border-sky-700 bg-sky-50 dark:bg-sky-900/30' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={`h-5 w-5 ${isSelected ? 'text-sky-700' : 'text-slate-400'}`} />
                        <div className="text-left">
                          <p className="font-semibold text-slate-900 dark:text-white">{option.name}</p>
                          {option.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {price > 0 ? (
                          <span className="font-bold text-sky-700 dark:text-sky-400">${price.toFixed(2)}</span>
                        ) : (
                          <span className="font-bold text-green-600">Gratis</span>
                        )}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-sky-700 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
