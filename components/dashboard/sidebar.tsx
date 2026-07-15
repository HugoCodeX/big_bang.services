'use client'

import {
  ChevronLeft,
  Wrench,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navPrincipal = [
  { label: 'Equipos', icon: Wrench, href: '/dashboard', active: true },
]

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar',
          'motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-in-out',
          collapsed ? 'w-16' : 'w-64',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navegación principal"
      >
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-2">
          <div
            className={cn(
              'flex w-full items-center',
              collapsed ? 'justify-center' : 'justify-between',
            )}
          >
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5"
                aria-label={collapsed ? 'big_bang.services' : undefined}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
                  <Wrench className="size-4 text-primary-foreground" />
                </div>
                {!collapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight text-sidebar-foreground">
                      big_bang.services
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Panel Admin
                    </span>
                  </div>
                )}
              </Link>
            </div>
            {!collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Colapsar panel"
                aria-label="Colapsar panel"
                className="hidden cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:block"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
                aria-label="Cerrar menú"
              >
                <X className="size-4" />
              </button>
            )}
            {collapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Expandir panel"
                aria-label="Expandir panel"
                className="absolute top-5 right-[-12px] hidden size-6 cursor-pointer items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:flex"
              >
                <ChevronLeft className="size-3.5 rotate-180" />
              </button>
            )}
          </div>
        </div>

        <nav
          className={cn(
            'flex flex-1 flex-col gap-6 overflow-y-auto py-5',
            collapsed ? 'px-2' : 'px-3',
          )}
        >
          <div className="flex flex-col gap-1">
            {!collapsed && (
              <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                General
              </p>
            )}
            {navPrincipal.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group relative flex cursor-pointer items-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40',
                  collapsed ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2',
                  item.active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )}
                aria-current={item.active ? 'page' : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                {item.active && !collapsed && (
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-primary"
                  />
                )}
                <item.icon
                  className={cn(
                    'size-4 shrink-0 transition-colors',
                    item.active
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-sidebar-accent-foreground',
                  )}
                />
                {!collapsed && item.label}
              </Link>
            ))}
          </div>
        </nav>

      </aside>
    </>
  )
}
