"use client";

import Link from "next/link";
import { useTheme } from "@/lib/use-theme";
import { Home, ShoppingCart, Moon, Sun, Search } from "lucide-react";
import { useState } from "react";

export function BottomNav() {
  const { theme, toggleTheme } = useTheme();
  const [cartCount] = useState(3);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 md:hidden pb-safe">
      <div className="flex items-center h-16 w-full max-w-md mx-auto px-2">
        <Link href="/" className="flex flex-col items-center justify-center gap-1 text-slate-900 dark:text-white flex-1 h-full">
          <Home className="h-6 w-6 fill-current" />
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        
        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800"></div>
        
        <button className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 flex-1 h-full relative cursor-pointer">
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-700 text-[9px] font-bold text-white">
              {cartCount}
            </span>
          </div>
          <span className="text-[10px] font-medium">Carrito</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800"></div>
        
        <button 
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 dark:text-slate-500 flex-1 h-full cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-6 w-6" />
          ) : (
            <Moon className="h-6 w-6" />
          )}
          <span className="text-[10px] font-medium">Tema</span>
        </button>
      </div>
    </nav>
  );
}
