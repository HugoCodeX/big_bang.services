import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { KeyRound, Mail, ShieldCheck, User as UserIcon } from 'lucide-react'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/dashboard/shell'
import { ChangePasswordForm } from '@/components/dashboard/change-password-form'

export const metadata = {
  title: 'Configuración · big_bang.services',
}

export default async function ConfiguracionPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect('/auth/iniciar-sesion')
  }

  const user = session.user
  const memberSinceDate = user.createdAt ? new Date(user.createdAt) : new Date()
  const memberSince = new Intl.DateTimeFormat('es-CL', {
    month: 'long',
    year: 'numeric',
  }).format(memberSinceDate)

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Configuración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administrá tu cuenta y la seguridad del panel.
          </p>
        </header>

        <section
          aria-labelledby="perfil-heading"
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <UserIcon className="size-4 text-muted-foreground" aria-hidden />
            <h2 id="perfil-heading" className="text-sm font-semibold text-card-foreground">
              Perfil
            </h2>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Nombre
              </dt>
              <dd className="text-sm text-card-foreground">{user.name}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Mail className="size-3" aria-hidden />
                Correo
              </dt>
              <dd className="break-all text-sm text-card-foreground">{user.email}</dd>
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Miembro desde
              </dt>
              <dd className="text-sm text-card-foreground capitalize">{memberSince}</dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="password-heading"
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-1 flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" aria-hidden />
            <h2 id="password-heading" className="text-sm font-semibold text-card-foreground">
              Cambiar contraseña
            </h2>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Tu contraseña debe tener entre 8 y 128 caracteres.
          </p>
          <ChangePasswordForm />
        </section>

        <section
          aria-labelledby="security-heading"
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
            <h2 id="security-heading" className="text-sm font-semibold text-card-foreground">
              Seguridad
            </h2>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Cookies de sesión cifradas (JWE) y enviadas solo por HTTPS.
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Cambio de contraseña limitado a 3 intentos cada 10 segundos.
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              La sesión expira a los 7 días y se renueva cada 24 h de uso.
            </li>
          </ul>
        </section>
      </div>
    </DashboardShell>
  )
}
