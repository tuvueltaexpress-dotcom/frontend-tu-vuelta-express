"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/shared/navbar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { useSearch } from "@/components/shared/search-context";

function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSearchActive } = useSearch();
  
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/partners');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className={`${isSearchActive ? 'search-blur' : ''}`}>
        {children}
      </div>
      <BottomNav />
    </>
  );
}

export { NavbarWrapper };
