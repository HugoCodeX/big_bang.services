'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { changePasswordAction } from '@/app/actions/cuenta'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'submitting' | 'success'

function passwordStrength(pw: string): { label: string; level: 0 | 1 | 2 | 3 | 4; tone: string } {
  if (!pw) return { label: '', level: 0, tone: '' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  const level = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
  const labels = ['', 'Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte']
  const tones = ['', 'bg-destructive', 'bg-destructive', 'bg-warning', 'bg-success', 'bg-success']
  return { label: labels[level], level, tone: tones[level] }
}

export function ChangePasswordForm() {
  const router = useRouter()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [revokeOthers, setRevokeOthers] = useState(true)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [, startTransition] = useTransition()

  const strength = passwordStrength(next)
  const confirmMismatch = confirm.length > 0 && confirm !== next

  function reset() {
    setCurrent('')
    setNext('')
    setConfirm('')
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return
    setError(null)
    setStatus('submitting')

    startTransition(async () => {
      const result = await changePasswordAction(current, next, confirm, revokeOthers)
      if (result.ok) {
        setStatus('success')
        reset()
        router.refresh()
      } else {
        setStatus('idle')
        setError(result.error)
      }
    })
  }

  const fieldBase =
    'h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40'
  const fieldOk = 'border-input'
  const fieldErr = 'border-destructive focus:ring-destructive/40'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="current-password" className="text-sm font-medium text-card-foreground">
          Contraseña actual
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="current-password"
            type={showCurrent ? 'text' : 'password'}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
            maxLength={128}
            disabled={status === 'submitting'}
            className={cn(fieldBase, 'pr-10', fieldOk)}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((s) => !s)}
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-sm font-medium text-card-foreground">
          Nueva contraseña
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="new-password"
            type={showNext ? 'text' : 'password'}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            disabled={status === 'submitting'}
            aria-invalid={next.length > 0 && strength.level <= 1}
            className={cn(fieldBase, 'pr-10', fieldOk)}
          />
          <button
            type="button"
            onClick={() => setShowNext((s) => !s)}
            className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={showNext ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showNext ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {next.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <div className="flex h-1.5 flex-1 gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-full flex-1 rounded-full transition-colors',
                    i <= strength.level ? strength.tone : 'bg-muted',
                  )}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {strength.label}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-sm font-medium text-card-foreground">
          Confirmar nueva contraseña
        </label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="confirm-password"
            type={showNext ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            disabled={status === 'submitting'}
            aria-invalid={confirmMismatch}
            className={cn(fieldBase, confirmMismatch ? fieldErr : fieldOk)}
          />
        </div>
        {confirmMismatch && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5" aria-hidden />
            Las contraseñas no coinciden.
          </p>
        )}
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-3 text-sm">
        <input
          type="checkbox"
          checked={revokeOthers}
          onChange={(e) => setRevokeOthers(e.target.checked)}
          disabled={status === 'submitting'}
          className="mt-0.5 size-4 cursor-pointer rounded border-input accent-primary focus:ring-2 focus:ring-ring/40"
        />
        <span className="flex flex-col">
          <span className="font-medium text-card-foreground">
            Cerrar sesión en otros dispositivos
          </span>
          <span className="text-xs text-muted-foreground">
            Recomendado. Si te robaron la contraseña, esto invalida cualquier otra sesión activa.
          </span>
        </span>
      </label>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {status === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success dark:text-success-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Contraseña actualizada correctamente.</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={status === 'submitting'}
        >
          Limpiar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting' || !current || !next || !confirm || confirmMismatch}
          loading={status === 'submitting'}
        >
          {status === 'submitting' ? 'Actualizando…' : 'Cambiar contraseña'}
        </Button>
      </div>
    </form>
  )
}
