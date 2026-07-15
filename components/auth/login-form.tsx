'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signIn } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'submitting'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  function validateField(field: 'email' | 'password', value: string): string | undefined {
    if (field === 'email') {
      if (!value.trim()) return 'Ingresá tu correo electrónico.'
      if (!EMAIL_RE.test(value.trim())) return 'El formato del correo no es válido.'
      return undefined
    }
    if (!value) return 'Ingresá tu contraseña.'
    if (value.length < 8) return 'Mínimo 8 caracteres.'
    return undefined
  }

  function handleBlur(field: 'email' | 'password', value: string) {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validateField(field, value) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return

    const emailError = validateField('email', email)
    const passwordError = validateField('password', password)
    setErrors({ email: emailError, password: passwordError })
    setTouched({ email: true, password: true })
    setFormError(null)

    if (emailError || passwordError) {
      const el = emailError
        ? document.getElementById('email')
        : document.getElementById('password')
      el?.focus()
      return
    }

    setStatus('submitting')

    const { error } = await signIn.email({
      email: email.trim(),
      password,
    })

    if (error) {
      setStatus('idle')
      setFormError(
        error.message?.toLowerCase().includes('invalid') ||
          error.message?.toLowerCase().includes('credentials')
          ? 'Correo o contraseña incorrectos.'
          : error.message ?? 'No se pudo iniciar sesión.',
      )
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const fieldBase =
    'h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40'
  const fieldOk = 'border-input'
  const fieldErr = 'border-destructive focus:ring-destructive/40'

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-card-foreground">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email', email)}
              required
              maxLength={255}
              autoComplete="email"
              placeholder="tu@correo.com"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(fieldBase, touched.email && errors.email ? fieldErr : fieldOk)}
            />
          </div>
          {touched.email && errors.email ? (
            <p
              id="email-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="size-3.5" aria-hidden />
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-card-foreground">
            Contraseña
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password', password)}
              required
              maxLength={128}
              minLength={8}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={cn(
                fieldBase,
                'pr-10',
                touched.password && errors.password ? fieldErr : fieldOk,
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {touched.password ? (
            errors.password ? (
              <p
                id="password-error"
                role="alert"
                className="flex items-center gap-1.5 text-xs text-destructive"
              >
                <AlertCircle className="size-3.5" aria-hidden />
                {errors.password}
              </p>
            ) : null
          ) : null}
        </div>

        {formError ? (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{formError}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={status === 'submitting'}
          loading={status === 'submitting'}
          className="h-11 w-full"
        >
          {status === 'submitting' ? 'Ingresando…' : 'Iniciar sesión'}
        </Button>
      </form>
    </div>
  )
}
