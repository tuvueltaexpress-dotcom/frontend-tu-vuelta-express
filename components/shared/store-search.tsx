"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Store, ShoppingBag, ArrowRight, Clock } from "lucide-react";
import { publicApi, type Store as StoreType, type Product as ProductType } from "@/lib/api";
import { useSearch } from "./search-context";

export function StoreSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    stores: StoreType[];
    products: ProductType[];
  }>({ stores: [], products: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSearchActive } = useSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchActive(isOpen && query.length >= 2);
  }, [isOpen, query, setSearchActive]);

  useEffect(() => {
    const searchAll = async () => {
      if (query.trim().length < 2) {
        if (query.trim().length === 0 && isOpen) {
          try {
            const [storesData, productsData] = await Promise.all([
              publicApi.stores.list(1, 10),
              publicApi.products.list(1, 10)
            ]);
            setResults({ 
              stores: storesData.data, 
              products: productsData.data 
            });
          } catch {
            setResults({ stores: [], products: [] });
          }
        }
        return;
      }

      setIsLoading(true);
      try {
        const data = await publicApi.search(query, "all", 1, 10);
        setResults({ stores: data.stores, products: data.products });
      } catch (error) {
        console.error("Error searching:", error);
        setResults({ stores: [], products: [] });
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchAll, 300);
    return () => clearTimeout(debounce);
  }, [query, isOpen]);

  const handleFocus = async () => {
    setIsOpen(true);
    if (query.trim().length === 0) {
      try {
        const [storesData, productsData] = await Promise.all([
          publicApi.stores.list(1, 10),
          publicApi.products.list(1, 10)
        ]);
        setResults({ 
          stores: storesData.data, 
          products: productsData.data 
        });
      } catch {
        setResults({ stores: [], products: [] });
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults({ stores: [], products: [] });
    setIsOpen(false);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  const hasResults = results.stores.length > 0 || results.products.length > 0;

  return (
    <div ref={containerRef} className="relative w-full group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-sky-700 transition-colors" />
      <input 
        className="w-full h-12 pl-12 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-sky-700 focus:bg-white dark:focus:bg-slate-700 transition-all text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400" 
        placeholder="Buscar productos o tiendas..." 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Buscando...
            </div>
          ) : hasResults ? (
            <div className="max-h-[400px] overflow-y-auto">
              {query.trim().length === 0 && (
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recientes
                </div>
              )}
              {query.trim().length > 0 && (
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Resultados
                </div>
              )}
              
              {results.stores.map((store) => (
                <Link
                  key={`store-${store.id}`}
                  href={`/aliados/${store.slug || store.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group"
                  onClick={handleResultClick}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {store.image ? (
                      <img
                        alt={store.name}
                        className="w-full h-full object-cover"
                        src={store.image}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {store.name}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        Tienda
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {store.category?.name}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-700 transition-colors" />
                </Link>
              ))}

              {results.products.map((product) => (
                <Link
                  key={`product-${product.id}`}
                  href={`/productos/${product.slug || product.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group"
                  onClick={handleResultClick}
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        alt={product.title}
                        className="w-full h-full object-cover"
                        src={product.images[0]}
                      />
                    ) : (
                      <ShoppingBag className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {product.title}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 rounded">
                        Producto
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      En {product.store?.name || 'Tienda'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-700 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
}
