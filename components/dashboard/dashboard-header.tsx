'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NuevoIngresoModal } from '@/components/dashboard/nuevo-ingreso-modal'

export function DashboardHeader() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
          Resumen del servicio técnico
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado general de los equipos ingresados para mantenimiento y
          reparación.
        </p>
      </div>
      <Button
        size="lg"
        className="shrink-0"
        onClick={() => setModalOpen(true)}
      >
        <Plus className="size-4" />
        Nuevo ingreso
      </Button>
      <NuevoIngresoModal open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  )
}
