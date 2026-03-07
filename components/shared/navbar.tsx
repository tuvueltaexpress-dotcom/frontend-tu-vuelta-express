"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/use-theme";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Sun, Moon, Store } from "lucide-react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/tiendas", label: "Tiendas" },
  { href: "/contacto", label: "Contacto" },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [cartCount] = useState(0);

  return (
    <>
      <header className="hidden md:block sticky top-0 z-50 w-full border-b border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-6 lg:px-12">
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
                <Store className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tu Vuelta Express
              </span>
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="cursor-pointer p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Cambiar tema"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
                  {cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="w-full border-b border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 py-4 md:hidden">
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-white shadow-sm">
                <Store className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Tu Vuelta Express
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
