import { prisma } from '@/lib/prisma'
import type {
  EstadoEquipo,
  Equipo,
  Mantenimiento,
  TipoMantenimiento,
} from '@/lib/equipos'

export async function getEstadisticas() {
  const [totalActivos, ingresados] = await Promise.all([
    prisma.equipo.count({ where: { estado: { not: 'Entregado' } } }),
    prisma.equipo.count({ where: { estado: 'Ingresado' } }),
  ])

  return { totalActivos, ingresados }
}

export async function getEquipos(): Promise<Equipo[]> {
  const rows = await prisma.equipo.findMany({
    orderBy: { id: 'desc' },
  })

  return rows.map((row) => ({
    id: row.id,
    tipo: row.tipo,
    marca: row.marca ?? null,
    cliente: row.cliente,
    telefono: row.telefono,
    comentarios: row.comentarios,
    estado: row.estado as EstadoEquipo,
    fechaIngreso: row.fechaIngreso,
  }))
}

export async function getEquipoWithMantenimientos(id: number) {
  const row = await prisma.equipo.findUnique({
    where: { id },
    include: {
      mantenimientos: {
        orderBy: { fecha: 'desc' },
      },
    },
  })

  if (!row) return null

  return {
    id: row.id,
    tipo: row.tipo,
    marca: row.marca ?? null,
    cliente: row.cliente,
    telefono: row.telefono,
    comentarios: row.comentarios,
    estado: row.estado as EstadoEquipo,
    fechaIngreso: row.fechaIngreso,
    mantenimientos: row.mantenimientos.map((m): Mantenimiento => ({
      id: m.id,
      equipoId: m.equipoId,
      tipo: m.tipo as TipoMantenimiento,
      componente: m.componente,
      observacion: m.observacion,
      fecha: m.fecha,
    })),
  }
}
