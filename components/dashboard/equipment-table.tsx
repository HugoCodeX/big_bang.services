'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Gamepad2,
  Laptop,
  Monitor,
  Pencil,
  Phone,
  Search,
  Smartphone,
} from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/status-badge'
import {
  EditEquipoModal,
  type EquipoEditData,
} from '@/components/dashboard/edit-equipo-modal'
import {
  VerDetallesModal,
  type EquipoDetailData,
} from '@/components/dashboard/ver-detalles-modal'
import { formatOrderNumber, type Equipo } from '@/lib/equipos'
import { fetchEquipoDetail } from '@/app/actions/equipos'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 10

function TipoIcon({ tipo }: { tipo: string }) {
  const cls = 'size-4 shrink-0 text-muted-foreground'
  if (tipo === 'Notebook' || tipo === 'MacBook Air' || tipo === 'MacBook Pro')
    return <Laptop className={cls} />
  if (tipo === 'PC Escritorio' || tipo === 'Mac Escritorio')
    return <Monitor className={cls} />
  if (tipo === 'iPhone' || tipo === 'Android')
    return <Smartphone className={cls} />
  return <Gamepad2 className={cls} />
}

function PhoneCell({ telefono }: { telefono: string }) {
  if (!telefono.trim()) {
    return <span className="italic text-muted-foreground">—</span>
  }
  const telHref = `tel:${telefono.replace(/[^\d+]/g, '')}`
  return (
    <a
      href={telHref}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-card-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded"
    >
      <Phone className="size-3.5 text-muted-foreground" aria-hidden />
      {telefono}
    </a>
  )
}

export function EquipmentTable({
  initialEquipos,
}: {
  initialEquipos: Equipo[]
}) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<EquipoEditData | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsId, setDetailsId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return initialEquipos
    return initialEquipos.filter(
      (e) =>
        e.cliente.toLowerCase().includes(q) ||
        e.tipo.toLowerCase().includes(q) ||
        (e.marca ?? '').toLowerCase().includes(q) ||
        e.comentarios.toLowerCase().includes(q) ||
        e.telefono.toLowerCase().includes(q) ||
        formatOrderNumber(e.id).toLowerCase().includes(q),
    )
  }, [initialEquipos, search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentPage = Math.min(page, totalPages || 1)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleOpenDetails(id: number) {
    setDetailsId(id)
    setDetailsOpen(true)
  }

  function handleOpenEdit(data: EquipoDetailData) {
    setEditing(data)
    setEditOpen(true)
  }

  function handleDirectEdit(equipo: Equipo) {
    startTransition(async () => {
      const data = await fetchEquipoDetail(equipo.id)
      if (data) {
        setEditing(data)
        setEditOpen(true)
      }
    })
  }

  const empty = paginated.length === 0

  return (
    <>
      <section
        aria-label="Equipos registrados"
        className="rounded-lg border border-border bg-card"
      >
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-card-foreground">
              Equipos en servicio
            </h2>
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? 'equipo' : 'equipos'}
            </p>
          </div>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar cliente, equipo, teléfono u orden…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              aria-label="Buscar equipos"
            />
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Lista de equipos registrados en servicio técnico
            </caption>
            <thead>
              <tr className="border-b border-border text-left">
                <th
                  scope="col"
                  className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Orden
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Equipo
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Teléfono
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Precio
                </th>
                <th
                  scope="col"
                  className="px-5 py-3 text-right font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {empty ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-muted-foreground"
                  >
                    No se encontraron equipos.
                  </td>
                </tr>
              ) : (
                paginated.map((equipo) => (
                  <tr
                    key={equipo.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {formatOrderNumber(equipo.id)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 font-medium text-card-foreground">
                        <TipoIcon tipo={equipo.tipo} />
                        <span>
                          {equipo.tipo}
                          {equipo.marca ? (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              · {equipo.marca}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-card-foreground">
                      {equipo.cliente || (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <PhoneCell telefono={equipo.telefono} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge estado={equipo.estado} />
                    </td>
                    <td className="px-5 py-3.5">
                      {equipo.precio ? (
                        <span className="font-mono text-xs text-card-foreground">
                          {equipo.precio}
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(equipo.id)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          aria-label={`Ver detalles de la orden ${formatOrderNumber(equipo.id)}`}
                        >
                          <Eye className="size-3.5" aria-hidden />
                          Ver detalles
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectEdit(equipo)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          aria-label={`Editar la orden ${formatOrderNumber(equipo.id)}`}
                        >
                          <Pencil className="size-3.5" aria-hidden />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-border md:hidden" role="list">
          {empty ? (
            <li className="px-5 py-12 text-center text-sm text-muted-foreground">
              No se encontraron equipos.
            </li>
          ) : (
            paginated.map((equipo) => (
              <li
                key={equipo.id}
                className="flex flex-col gap-2 px-5 py-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium text-card-foreground">
                    <TipoIcon tipo={equipo.tipo} />
                    <span>
                      {equipo.tipo}
                      {equipo.marca ? (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          · {equipo.marca}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatOrderNumber(equipo.id)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge estado={equipo.estado} />
                    {equipo.precio ? (
                      <span className="font-mono text-xs text-card-foreground">
                        {equipo.precio}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {equipo.cliente || '—'}
                  </span>
                </div>
                {equipo.telefono ? (
                  <a
                    href={`tel:${equipo.telefono.replace(/[^\d+]/g, '')}`}
                    className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-xs text-card-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <Phone className="size-3.5 text-muted-foreground" aria-hidden />
                    {equipo.telefono}
                  </a>
                ) : null}
                <div className="flex items-center justify-end gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(equipo.id)}
                    className="inline-flex h-9 min-w-11 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    aria-label={`Ver detalles de la orden ${formatOrderNumber(equipo.id)}`}
                  >
                    <Eye className="size-3.5" aria-hidden />
                    Ver detalles
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDirectEdit(equipo)}
                    className="inline-flex h-9 min-w-11 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    aria-label={`Editar la orden ${formatOrderNumber(equipo.id)}`}
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Editar
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      <VerDetallesModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        equipoId={detailsId}
        onEdit={handleOpenEdit}
      />

      <EditEquipoModal
        open={editOpen}
        onOpenChange={setEditOpen}
        equipo={editing}
      />
    </>
  )
}
