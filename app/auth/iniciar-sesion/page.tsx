import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Iniciar sesión — big_bang.services',
  description: 'Ingresá con tu correo electrónico y contraseña para acceder al panel.',
}

export default async function IniciarSesionPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground font-semibold text-lg">
            BB
          </span>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            big_bang.services
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel de administración del servicio técnico
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
