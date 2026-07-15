import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [nextCookies()],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    freshAge: 60 * 60,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
      strategy: 'jwe',
    },
  },
  rateLimit: {
    enabled: true,
    storage: 'database',
    customRules: {
      '/api/auth/sign-in/email': { window: 60, max: 5 },
      '/api/auth/sign-up/email': { window: 60, max: 3 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-forwarded-for', 'x-real-ip'],
    },
    defaultCookieAttributes: {
      sameSite: 'lax',
    },
    backgroundTasks: {
      handler: (promise) => {
        promise.catch(() => {})
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // eslint-disable-next-line no-console
          console.log(`[auth] Nueva sesión: ${session.id}`)
        },
      },
      delete: {
        before: async (session) => {
          // eslint-disable-next-line no-console
          console.log(`[auth] Sesión revocada: ${session.id}`)
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          // eslint-disable-next-line no-console
          console.log(
            `[auth] Cuenta vinculada: ${account.providerId} para usuario ${account.userId}`,
          )
        },
      },
    },
    user: {
      update: {
        after: async (user) => {
          // eslint-disable-next-line no-console
          console.log(`[auth] Usuario actualizado: ${user.id}`)
        },
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
