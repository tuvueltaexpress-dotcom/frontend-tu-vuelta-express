'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/lib/use-auth';
import { Sidebar, AdminHeader } from '@/components/admin/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background dark:bg-slate-950">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          expanded={sidebarExpanded}
        />
        <div className={sidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'}>
          <AdminHeader 
            onMenuClick={() => setSidebarOpen(true)} 
            onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
            sidebarExpanded={sidebarExpanded}
          />
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
