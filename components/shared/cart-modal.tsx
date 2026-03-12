"use client";

import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/useCartStore';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore((s) => s.total);

  const handleWhatsAppOrder = () => {
    const phone = '593999999999';
    let message = `*Nuevo Pedido - Tu Vuelta Express*\n\n`;
    
    const stores = [...new Set(items.map((i) => i.storeId))];
    
    stores.forEach((storeId) => {
      const storeItems = items.filter((i) => i.storeId === storeId);
      const storeName = storeItems[0].storeName;
      message += `*Tienda: ${storeName}*\n`;
      storeItems.forEach((item) => {
        message += `• ${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
      });
      message += '\n';
    });
    
    message += `*Total: $${total().toFixed(2)}*\n\n`;
    message += `Cliente: [Nombre del cliente]`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-2xl md:rounded-2xl max-h-[80vh] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Tu Carrito
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Tu carrito está vacío
              </p>
              <Button
                onClick={onClose}
                variant="outline"
              >
                Ver tiendas
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <img
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                    src={item.image}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.storeName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg">
                        <button
                          onClick={() => {
                            if (item.quantity === 1) {
                              removeItem(item.productId);
                            } else {
                              updateQuantity(item.productId, item.quantity - 1);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          {item.quantity === 1 ? (
                            <X className="h-3 w-3 text-red-500" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-bold text-sky-700 dark:text-sky-400">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-slate-900 dark:text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-sky-700 dark:text-sky-400">
                ${total().toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleWhatsAppOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              Pedir por WhatsApp
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
