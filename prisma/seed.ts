import 'dotenv/config'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const EMAIL = process.env.EMAIL_ACCOUNT
const PASSWORD = process.env.PASSWORD_ACCOUNT
const ADMIN_NAME = process.env.NAME_ACCOUNT ?? 'Administrador'

async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos…')

  // Orden importa por las foreign keys con onDelete: Cascade.
  // mantenimientos dependen de equipo; accounts/sessions dependen de user.
  const deleted = await prisma.$transaction([
    prisma.mantenimiento.deleteMany(),
    prisma.equipo.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.rateLimit.deleteMany(),
    prisma.user.deleteMany(),
  ])

  const summary = deleted
    .map((r, i) => `${tableNames[i]}: ${r.count}`)
    .join(' · ')
  console.log(`   ✓ ${summary}`)
}

const tableNames = [
  'mantenimientos',
  'equipos',
  'sessions',
  'accounts',
  'verifications',
  'rateLimits',
  'users',
]

async function seedAdmin() {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ Faltan EMAIL_ACCOUNT o PASSWORD_ACCOUNT en el .env')
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({
    where: { email: EMAIL },
  })

  if (existing) {
    console.log(`⚠️  El usuario "${EMAIL}" ya existe. Saltando seed.`)
    return
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: EMAIL,
      name: ADMIN_NAME,
      password: PASSWORD,
    },
  })

  if (!result?.user) {
    console.error('❌ No se pudo crear el usuario.')
    process.exit(1)
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: { emailVerified: true },
  })

  console.log(`✅ Cuenta administradora "${EMAIL}" creada y verificada.`)
}

async function main() {
  await cleanDatabase()
  await seedAdmin()
  console.log('🎉 Seed finalizado.')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error('❌ Error durante el seed:', err)
    await prisma.$disconnect()
    process.exit(1)
  })
