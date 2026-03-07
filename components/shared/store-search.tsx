"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Store } from "lucide-react";
import { publicApi, type SearchResult } from "@/lib/api";

export function StoreSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult["stores"]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const searchStores = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await publicApi.search(query, "stores", 1, 10);
        setResults(data.stores);
        setIsOpen(true);
      } catch (error) {
        console.error("Error searching stores:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchStores, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input 
          className="w-full h-12 pl-12 pr-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-700 focus:border-transparent transition-all text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400" 
          placeholder="Buscar tiendas..." 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((store) => (
                <Link
                  key={store.id}
                  href={`/tiendas/${store.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    {store.image ? (
                      <img
                        alt={store.name}
                        className="w-full h-full object-cover"
                        src={store.image}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">
                      {store.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {store.category?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No se encontraron tiendas
            </div>
          )}
        </div>
      )}
    </div>
  );
}
