"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, X, Store, Package, ArrowRight } from "lucide-react";
import { publicApi, type SearchResult, type Store as StoreType, type Product } from "@/lib/api";

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await publicApi.search(searchQuery, "all", 1, 10);
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        search(query);
      }, 300);
    } else {
      setResults(null);
      setIsLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, search]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasQuery = query.trim().length > 0;
  const stores = results?.stores ?? [];
  const products = results?.products ?? [];
  const hasStores = stores.length > 0;
  const hasProducts = products.length > 0;
  const hasResults = hasQuery && (hasStores || hasProducts);

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative flex flex-col items-center pt-20 px-4">
        <div className="w-full max-w-2xl">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar tiendas y productos..."
                className="flex-1 bg-transparent text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
              />
              {isLoading && (
                <div className="h-5 w-5 border-2 border-slate-300 border-t-sky-600 rounded-full animate-spin" />
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!hasQuery ? (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Escribe para buscar tiendas y productos
                  </p>
                </div>
              ) : !hasResults && !isLoading ? (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No se encontraron resultados para &quot;{query}&quot;
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  {hasStores && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Store className="h-4 w-4 text-sky-600" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Tiendas
                        </h3>
                        <span className="text-xs text-slate-500">
                          ({results?.pagination.stores.total ?? 0})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {stores.map((store) => (
                          <Link
                            key={store.id}
                            href={`/aliados/${store.id}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                          >
                            <img
                              src={store.image}
                              alt={store.name}
                              className="h-12 w-12 rounded-lg object-cover bg-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {store.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {store.category?.name}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {hasProducts && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Productos
                        </h3>
                        <span className="text-xs text-slate-500">
                          ({results?.pagination.products.total ?? 0})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {products.map((product) => (
                          <Link
                            key={product.id}
                            href={`/aliados/${product.storeId}`}
                            onClick={onClose}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="h-12 w-12 rounded-lg object-cover bg-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {product.title}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                {product.store?.name}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-sky-600 shrink-0">
                              ${product.price.toFixed(2)}
                            </p>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Presiona ESC para cerrar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
