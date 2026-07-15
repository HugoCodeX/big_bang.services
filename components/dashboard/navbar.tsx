'use client'

import { Menu, Moon, Search, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { UserMenu } from '@/components/dashboard/user-menu'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="size-9" />

  const isDark = resolvedTheme === 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/70 px-4 backdrop-blur-xl md:px-6 dark:shadow-[0_1px_0_0_oklch(1_0_0_/_0.04),0_8px_24px_-12px_rgb(0_0_0_/_0.4)]">
      <button
        type="button"
        onClick={onMenuClick}
        className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block" role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar equipo, cliente o N° de orden..."
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          aria-label="Buscar equipos, clientes u órdenes"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 sm:hidden"
          aria-label="Buscar"
        >
          <Search className="size-5" />
        </button>

        <ThemeToggle />

        <UserMenu />
      </div>
    </header>
  )
}
