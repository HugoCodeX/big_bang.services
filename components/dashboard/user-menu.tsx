'use client'

import { LogOut, Mail, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { signOut, useSession } from '@/lib/auth-client'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function UserMenu() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-secondary" />
  }

  if (!session) return null

  const user = session.user
  const initials = getInitials(user.name)

  async function handleSignOut() {
    await signOut()
    router.push('/auth/iniciar-sesion')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-label="Menú de usuario"
      >
        <Avatar className="size-9 border border-border">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuPositioner align="end" sideOffset={8}>
        <DropdownMenuContent>
          <div className="flex items-center gap-3 px-2.5 py-2">
            <Avatar className="size-9 border border-border">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-popover-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Cuenta</DropdownMenuLabel>
          <DropdownMenuItem className="text-muted-foreground" disabled>
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/dashboard/configuracion')}>
            <Settings className="size-4 shrink-0" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
          >
            <LogOut className="size-4 shrink-0" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPositioner>
    </DropdownMenu>
  )
}
