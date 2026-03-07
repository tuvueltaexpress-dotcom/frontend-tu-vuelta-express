"use client";

import { usePathname } from 'next/navigation';
import { Navbar } from "@/components/shared/navbar";
import { BottomNav } from "@/components/shared/bottom-nav";

function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/partners');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <BottomNav />
      {children}
    </>
  );
}

export { NavbarWrapper };
