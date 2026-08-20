'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  DollarSign,
  Hash,
  Loader2,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Save,
  Tag,
  Trash2,
  User,
  Wrench,
  X,
} from 'lucide-react'
import {
  formatDateInChile,
  getCurrentDateInChile,
  getCurrentTimeInChile,
  splitDateTimeInChile,
  type CampoCustom,
  type EstadoEquipo,
  type Mantenimiento,
  type TipoMantenimiento,
} from '@/lib/equipos'
import {
  addMantenimiento,
  deleteMantenimiento,
  fetchEquipoDetail,
  updateEquipo,
  updateMantenimiento,
} from '@/app/actions/equipos'
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

const estados: EstadoEquipo[] = [
  'Ingresado',
  'En diagnóstico',
  'En reparación',
  'Esperando repuesto',
  'Listo para retiro',
  'Entregado',
]

const tiposMantenimiento: TipoMantenimiento[] = [
  'Mantenimiento completo',
  'Cambio de pantalla',
  'Reparación de componente',
]

const TELEFONO_CL_PATTERN = /^(\+?56[\s-]*)?9?[\s-]*\d{4}[\s-]*\d{4}$/

export interface EquipoEditData {
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

type MantFormState = {
  tipo: TipoMantenimiento
  componente: string
  observacion: string
  fecha: string
  hora: string
}

const emptyMantForm: MantFormState = {
  tipo: 'Mantenimiento completo',
  componente: '',
  observacion: '',
  fecha: '',
  hora: '',
}

type CampoCustomDraft = {
  id: number
  titulo: string
  descripcion: string
}

function campoDraftFromItem(c: CampoCustom): CampoCustomDraft {
  return { id: c.id, titulo: c.titulo, descripcion: c.descripcion }
}

function mantFromItem(m: Mantenimiento): MantFormState {
  const { fecha, hora } = splitDateTimeInChile(m.fecha)
  return {
    tipo: m.tipo,
    componente: m.componente ?? '',
    observacion: m.observacion,
    fecha,
    hora,
  }
}

export function EditEquipoModal({
  open,
  onOpenChange,
  equipo,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipo: EquipoEditData | null
}) {
  const [estado, setEstado] = useState<EstadoEquipo>('Ingresado')
  const [cliente, setCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [precio, setPrecio] = useState('')
  const [mantForm, setMantForm] = useState<MantFormState>(emptyMantForm)
  const [mantList, setMantList] = useState<Mantenimiento[]>([])
  const [camposCustom, setCamposCustom] = useState<CampoCustomDraft[]>([])
  const [campoFieldErrors, setCampoFieldErrors] = useState<
    Record<number, string | undefined>
  >({})
  const [editingMantId, setEditingMantId] = useState<number | null>(null)
  const [editMantForm, setEditMantForm] = useState<MantFormState>(emptyMantForm)
  const [deletingMantId, setDeletingMantId] = useState<number | null>(null)
  const [pendingDeleteMant, setPendingDeleteMant] =
    useState<Mantenimiento | null>(null)
  const [showNewMantForm, setShowNewMantForm] = useState(false)
  const [mantSectionOpen, setMantSectionOpen] = useState(true)
  const [saving, startSaveTransition] = useTransition()
  const [addingMant, startMantTransition] = useTransition()
  const [updatingMant, startUpdateMantTransition] = useTransition()
  const [deletingMant, startDeleteMantTransition] = useTransition()
  const [refreshing, startRefreshTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    cliente?: string
    telefono?: string
  }>({})
  const [mantFieldErrors, setMantFieldErrors] = useState<{
    componente?: string
  }>({})
  const [editMantFieldErrors, setEditMantFieldErrors] = useState<{
    componente?: string
  }>({})
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const formId = useId()

  useEffect(() => {
    if (open && equipo) {
      setEstado(equipo.estado)
      setCliente(equipo.cliente)
      setTelefono(equipo.telefono)
      setPrecio(equipo.precio ?? '')
      setMantList(equipo.mantenimientos)
      setCamposCustom((equipo.camposCustom ?? []).map(campoDraftFromItem))
      setCampoFieldErrors({})
      setMantForm({
        ...emptyMantForm,
        fecha: getCurrentDateInChile(),
        hora: getCurrentTimeInChile(),
      })
      setEditingMantId(null)
      setDeletingMantId(null)
      setPendingDeleteMant(null)
      setShowNewMantForm(false)
      setMantSectionOpen(true)
      setFormError(null)
      setFieldErrors({})
      setMantFieldErrors({})
      setEditMantFieldErrors({})
      setConfirmDiscard(false)
    }
  }, [open, equipo])

  if (!equipo) return null

  const isDirty =
    cliente !== equipo.cliente ||
    telefono !== equipo.telefono ||
    (precio.trim() || null) !== (equipo.precio ?? null) ||
    estado !== equipo.estado ||
    JSON.stringify(camposCustom) !==
      JSON.stringify((equipo.camposCustom ?? []).map(campoDraftFromItem))

  function validateBasic() {
    const errors: { cliente?: string; telefono?: string } = {}
    if (telefono.trim() && !TELEFONO_CL_PATTERN.test(telefono.trim())) {
      errors.telefono = 'Formato chileno: +56 9 1234 5678'
    }
    setFieldErrors(errors)
    return errors
  }

  function validateCampos() {
    const errors: Record<number, string | undefined> = {}
    const kept = camposCustom.filter(
      (c) => c.titulo.trim() || c.descripcion.trim(),
    )
    for (const c of kept) {
      if (!c.titulo.trim()) {
        errors[c.id] = 'Indicá un título para el item.'
      }
    }
    setCampoFieldErrors(errors)
    return errors
  }

  function requestClose() {
    if (saving || addingMant || updatingMant || deletingMant) return
    if (confirmDiscard) {
      setConfirmDiscard(false)
      return
    }
    if (isDirty) {
      setConfirmDiscard(true)
      return
    }
    onOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      onOpenChange(true)
      return
    }
    requestClose()
  }

  function handleSaveEstado() {
    if (!equipo) return
    const errors = validateBasic()
    const campoErrors = validateCampos()
    if (Object.keys(errors).length > 0 || Object.keys(campoErrors).length > 0)
      return

    const formData = new FormData()
    formData.set('id', String(equipo.id))
    formData.set('estado', estado)
    formData.set('cliente', cliente.trim())
    formData.set('telefono', telefono.trim())
    formData.set('precio', precio.trim())
    formData.set(
      'camposCustom',
      JSON.stringify(
        camposCustom
          .filter((c) => c.titulo.trim() || c.descripcion.trim())
          .map((c) => ({
            id: c.id > 0 ? c.id : undefined,
            titulo: c.titulo.trim(),
            descripcion: c.descripcion.trim(),
          })),
      ),
    )

    setFormError(null)
    startSaveTransition(async () => {
      const result = await updateEquipo(formData)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      onOpenChange(false)
    })
  }

  function refreshMantenimientos() {
    if (!equipo) return
    startRefreshTransition(async () => {
      const detail = await fetchEquipoDetail(equipo.id)
      if (detail) {
        setMantList(detail.mantenimientos)
      }
    })
  }

  function addCampoCustom() {
    setCamposCustom((prev) => [
      ...prev,
      { id: -Date.now() - prev.length, titulo: '', descripcion: '' },
    ])
  }

  function updateCampoCustom(
    id: number,
    patch: Partial<Pick<CampoCustomDraft, 'titulo' | 'descripcion'>>,
  ) {
    setCamposCustom((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )
    setCampoFieldErrors((e) => ({ ...e, [id]: undefined }))
  }

  function removeCampoCustom(id: number) {
    setCamposCustom((prev) => prev.filter((c) => c.id !== id))
    setCampoFieldErrors((e) => ({ ...e, [id]: undefined }))
  }

  function handleAddMantenimiento(e: React.FormEvent) {
    e.preventDefault()
    if (addingMant || !equipo) return

    const newErrors: { componente?: string } = {}
    if (
      mantForm.tipo === 'Reparación de componente' &&
      !mantForm.componente.trim()
    ) {
      newErrors.componente = 'Indicá el componente reparado.'
    }
    setMantFieldErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const formData = new FormData()
    formData.set('equipoId', String(equipo.id))
    formData.set('tipo', mantForm.tipo)
    formData.set('componente', mantForm.componente.trim())
    formData.set('observacion', mantForm.observacion.trim())
    formData.set('fecha', mantForm.fecha)
    formData.set('hora', mantForm.hora)

    setFormError(null)
    startMantTransition(async () => {
      const result = await addMantenimiento(formData)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      setMantForm({
        ...emptyMantForm,
        fecha: getCurrentDateInChile(),
        hora: getCurrentTimeInChile(),
      })
      setShowNewMantForm(false)
      setMantFieldErrors({})
      refreshMantenimientos()
    })
  }

  function startEditMant(m: Mantenimiento) {
    setEditingMantId(m.id)
    setEditMantForm(mantFromItem(m))
    setEditMantFieldErrors({})
    setShowNewMantForm(false)
  }

  function cancelEditMant() {
    setEditingMantId(null)
    setEditMantForm(emptyMantForm)
    setEditMantFieldErrors({})
  }

  function handleUpdateMantenimiento(e: React.FormEvent) {
    e.preventDefault()
    if (updatingMant || editingMantId === null) return

    const newErrors: { componente?: string } = {}
    if (
      editMantForm.tipo === 'Reparación de componente' &&
      !editMantForm.componente.trim()
    ) {
      newErrors.componente = 'Indicá el componente reparado.'
    }
    setEditMantFieldErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    const formData = new FormData()
    formData.set('id', String(editingMantId))
    formData.set('tipo', editMantForm.tipo)
    formData.set('componente', editMantForm.componente.trim())
    formData.set('observacion', editMantForm.observacion.trim())
    formData.set('fecha', editMantForm.fecha)
    formData.set('hora', editMantForm.hora)

    setFormError(null)
    startUpdateMantTransition(async () => {
      const result = await updateMantenimiento(formData)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      cancelEditMant()
      refreshMantenimientos()
    })
  }

  function requestDeleteMant(m: Mantenimiento) {
    if (deletingMant) return
    setFormError(null)
    setPendingDeleteMant(m)
  }

  function cancelDeleteMant() {
    if (deletingMant) return
    setPendingDeleteMant(null)
  }

  function handleConfirmDelete() {
    const target = pendingDeleteMant
    if (!target || deletingMant) return
    const id = target.id
    setDeletingMantId(id)
    setPendingDeleteMant(null)
    startDeleteMantTransition(async () => {
      const result = await deleteMantenimiento(id)
      if (result?.error) {
        setFormError(result.error)
        setDeletingMantId(null)
        return
      }
      setDeletingMantId(null)
      if (editingMantId === id) cancelEditMant()
      refreshMantenimientos()
    })
  }

  function discardAndClose() {
    setConfirmDiscard(false)
    onOpenChange(false)
  }

  const inputBase =
    'h-10 w-full rounded-lg border bg-background px-3 pl-9 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40'
  const inputOk = 'border-input'
  const inputErr = 'border-destructive focus:ring-destructive/40'
  const selectBase =
    'h-10 w-full appearance-none rounded-lg border bg-background px-3 pr-9 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer'
  const selectOk = 'border-input'

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup
          aria-label="Editar equipo"
          className={cn(
            'max-w-2xl',
            confirmDiscard && 'max-w-md',
          )}
        >
          <DialogHeader>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>
                {confirmDiscard ? 'Descartar cambios' : 'Editar equipo'}
              </DialogTitle>
              <DialogDescription>
                {confirmDiscard
                  ? 'Tenés cambios sin guardar.'
                  : 'Actualizá los datos del cliente, el estado o gestioná los mantenimientos.'}
              </DialogDescription>
            </div>
            {!confirmDiscard ? (
              <DialogClose
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </DialogClose>
            ) : null}
          </DialogHeader>

          {confirmDiscard ? (
            <div className="flex flex-col gap-5 px-6 py-5">
              <p className="text-sm text-muted-foreground">
                Si cerrás ahora se perderán los cambios sin guardar. ¿Querés
                descartarlos?
              </p>
              <DialogFooter className="border-t-0 px-0 pt-0">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmDiscard(false)}
                >
                  Seguir editando
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={discardAndClose}
                >
                  Descartar
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-6 px-6 py-5">
                {formError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                  >
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <span>{formError}</span>
                  </div>
                ) : null}

                <section
                  aria-label="Resumen del equipo"
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Hash className="size-3.5" aria-hidden />
                    <span className="font-mono text-xs">
                      {String(equipo.id).padStart(4, '0')}
                    </span>
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wrench className="size-3.5" aria-hidden />
                    <span className="font-medium text-card-foreground">
                      {equipo.tipo}
                      {equipo.marca ? ` · ${equipo.marca}` : ''}
                    </span>
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5" aria-hidden />
                    Ingresado el {formatDateInChile(equipo.fechaIngreso)}
                  </span>
                </section>

                <section
                  aria-labelledby={`${formId}-datos-section`}
                  className="flex flex-col gap-4"
                >
                  <p
                    id={`${formId}-datos-section`}
                    className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                  >
                    Datos del cliente
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`${formId}-edit-cliente`}
                        className="text-sm font-medium text-card-foreground"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <User className="size-3.5" aria-hidden />
                          Cliente
                        </span>
                      </label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <input
                          id={`${formId}-edit-cliente`}
                          type="text"
                          value={cliente}
                          onChange={(e) => setCliente(e.target.value)}
                          maxLength={80}
                          autoComplete="off"
                          placeholder="Sin nombre"
                          aria-invalid={Boolean(fieldErrors.cliente)}
                          aria-describedby={
                            fieldErrors.cliente
                              ? `${formId}-edit-cliente-error`
                              : undefined
                          }
                          className={cn(
                            inputBase,
                            fieldErrors.cliente ? inputErr : inputOk,
                          )}
                        />
                      </div>
                      {fieldErrors.cliente ? (
                        <p
                          id={`${formId}-edit-cliente-error`}
                          role="alert"
                          className="flex items-center gap-1.5 text-xs text-destructive"
                        >
                          <AlertCircle className="size-3.5" aria-hidden />
                          {fieldErrors.cliente}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`${formId}-edit-telefono`}
                        className="text-sm font-medium text-card-foreground"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="size-3.5" aria-hidden />
                          Teléfono
                          <span className="text-xs font-normal text-muted-foreground">
                            (opcional)
                          </span>
                        </span>
                      </label>
                      <div className="relative">
                        <Phone
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <input
                          id={`${formId}-edit-telefono`}
                          type="tel"
                          inputMode="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          onBlur={() => {
                            if (
                              telefono.trim() &&
                              !TELEFONO_CL_PATTERN.test(telefono.trim())
                            ) {
                              setFieldErrors((e) => ({
                                ...e,
                                telefono: 'Formato chileno: +56 9 1234 5678',
                              }))
                            }
                          }}
                          maxLength={20}
                          autoComplete="tel"
                          placeholder="+56 9 1234 5678"
                          aria-invalid={Boolean(fieldErrors.telefono)}
                          aria-describedby={
                            fieldErrors.telefono
                              ? `${formId}-edit-telefono-error`
                              : undefined
                          }
                          className={cn(
                            inputBase,
                            fieldErrors.telefono ? inputErr : inputOk,
                          )}
                        />
                      </div>
                      {fieldErrors.telefono ? (
                        <p
                          id={`${formId}-edit-telefono-error`}
                          role="alert"
                          className="flex items-center gap-1.5 text-xs text-destructive"
                        >
                          <AlertCircle className="size-3.5" aria-hidden />
                          {fieldErrors.telefono}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`${formId}-edit-estado`}
                        className="text-sm font-medium text-card-foreground"
                      >
                        Estado
                      </label>
                      <div className="relative">
                        <select
                          id={`${formId}-edit-estado`}
                          value={estado}
                          onChange={(e) =>
                            setEstado(e.target.value as EstadoEquipo)
                          }
                          className={cn(
                            selectBase,
                            selectOk,
                            'pl-3',
                          )}
                        >
                          {estados.map((e) => (
                            <option key={e} value={e}>
                              {e}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      <div className="mt-1">
                        <StatusBadge estado={estado} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor={`${formId}-edit-precio`}
                        className="text-sm font-medium text-card-foreground"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <DollarSign className="size-3.5" aria-hidden />
                          Precio
                          <span className="text-xs font-normal text-muted-foreground">
                            (opcional)
                          </span>
                        </span>
                      </label>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                        <input
                          id={`${formId}-edit-precio`}
                          type="text"
                          inputMode="decimal"
                          value={precio}
                          onChange={(e) =>
                            setPrecio(e.target.value.slice(0, 20))
                          }
                          maxLength={20}
                          autoComplete="off"
                          placeholder="$45.000"
                          className={cn(inputBase, inputOk)}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="h-px bg-border" />

                <section
                  aria-labelledby={`${formId}-campos-section`}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      id={`${formId}-campos-section`}
                      className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                    >
                      Items personalizados
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      variant="secondary"
                      onClick={addCampoCustom}
                    >
                      <Plus className="size-3.5" />
                      Agregar item
                    </Button>
                  </div>

                  {camposCustom.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                      Sin items personalizados. Agregá datos extra con su título
                      y descripción (ej: Cliente, N° de factura, Garantía…).
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2" role="list">
                      {camposCustom.map((c) => (
                        <li
                          key={c.id}
                          className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <Tag
                                  className="size-3.5 shrink-0 text-muted-foreground"
                                  aria-hidden
                                />
                                <label
                                  htmlFor={`${formId}-campo-titulo-${c.id}`}
                                  className="sr-only"
                                >
                                  Título del item
                                </label>
                                <input
                                  id={`${formId}-campo-titulo-${c.id}`}
                                  type="text"
                                  value={c.titulo}
                                  onChange={(e) =>
                                    updateCampoCustom(c.id, {
                                      titulo: e.target.value.slice(0, 80),
                                    })
                                  }
                                  maxLength={80}
                                  autoComplete="off"
                                  placeholder="Título (ej: Cliente)"
                                  aria-invalid={Boolean(
                                    campoFieldErrors[c.id],
                                  )}
                                  aria-describedby={
                                    campoFieldErrors[c.id]
                                      ? `${formId}-campo-titulo-error-${c.id}`
                                      : undefined
                                  }
                                  className={cn(
                                    'h-9 w-full rounded-md border bg-background px-2.5 pl-7 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40',
                                    campoFieldErrors[c.id]
                                      ? 'border-destructive focus:ring-destructive/40'
                                      : 'border-input',
                                  )}
                                />
                              </div>
                              {campoFieldErrors[c.id] ? (
                                <p
                                  id={`${formId}-campo-titulo-error-${c.id}`}
                                  role="alert"
                                  className="flex items-center gap-1.5 pl-7 text-xs text-destructive"
                                >
                                  <AlertCircle
                                    className="size-3.5"
                                    aria-hidden
                                  />
                                  {campoFieldErrors[c.id]}
                                </p>
                              ) : null}
                            </div>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeCampoCustom(c.id)}
                              aria-label="Eliminar item"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                          <div className="relative">
                            <label
                              htmlFor={`${formId}-campo-desc-${c.id}`}
                              className="sr-only"
                            >
                              Descripción del item
                            </label>
                            <textarea
                              id={`${formId}-campo-desc-${c.id}`}
                              value={c.descripcion}
                              onChange={(e) =>
                                updateCampoCustom(c.id, {
                                  descripcion: e.target.value.slice(0, 500),
                                })
                              }
                              rows={2}
                              maxLength={500}
                              placeholder="Descripción (opcional)"
                              className="w-full resize-none rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="h-px bg-border" />

                <section
                  aria-labelledby={`${formId}-mant-section`}
                  className="flex flex-col gap-4"
                >
                  <button
                    type="button"
                    onClick={() => setMantSectionOpen((v) => !v)}
                    className="flex items-center justify-between gap-2 rounded-md py-1 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    aria-expanded={mantSectionOpen}
                    aria-controls={`${formId}-mant-content`}
                  >
                    <span className="flex items-center gap-2">
                      <Wrench className="size-3.5 text-muted-foreground" aria-hidden />
                      <span
                        id={`${formId}-mant-section`}
                        className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
                      >
                        Mantenimientos
                      </span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {mantList.length}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'size-4 text-muted-foreground transition-transform duration-200',
                        !mantSectionOpen && '-rotate-90',
                      )}
                      aria-hidden
                    />
                  </button>

                  {mantSectionOpen ? (
                    <div
                      id={`${formId}-mant-content`}
                      className="flex flex-col gap-3"
                    >
                      {mantList.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
                          Sin mantenimientos registrados todavía.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-2" role="list">
                          {mantList.map((m) => {
                            const isEditing = editingMantId === m.id
                            return (
                              <li
                                key={m.id}
                                className={cn(
                                  'rounded-lg border bg-card p-3',
                                  isEditing
                                    ? 'border-primary/50 bg-primary/5'
                                    : 'border-border',
                                )}
                              >
                                {isEditing ? (
                                  <form
                                    onSubmit={handleUpdateMantenimiento}
                                    className="flex flex-col gap-3"
                                    aria-label={`Editar mantenimiento #${m.id}`}
                                  >
                                    <MantFormFields
                                      formId={formId}
                                      inputBase={inputBase}
                                      inputOk={inputOk}
                                      inputErr={inputErr}
                                      selectBase={selectBase}
                                      selectOk={selectOk}
                                      value={editMantForm}
                                      onChange={setEditMantForm}
                                      error={
                                        editMantFieldErrors.componente
                                      }
                                      errorId={`${formId}-edit-mant-componente-error`}
                                    />
                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={cancelEditMant}
                                        disabled={updatingMant}
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        type="submit"
                                        size="sm"
                                        loading={updatingMant}
                                      >
                                        <Save className="size-4" />
                                        Guardar
                                      </Button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Wrench
                                          className="size-3.5 text-muted-foreground"
                                          aria-hidden
                                        />
                                        <span className="text-sm font-medium text-card-foreground">
                                          {m.tipo}
                                        </span>
                                        {m.componente ? (
                                          <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                                            {m.componente}
                                          </span>
                                        ) : null}
                                      </div>
                                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="size-3" aria-hidden />
                                        {formatDateInChile(m.fecha)}
                                      </span>
                                    </div>
                                    {m.observacion ? (
                                      <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                                        {m.observacion}
                                      </p>
                                    ) : null}
                                    <div className="flex flex-wrap items-center justify-end gap-1 border-t border-border pt-2">
                                      <Button
                                        type="button"
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => startEditMant(m)}
                                        disabled={updatingMant || deletingMant}
                                      >
                                        <Pencil className="size-3.5" />
                                        Editar
                                      </Button>
                                      <Button
                                        type="button"
                                        size="xs"
                                        variant="destructive"
                                        loading={
                                          deletingMant &&
                                          deletingMantId === m.id
                                        }
                                        disabled={updatingMant || deletingMant}
                                        onClick={() => requestDeleteMant(m)}
                                      >
                                        <Trash2 className="size-3.5" />
                                        Eliminar
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      )}

                      {showNewMantForm ? (
                        <form
                          onSubmit={handleAddMantenimiento}
                          className="flex flex-col gap-3 rounded-lg border border-dashed border-border bg-secondary/40 p-4"
                          aria-label="Nuevo mantenimiento"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-card-foreground">
                              Nuevo mantenimiento
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewMantForm(false)
                                setMantFieldErrors({})
                              }}
                              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                              aria-label="Cerrar formulario"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                          <MantFormFields
                            formId={formId}
                            inputBase={inputBase}
                            inputOk={inputOk}
                            inputErr={inputErr}
                            selectBase={selectBase}
                            selectOk={selectOk}
                            value={mantForm}
                            onChange={setMantForm}
                            error={mantFieldErrors.componente}
                            errorId={`${formId}-mant-componente-error`}
                          />
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowNewMantForm(false)
                                setMantFieldErrors({})
                              }}
                              disabled={addingMant}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              loading={addingMant}
                            >
                              <Check className="size-4" />
                              Guardar mantenimiento
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="self-start"
                          onClick={() => {
                            setShowNewMantForm(true)
                            setEditingMantId(null)
                          }}
                        >
                          <Plus className="size-4" />
                          Agregar mantenimiento
                        </Button>
                      )}

                      {refreshing ? (
                        <div
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                          aria-live="polite"
                        >
                          <Loader2
                            className="size-3.5 animate-spin"
                            aria-hidden
                          />
                          Actualizando historial…
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={requestClose}
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEstado}
                  loading={saving}
                >
                  Guardar cambios
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogPopup>
      </DialogPortal>
    </Dialog>

    <Dialog
      open={pendingDeleteMant !== null}
      onOpenChange={(next) => {
        if (!next && !deletingMant) setPendingDeleteMant(null)
      }}
      modal
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup
          aria-label="Confirmar eliminación"
          className="max-w-md"
        >
          <DialogHeader>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>Eliminar mantenimiento</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-4 px-6 py-5">
            {formError ? (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden
                />
                <span>{formError}</span>
              </div>
            ) : null}

            <p className="text-sm text-muted-foreground">
              ¿Confirmás que querés eliminar este mantenimiento? El registro
              se borrará del historial del equipo.
            </p>

            {pendingDeleteMant ? (
              <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Wrench
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-medium text-card-foreground">
                    {pendingDeleteMant.tipo}
                  </span>
                  {pendingDeleteMant.componente ? (
                    <span className="rounded bg-card px-1.5 py-0.5 text-xs text-muted-foreground">
                      {pendingDeleteMant.componente}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="size-3" aria-hidden />
                  {formatDateInChile(pendingDeleteMant.fecha)}
                </p>
                {pendingDeleteMant.observacion ? (
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                    {pendingDeleteMant.observacion}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={cancelDeleteMant}
              disabled={deletingMant}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={deletingMant}
              onClick={handleConfirmDelete}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
    </>
  )
}

function MantFormFields({
  formId,
  inputBase,
  inputOk,
  inputErr,
  selectBase,
  selectOk,
  value,
  onChange,
  error,
  errorId,
}: {
  formId: string
  inputBase: string
  inputOk: string
  inputErr: string
  selectBase: string
  selectOk: string
  value: MantFormState
  onChange: (updater: (prev: MantFormState) => MantFormState) => void
  error?: string
  errorId: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${formId}-tipo`}
            className="text-xs font-medium text-muted-foreground"
          >
            Tipo de mantenimiento
            <span className="ml-1 text-destructive" aria-hidden>
              *
            </span>
          </label>
          <div className="relative">
            <select
              id={`${formId}-tipo`}
              value={value.tipo}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  tipo: e.target.value as TipoMantenimiento,
                  componente:
                    e.target.value === 'Reparación de componente'
                      ? f.componente
                      : '',
                }))
              }
              className={cn(selectBase, selectOk)}
            >
              {tiposMantenimiento.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${formId}-fecha`}
              className="text-xs font-medium text-muted-foreground"
            >
              Fecha
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id={`${formId}-fecha`}
                type="date"
                value={value.fecha}
                onChange={(e) => onChange((f) => ({ ...f, fecha: e.target.value }))}
                className={cn(inputBase, inputOk, 'pl-9', 'cursor-pointer')}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${formId}-hora`}
              className="text-xs font-medium text-muted-foreground"
            >
              Hora
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id={`${formId}-hora`}
                type="time"
                value={value.hora}
                onChange={(e) => onChange((f) => ({ ...f, hora: e.target.value }))}
                className={cn(inputBase, inputOk, 'pl-9', 'cursor-pointer')}
              />
            </div>
          </div>
        </div>
      </div>

      {value.tipo === 'Reparación de componente' ? (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${formId}-componente`}
            className="text-xs font-medium text-muted-foreground"
          >
            Componente reparado
            <span className="ml-1 text-destructive" aria-hidden>
              *
            </span>
          </label>
          <div className="relative">
            <Wrench className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id={`${formId}-componente`}
              type="text"
              value={value.componente}
              onChange={(e) =>
                onChange((f) => ({
                  ...f,
                  componente: e.target.value.slice(0, 100),
                }))
              }
              maxLength={100}
              placeholder="Ej: Puerto de carga, bisagra, memoria RAM…"
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className={cn(inputBase, error ? inputErr : inputOk)}
            />
          </div>
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="flex items-center gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="size-3.5" aria-hidden />
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`${formId}-obs`}
          className="text-xs font-medium text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="size-3.5" aria-hidden />
            Observación general
          </span>
        </label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" aria-hidden />
          <textarea
            id={`${formId}-obs`}
            value={value.observacion}
            onChange={(e) =>
              onChange((f) => ({
                ...f,
                observacion: e.target.value.slice(0, 500),
              }))
            }
            placeholder="Diagnóstico, procedimientos, repuestos, recomendaciones…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <p className="text-right text-xs text-muted-foreground">
          {value.observacion.length}/500
        </p>
      </div>
    </div>
  )
}
