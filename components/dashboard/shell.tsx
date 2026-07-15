'use client'

import { useState } from 'react'
import { Navbar } from '@/components/dashboard/navbar'
import { Sidebar } from '@/components/dashboard/sidebar'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div
        className={`flex min-h-dvh flex-col transition-[padding] duration-300 ease-in-out motion-reduce:transition-none ${
          collapsed ? 'lg:pl-16' : 'lg:pl-64'
        }`}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main id="main-content" className="flex-1 p-4 md:p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
