import { prisma } from '@/lib/prisma'
import type {
  CampoCustom,
  EstadoEquipo,
  Equipo,
  Mantenimiento,
  TipoMantenimiento,
} from '@/lib/equipos'

export async function getEstadisticas() {
  const [totalActivos, ingresados, enDiagnostico, esperandoRepuesto] =
    await Promise.all([
      prisma.equipo.count({ where: { estado: { not: 'Entregado' } } }),
      prisma.equipo.count({ where: { estado: 'Ingresado' } }),
      prisma.equipo.count({ where: { estado: 'En diagnóstico' } }),
      prisma.equipo.count({ where: { estado: 'Esperando repuesto' } }),
    ])

  return { totalActivos, ingresados, enDiagnostico, esperandoRepuesto }
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
    precio: row.precio ?? null,
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
      camposCustom: {
        orderBy: { id: 'asc' },
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
    precio: row.precio ?? null,
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
    camposCustom: row.camposCustom.map((c): CampoCustom => ({
      id: c.id,
      equipoId: c.equipoId,
      titulo: c.titulo,
      descripcion: c.descripcion,
    })),
  }
}
