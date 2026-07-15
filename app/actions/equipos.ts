'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  combineDateTimeInChile,
  getCurrentDateInChile,
  getCurrentTimeInChile,
  type EstadoEquipo,
  type Mantenimiento,
  type TipoMantenimiento,
} from '@/lib/equipos'

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('No autorizado.')
  return session
}

export async function fetchEquipoDetail(id: number) {
  await requireSession()

  const row = await prisma.equipo.findUnique({
    where: { id },
    include: { mantenimientos: { orderBy: { fecha: 'desc' } } },
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

export async function createEquipo(formData: FormData) {
  await requireSession()

  const tipoSeleccionado = (formData.get('tipo') as string | null)?.trim() || ''
  const tipoOtro = (formData.get('tipoOtro') as string | null)?.trim() || ''
  const marcaSeleccionada = (formData.get('marca') as string | null)?.trim() || ''
  const marcaOtra = (formData.get('marcaOtra') as string | null)?.trim() || ''
  const cliente = (formData.get('cliente') as string | null)?.trim() || ''
  const telefono = (formData.get('telefono') as string | null)?.trim() || ''
  const comentarios = (formData.get('comentarios') as string | null)?.trim() || ''
  const fecha = (formData.get('fecha') as string | null)?.trim() || getCurrentDateInChile()
  const hora = (formData.get('hora') as string | null)?.trim() || getCurrentTimeInChile()

  if (!tipoSeleccionado) {
    return { error: 'Elegí el tipo de equipo.' }
  }
  if (tipoSeleccionado === 'Otro' && !tipoOtro) {
    return { error: 'Indicá qué tipo de equipo es.' }
  }

  const tipoFinal =
    tipoSeleccionado === 'Otro' ? tipoOtro : tipoSeleccionado

  const isNotebook = tipoFinal === 'Notebook'
  if (isNotebook && !marcaSeleccionada) {
    return { error: 'La marca del notebook es obligatoria.' }
  }

  const marcaFinal = isNotebook
    ? marcaSeleccionada === 'Otro'
      ? marcaOtra || 'Otro'
      : marcaSeleccionada
    : null

  const fechaIngreso = combineDateTimeInChile(fecha, hora)

  await prisma.equipo.create({
    data: {
      tipo: tipoFinal,
      marca: marcaFinal,
      cliente,
      telefono,
      comentarios,
      estado: 'Ingresado',
      fechaIngreso,
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateEquipo(formData: FormData) {
  await requireSession()

  const id = Number(formData.get('id'))
  const estado = formData.get('estado') as EstadoEquipo
  const cliente = (formData.get('cliente') as string | null)?.trim() || ''
  const telefono = (formData.get('telefono') as string | null)?.trim() || ''

  if (!id) {
    return { error: 'Falta el identificador del equipo.' }
  }
  if (!estado) {
    return { error: 'El estado es obligatorio.' }
  }

  await prisma.equipo.update({
    where: { id },
    data: {
      estado,
      cliente,
      telefono,
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function addMantenimiento(formData: FormData) {
  await requireSession()

  const equipoId = Number(formData.get('equipoId'))
  const tipo = (formData.get('tipo') as string | null)?.trim() || ''
  const componente = (formData.get('componente') as string | null)?.trim() || null
  const observacion = (formData.get('observacion') as string | null)?.trim() || ''
  const fecha = (formData.get('fecha') as string | null)?.trim() || getCurrentDateInChile()
  const hora = (formData.get('hora') as string | null)?.trim() || getCurrentTimeInChile()

  if (!equipoId) {
    return { error: 'Falta el identificador del equipo.' }
  }
  if (!tipo) {
    return { error: 'El tipo de mantenimiento es obligatorio.' }
  }
  if (tipo === 'Reparación de componente' && !componente) {
    return { error: 'Indicá el componente reparado.' }
  }

  const fechaMantenimiento = combineDateTimeInChile(fecha, hora)

  await prisma.mantenimiento.create({
    data: {
      equipoId,
      tipo,
      componente: tipo === 'Reparación de componente' ? componente : null,
      observacion,
      fecha: fechaMantenimiento,
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateMantenimiento(formData: FormData) {
  await requireSession()

  const id = Number(formData.get('id'))
  const tipo = (formData.get('tipo') as string | null)?.trim() || ''
  const componente = (formData.get('componente') as string | null)?.trim() || null
  const observacion = (formData.get('observacion') as string | null)?.trim() || ''
  const fecha = (formData.get('fecha') as string | null)?.trim() || getCurrentDateInChile()
  const hora = (formData.get('hora') as string | null)?.trim() || getCurrentTimeInChile()

  if (!id) {
    return { error: 'Falta el identificador del mantenimiento.' }
  }
  if (!tipo) {
    return { error: 'El tipo de mantenimiento es obligatorio.' }
  }
  if (tipo === 'Reparación de componente' && !componente) {
    return { error: 'Indicá el componente reparado.' }
  }

  const fechaMantenimiento = combineDateTimeInChile(fecha, hora)

  await prisma.mantenimiento.update({
    where: { id },
    data: {
      tipo,
      componente: tipo === 'Reparación de componente' ? componente : null,
      observacion,
      fecha: fechaMantenimiento,
    },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteMantenimiento(id: number) {
  await requireSession()

  if (!id) {
    return { error: 'Falta el identificador del mantenimiento.' }
  }

  await prisma.mantenimiento.delete({
    where: { id },
  })

  revalidatePath('/dashboard')
  return { success: true }
}
