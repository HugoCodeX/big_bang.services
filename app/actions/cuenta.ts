'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

type ChangePasswordResult =
  | { ok: true }
  | { ok: false; error: string }

function getErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'INVALID_PASSWORD':
    case 'INVALID_CREDENTIALS':
      return 'La contraseña actual es incorrecta.'
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
      return 'La nueva contraseña debe tener entre 8 y 128 caracteres.'
    case 'PASSWORD_COMPROMISED':
      return 'Esa contraseña aparece en filtraciones conocidas. Elegí otra.'
    case 'RATE_LIMITED':
      return 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.'
    case 'UNAUTHORIZED':
    case 'SESSION_EXPIRED':
      return 'Tu sesión expiró. Volvé a iniciar sesión.'
    default:
      return 'No se pudo cambiar la contraseña. Intentá de nuevo.'
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  revokeOtherSessions: boolean,
): Promise<ChangePasswordResult> {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { ok: false, error: 'Completá todos los campos.' }
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: 'La nueva contraseña y su confirmación no coinciden.' }
  }
  if (currentPassword === newPassword) {
    return { ok: false, error: 'La nueva contraseña tiene que ser distinta de la actual.' }
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return { ok: false, error: 'La nueva contraseña debe tener entre 8 y 128 caracteres.' }
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { ok: false, error: 'Tu sesión expiró. Volvé a iniciar sesión.' }
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions,
      },
      headers: await headers(),
    })

    console.log(
      `[auth] Contraseña cambiada para usuario ${session.user.id}${revokeOtherSessions ? ' (otras sesiones revocadas)' : ''}`,
    )

    revalidatePath('/dashboard/configuracion')
    return { ok: true }
  } catch (err: unknown) {
    const code = (err as { body?: { code?: string }; code?: string })?.body?.code
      ?? (err as { code?: string })?.code
    console.warn(`[auth] Error al cambiar contraseña: ${code ?? 'unknown'}`)
    return { ok: false, error: getErrorMessage(code) }
  }
}
