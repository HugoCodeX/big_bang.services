'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Calendar,
  DollarSign,
  Hash,
  Loader2,
  MessageSquare,
  Phone,
  Tag,
  User,
  Wrench,
  X,
} from 'lucide-react'
import {
  formatDateTimeInChile,
  formatOrderNumber,
  type CampoCustom,
  type EstadoEquipo,
  type Mantenimiento,
} from '@/lib/equipos'
import { fetchEquipoDetail } from '@/app/actions/equipos'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { cn } from '@/lib/utils'

export interface EquipoDetailData {
  id: number
  tipo: string
  marca: string | null
  cliente: string
  telefono: string
  precio: string | null
  comentarios: string
  estado: EstadoEquipo
  fechaIngreso: Date
  mantenimientos: Mantenimiento[]
  camposCustom: CampoCustom[]
}

function FieldRow({
  label,
  value,
  icon: Icon,
  multiline = false,
}: {
  label: string
  value: string | null | undefined
  icon: React.ComponentType<{ className?: string }>
  multiline?: boolean
}) {
  const hasValue = Boolean(value && value.trim())
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        <Icon className="size-3" aria-hidden />
        {label}
      </div>
      <p
        className={cn(
          'text-sm text-card-foreground',
          !hasValue && 'italic text-muted-foreground',
          multiline && 'whitespace-pre-wrap',
        )}
      >
        {hasValue ? value : '—'}
      </p>
    </div>
  )
}

export function VerDetallesModal({
  open,
  onOpenChange,
  equipoId,
  onEdit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipoId: number | null
  onEdit?: (data: EquipoDetailData) => void
}) {
  const [data, setData] = useState<EquipoDetailData | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || equipoId === null) {
      return
    }
    startTransition(async () => {
      const result = await fetchEquipoDetail(equipoId)
      if (!result) {
        setError('No se encontró el equipo.')
        return
      }
      setError(null)
      setData(result as EquipoDetailData)
    })
  }, [open, equipoId])

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(() => {
        setData(null)
        setError(null)
      }, 200)
      return () => window.clearTimeout(t)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup aria-label="Detalle del equipo" className="max-w-2xl">
          <DialogHeader>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>
                {data
                  ? `Orden ${formatOrderNumber(data.id)}`
                  : 'Detalle del equipo'}
              </DialogTitle>
              <DialogDescription>
                Información completa registrada al ingreso.
              </DialogDescription>
            </div>
            <DialogClose
              className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </DialogClose>
          </DialogHeader>

          {error ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : isPending || !data ? (
            <div className="flex items-center justify-center px-6 py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-6 px-6 py-5">
              <section
                aria-label="Datos del ingreso"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <FieldRow
                  label="N° de orden"
                  value={formatOrderNumber(data.id)}
                  icon={Hash}
                />
                <FieldRow
                  label="Estado"
                  value={data.estado}
                  icon={Wrench}
                />
                <FieldRow
                  label="Cliente"
                  value={data.cliente}
                  icon={User}
                />
                <FieldRow
                  label="Teléfono"
                  value={data.telefono}
                  icon={Phone}
                />
                <FieldRow
                  label="Precio"
                  value={data.precio}
                  icon={DollarSign}
                />
                <FieldRow
                  label="Tipo de equipo"
                  value={data.tipo}
                  icon={Wrench}
                />
                {data.marca ? (
                  <FieldRow
                    label="Marca"
                    value={data.marca}
                    icon={Wrench}
                  />
                ) : null}
                <div className="sm:col-span-2">
                  <FieldRow
                    label="Fecha de ingreso"
                    value={formatDateTimeInChile(data.fechaIngreso)}
                    icon={Calendar}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldRow
                    label="Comentarios"
                    value={data.comentarios}
                    icon={MessageSquare}
                    multiline
                  />
                </div>
              </section>

              <div className="h-px bg-border" />

              <section aria-label="Estado actual" className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-card-foreground">
                  Estado actual
                </h3>
                <div>
                  <StatusBadge estado={data.estado} />
                </div>
              </section>

              {data.camposCustom.length > 0 ? (
                <>
                  <div className="h-px bg-border" />

                  <section
                    aria-label="Items personalizados"
                    className="flex flex-col gap-3"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-card-foreground">
                        Items personalizados
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Datos adicionales cargados a esta orden.
                      </p>
                    </div>
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {data.camposCustom.map((c) => (
                        <div
                          key={c.id}
                          className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/40 p-3"
                        >
                          <dt className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                            <Tag className="size-3" aria-hidden />
                            {c.titulo}
                          </dt>
                          <dd className="whitespace-pre-wrap text-sm text-card-foreground">
                            {c.descripcion.trim() || '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                </>
              ) : null}

              <div className="h-px bg-border" />

              <section
                aria-label="Historial de mantenimientos"
                className="flex flex-col gap-3"
              >
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    Mantenimientos realizados
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Historial de trabajos asociados a este equipo.
                  </p>
                </div>

                {data.mantenimientos.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                    Sin mantenimientos registrados.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2" role="list">
                    {data.mantenimientos.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-col gap-1.5 rounded-lg border border-border bg-secondary/40 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Wrench
                              className="size-3.5 text-muted-foreground"
                              aria-hidden
                            />
                            <span className="text-sm font-medium text-card-foreground">
                              {m.tipo}
                            </span>
                            {m.componente ? (
                              <span className="rounded bg-card px-1.5 py-0.5 text-xs text-muted-foreground">
                                {m.componente}
                              </span>
                            ) : null}
                          </div>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="size-3" aria-hidden />
                            {formatDateTimeInChile(m.fecha)}
                          </span>
                        </div>
                        {m.observacion ? (
                          <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                            {m.observacion}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            {data && onEdit ? (
              <Button
                type="button"
                onClick={() => {
                  onEdit(data)
                  onOpenChange(false)
                }}
              >
                <Wrench className="size-4" />
                Editar
              </Button>
            ) : null}
          </DialogFooter>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
