'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Cpu,
  Laptop,
  Loader2,
  MessageSquare,
  Phone,
  User,
  Wrench,
  X,
} from 'lucide-react'
import {
  getCurrentDateInChile,
  getCurrentTimeInChile,
  type MarcaNotebook,
  type TipoEquipo,
} from '@/lib/equipos'
import { createEquipo } from '@/app/actions/equipos'
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
import { cn } from '@/lib/utils'

function formatDateInputForDisplay(date: string): string | null {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, y, m, d] = match
  return `${d}/${m}/${y}`
}

const TIPO_OTRO = 'Otro' as const

const tiposEquipo: (TipoEquipo | typeof TIPO_OTRO)[] = [
  'PC Escritorio',
  'Notebook',
  'PS3',
  'PS4',
  'PS5',
  'MacBook Air',
  'MacBook Pro',
  'iPhone',
  'Android',
  'Mac Escritorio',
  TIPO_OTRO,
]

const marcasNotebook: MarcaNotebook[] = [
  'Asus',
  'Lenovo',
  'HP',
  'Acer',
  'Dell',
  'MSI',
  'Huawei',
  'Samsung',
  'LG',
  'Razer',
  'Microsoft',
  'Gigabyte',
  'Chuwi',
  'Otro',
]

const TELEFONO_CL_PATTERN = /^(\+?56[\s-]*)?9?[\s-]*\d{4}[\s-]*\d{4}$/

type EquipoSeleccionado = TipoEquipo | typeof TIPO_OTRO

type FormState = {
  cliente: string
  telefono: string
  equipo: EquipoSeleccionado
  tipoOtro: string
  marca: MarcaNotebook | ''
  marcaOtra: string
  comentarios: string
  fecha: string
  hora: string
}

const initialForm: FormState = {
  cliente: '',
  telefono: '',
  equipo: 'PC Escritorio',
  tipoOtro: '',
  marca: '',
  marcaOtra: '',
  comentarios: '',
  fecha: '',
  hora: '',
}

type Status = 'idle' | 'submitting' | 'success'

type FormErrors = {
  telefono?: string
  tipoOtro?: string
  marca?: string
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  )
}

export function NuevoIngresoModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<{
    telefono?: boolean
    tipoOtro?: boolean
    marca?: boolean
  }>({})
  const [status, setStatus] = useState<Status>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formId = useId()

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        fecha: f.fecha || getCurrentDateInChile(),
        hora: f.hora || getCurrentTimeInChile(),
      }))
      return
    }
    const t = window.setTimeout(() => {
      setForm(initialForm)
      setErrors({})
      setTouched({})
      setStatus('idle')
      setFormError(null)
    }, 250)
    return () => window.clearTimeout(t)
  }, [open])

  function validateField(
    field: 'telefono' | 'tipoOtro' | 'marca',
    value: string,
  ): string | undefined {
    if (field === 'telefono') {
      if (value.trim() && !TELEFONO_CL_PATTERN.test(value.trim()))
        return 'Formato válido: +56 9 1234 5678'
      return undefined
    }
    if (field === 'tipoOtro') {
      if (form.equipo === TIPO_OTRO && !value.trim())
        return 'Indicá qué tipo de equipo es.'
      return undefined
    }
    if (field === 'marca') {
      if (form.equipo === 'Notebook' && !value)
        return 'Elegí la marca del notebook.'
      return undefined
    }
    return undefined
  }

  function handleBlur(
    field: 'telefono' | 'tipoOtro' | 'marca',
    value: string,
  ) {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validateField(field, value) }))
  }

  function requestClose() {
    if (status === 'submitting' || isPending) return
    onOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      onOpenChange(true)
      return
    }
    requestClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status !== 'idle' || isPending) return

    const telefonoError = validateField('telefono', form.telefono)
    const tipoOtroError = validateField('tipoOtro', form.tipoOtro)
    const marcaError = validateField('marca', form.marca)
    setErrors({
      telefono: telefonoError,
      tipoOtro: tipoOtroError,
      marca: marcaError,
    })
    setTouched({ telefono: true, tipoOtro: true, marca: true })

    if (telefonoError || tipoOtroError || marcaError) {
      const el = tipoOtroError
        ? document.getElementById(`${formId}-tipo-otro`)
        : marcaError
          ? document.getElementById(`${formId}-marca`)
          : document.getElementById(`${formId}-telefono`)
      el?.focus()
      return
    }

    setStatus('submitting')
    setFormError(null)

    const formData = new FormData()
    formData.set('tipo', form.equipo)
    formData.set('tipoOtro', form.tipoOtro.trim())
    formData.set('marca', form.marca)
    formData.set('marcaOtra', form.marcaOtra.trim())
    formData.set('cliente', form.cliente.trim())
    formData.set('telefono', form.telefono.trim())
    formData.set('comentarios', form.comentarios.trim())
    formData.set('fecha', form.fecha)
    formData.set('hora', form.hora)

    startTransition(async () => {
      const result = await createEquipo(formData)
      if (result?.error) {
        setStatus('idle')
        setFormError(result.error)
        return
      }
      setStatus('success')
      window.setTimeout(() => onOpenChange(false), 1200)
    })
  }

  const inputBase =
    'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40'
  const inputOk = 'border-input'
  const inputErr = 'border-destructive focus:ring-destructive/40'

  const selectBase =
    'h-10 w-full appearance-none rounded-lg border bg-background pl-9 pr-9 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-pointer'
  const selectOk = 'border-input'

  const fechaHoraPreview = form.fecha
    ? formatDateInputForDisplay(form.fecha)
    : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup
          aria-label="Nuevo ingreso de equipo"
          className={cn(status === 'success' && 'max-w-md')}
        >
          <DialogHeader>
            <div className="flex flex-col gap-0.5">
              <DialogTitle>
                {status === 'success' ? 'Ingreso guardado' : 'Nuevo ingreso'}
              </DialogTitle>
              <DialogDescription>
                {status === 'success'
                  ? 'El equipo fue registrado correctamente.'
                  : 'Registrá el equipo que ingresa al taller.'}
              </DialogDescription>
            </div>
            {status !== 'success' && (
              <DialogClose
                className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </DialogClose>
            )}
          </DialogHeader>

          {status === 'success' ? (
            <div
              className="flex flex-col items-center gap-3 px-6 py-10 text-center"
              role="status"
              aria-live="polite"
            >
              <span className="grid size-16 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-8" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-sm font-medium text-card-foreground">
                  {form.equipo === TIPO_OTRO
                    ? form.tipoOtro.trim()
                    : form.equipo === 'Notebook' && form.marca
                      ? `${form.equipo} · ${form.marca === 'Otro' ? form.marcaOtra || 'Otra marca' : form.marca}`
                      : form.equipo}
                </p>
                {form.cliente.trim() ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    a nombre de {form.cliente.trim()}
                  </p>
                ) : null}
              </div>
              <Loader2
                className="size-4 animate-spin text-muted-foreground"
                aria-hidden
              />
            </div>
          ) : (
            <form
              id={formId}
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 px-6 py-5"
              noValidate
            >
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
                aria-labelledby={`${formId}-cliente-section`}
                className="flex flex-col gap-3"
              >
                <SectionLabel>Datos del cliente</SectionLabel>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${formId}-cliente`}
                      className="text-sm font-medium text-card-foreground"
                    >
                      Nombre del cliente
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </label>
                    <div className="relative">
                      <User
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id={`${formId}-cliente`}
                        type="text"
                        value={form.cliente}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, cliente: e.target.value }))
                        }
                        maxLength={80}
                        autoComplete="off"
                        placeholder="Ej: Juan Pérez"
                        className={cn(inputBase, inputOk)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${formId}-telefono`}
                      className="text-sm font-medium text-card-foreground"
                    >
                      Teléfono
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </label>
                    <div className="relative">
                      <Phone
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id={`${formId}-telefono`}
                        type="tel"
                        inputMode="tel"
                        value={form.telefono}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, telefono: e.target.value }))
                        }
                        onBlur={() => handleBlur('telefono', form.telefono)}
                        maxLength={20}
                        autoComplete="tel"
                        placeholder="+56 9 1234 5678"
                        aria-invalid={Boolean(errors.telefono)}
                        aria-describedby={
                          errors.telefono
                            ? `${formId}-telefono-error`
                            : `${formId}-telefono-help`
                        }
                        className={cn(
                          inputBase,
                          touched.telefono && errors.telefono
                            ? inputErr
                            : inputOk,
                        )}
                      />
                    </div>
                    {touched.telefono && errors.telefono ? (
                      <p
                        id={`${formId}-telefono-error`}
                        role="alert"
                        className="flex items-center gap-1.5 text-xs text-destructive"
                      >
                        <AlertCircle className="size-3.5" aria-hidden />
                        {errors.telefono}
                      </p>
                    ) : (
                      <p
                        id={`${formId}-telefono-help`}
                        className="text-xs text-muted-foreground"
                      >
                        Formato chileno: +56 9 1234 5678
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="h-px bg-border" />

              <section
                aria-labelledby={`${formId}-equipo-section`}
                className="flex flex-col gap-3"
              >
                <SectionLabel>Datos del equipo</SectionLabel>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${formId}-equipo`}
                      className="text-sm font-medium text-card-foreground"
                    >
                      Tipo de equipo
                      <span className="ml-1 text-destructive" aria-hidden>
                        *
                      </span>
                    </label>
                    <div className="relative">
                      <Laptop
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <select
                        id={`${formId}-equipo`}
                        value={form.equipo}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            equipo: e.target.value as EquipoSeleccionado,
                            marca: e.target.value === 'Notebook' ? f.marca : '',
                            marcaOtra:
                              e.target.value === 'Notebook'
                                ? f.marcaOtra
                                : '',
                            tipoOtro:
                              e.target.value === TIPO_OTRO ? f.tipoOtro : '',
                          }))
                        }
                        className={cn(selectBase, selectOk)}
                      >
                        {tiposEquipo.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  {form.equipo === TIPO_OTRO ? (
                    <div
                      className="flex flex-col gap-1.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200"
                      data-state="open"
                    >
                      <label
                        htmlFor={`${formId}-tipo-otro`}
                        className="text-sm font-medium text-card-foreground"
                      >
                        ¿Qué tipo de equipo es?
                        <span className="ml-1 text-destructive" aria-hidden>
                          *
                        </span>
                      </label>
                      <div className="relative">
                        <Cpu
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <input
                          id={`${formId}-tipo-otro`}
                          type="text"
                          value={form.tipoOtro}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              tipoOtro: e.target.value.slice(0, 60),
                            }))
                          }
                          onBlur={() => handleBlur('tipoOtro', form.tipoOtro)}
                          maxLength={60}
                          autoComplete="off"
                          placeholder="Ej: Tarjeta gráfica, Cargador, Monitor…"
                          aria-required="true"
                          aria-invalid={Boolean(errors.tipoOtro)}
                          aria-describedby={
                            errors.tipoOtro
                              ? `${formId}-tipo-otro-error`
                              : undefined
                          }
                          className={cn(
                            inputBase,
                            touched.tipoOtro && errors.tipoOtro
                              ? inputErr
                              : inputOk,
                          )}
                        />
                      </div>
                      {touched.tipoOtro && errors.tipoOtro ? (
                        <p
                          id={`${formId}-tipo-otro-error`}
                          role="alert"
                          className="flex items-center gap-1.5 text-xs text-destructive"
                        >
                          <AlertCircle className="size-3.5" aria-hidden />
                          {errors.tipoOtro}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {form.equipo === 'Notebook' ? (
                    <div
                      className="flex flex-col gap-1.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200"
                      data-state="open"
                    >
                      <label
                        htmlFor={`${formId}-marca`}
                        className="text-sm font-medium text-card-foreground"
                      >
                        Marca del notebook
                        <span className="ml-1 text-destructive" aria-hidden>
                          *
                        </span>
                      </label>
                      <div className="relative">
                        <Wrench
                          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden
                        />
                        <select
                          id={`${formId}-marca`}
                          value={form.marca}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              marca: e.target.value as MarcaNotebook,
                              marcaOtra:
                                e.target.value === 'Otro' ? f.marcaOtra : '',
                            }))
                          }
                          onBlur={() => handleBlur('marca', form.marca)}
                          aria-required="true"
                          aria-invalid={Boolean(errors.marca)}
                          aria-describedby={
                            errors.marca ? `${formId}-marca-error` : undefined
                          }
                          className={cn(
                            selectBase,
                            selectOk,
                            touched.marca && errors.marca
                              ? 'border-destructive focus:ring-destructive/40'
                              : '',
                          )}
                        >
                          <option value="" disabled>
                            Seleccioná una marca
                          </option>
                          {marcasNotebook.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                      {touched.marca && errors.marca ? (
                        <p
                          id={`${formId}-marca-error`}
                          role="alert"
                          className="flex items-center gap-1.5 text-xs text-destructive"
                        >
                          <AlertCircle className="size-3.5" aria-hidden />
                          {errors.marca}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {form.equipo === 'Notebook' && form.marca === 'Otro' ? (
                  <div
                    className="flex flex-col gap-1.5 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-200"
                    data-state="open"
                  >
                    <label
                      htmlFor={`${formId}-marca-otra`}
                      className="text-sm font-medium text-card-foreground"
                    >
                      ¿Cuál es la marca?
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </label>
                    <div className="relative">
                      <Wrench
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id={`${formId}-marca-otra`}
                        type="text"
                        value={form.marcaOtra}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            marcaOtra: e.target.value.slice(0, 60),
                          }))
                        }
                        maxLength={60}
                        placeholder="Ej: Toshiba, Positivo, BGH…"
                        autoComplete="off"
                        className={cn(inputBase, inputOk)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Si lo dejás vacío, se registrará como "Otro".
                    </p>
                  </div>
                ) : null}
              </section>

              <div className="h-px bg-border" />

              <section
                aria-labelledby={`${formId}-ingreso-section`}
                className="flex flex-col gap-3"
              >
                <SectionLabel>Ingreso</SectionLabel>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${formId}-fecha`}
                      className="text-sm font-medium text-card-foreground"
                    >
                      Fecha
                    </label>
                    <div className="relative">
                      <Calendar
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id={`${formId}-fecha`}
                        type="date"
                        value={form.fecha}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, fecha: e.target.value }))
                        }
                        lang="es-CL"
                        className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                      />
                    </div>
                    {fechaHoraPreview ? (
                      <p className="text-xs text-muted-foreground">
                        {fechaHoraPreview}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor={`${formId}-hora`}
                      className="text-sm font-medium text-card-foreground"
                    >
                      Hora
                    </label>
                    <div className="relative">
                      <Clock
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                      />
                      <input
                        id={`${formId}-hora`}
                        type="time"
                        value={form.hora}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, hora: e.target.value }))
                        }
                        className="h-10 w-full cursor-pointer rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`${formId}-comentarios`}
                    className="text-sm font-medium text-card-foreground"
                  >
                    Comentarios
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </label>
                  <div className="relative">
                    <MessageSquare
                      className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
                      aria-hidden
                    />
                    <textarea
                      id={`${formId}-comentarios`}
                      value={form.comentarios}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          comentarios: e.target.value.slice(0, 500),
                        }))
                      }
                      rows={3}
                      maxLength={500}
                      placeholder="Ej: El equipo no enciende, el cliente menciona que se cayó al agua…"
                      className="w-full resize-none rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                  <p className="text-right text-xs text-muted-foreground">
                    {form.comentarios.length}/500 caracteres
                  </p>
                </div>
              </section>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={requestClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={status === 'submitting' || isPending}
                >
                  {status === 'submitting' ? 'Guardando…' : 'Guardar ingreso'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  )
}
