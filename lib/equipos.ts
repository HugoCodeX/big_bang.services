export type TipoEquipo =
  | 'PC Escritorio'
  | 'Notebook'
  | 'PS3'
  | 'PS4'
  | 'PS5'
  | 'MacBook Air'
  | 'MacBook Pro'
  | 'iPhone'
  | 'Android'
  | 'Mac Escritorio'

export type MarcaNotebook =
  | 'Asus'
  | 'Lenovo'
  | 'HP'
  | 'Acer'
  | 'Dell'
  | 'MSI'
  | 'Huawei'
  | 'Samsung'
  | 'LG'
  | 'Razer'
  | 'Microsoft'
  | 'Gigabyte'
  | 'Chuwi'
  | 'Otro'

export type TipoMantenimiento =
  | 'Mantenimiento completo'
  | 'Cambio de pantalla'
  | 'Reparación de componente'

export type EstadoEquipo =
  | 'Ingresado'
  | 'En diagnóstico'
  | 'En reparación'
  | 'Esperando repuesto'
  | 'Listo para retiro'
  | 'Entregado'

export interface Equipo {
  id: number
  tipo: string
  marca: string | null
  cliente: string
  telefono: string
  precio: string | null
  comentarios: string
  estado: EstadoEquipo
  fechaIngreso: Date
}

export interface Mantenimiento {
  id: number
  equipoId: number
  tipo: TipoMantenimiento
  componente: string | null
  observacion: string
  fecha: Date
}

export interface CampoCustom {
  id: number
  equipoId: number
  titulo: string
  descripcion: string
}

export function formatOrderNumber(id: number): string {
  return `EQ-${String(id).padStart(4, '0')}`
}

function pad2(value: string | number): string {
  return String(value).padStart(2, '0')
}

export function getCurrentDateInChile(): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value ?? ''
  const month = parts.find((p) => p.type === 'month')?.value ?? ''
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  return `${year}-${pad2(month)}-${pad2(day)}`
}

export function getCurrentTimeInChile(): string {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)
  let hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  if (hour === '24') hour = '00'
  return `${pad2(hour)}:${pad2(minute)}`
}

function getChileOffsetMinutes(year: number, month: number, day: number): number {
  const tempUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const offsetStr =
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Santiago',
      timeZoneName: 'longOffset',
    })
      .formatToParts(tempUtc)
      .find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-04:00'
  const match = offsetStr.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
  if (!match) return -240
  const sign = match[1] === '+' ? 1 : -1
  const hours = Number(match[2])
  const minutes = Number(match[3] || '0')
  return sign * (hours * 60 + minutes)
}

export function combineDateTimeInChile(date: string, time: string): Date {
  if (!date || !time) {
    return new Date()
  }
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = time.split(':').map(Number)
  if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) {
    return new Date()
  }
  const offsetMinutes = getChileOffsetMinutes(y, mo, d)
  const localAsUtc = Date.UTC(y, mo - 1, d, h, mi, 0)
  return new Date(localAsUtc - offsetMinutes * 60 * 1000)
}

export function formatDateInChile(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function splitDateTimeInChile(date: Date): {
  fecha: string
  hora: string
} {
  const d = new Date(date)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  let hour = get('hour')
  if (hour === '24') hour = '00'
  return {
    fecha: `${get('year')}-${get('month')}-${get('day')}`,
    hora: `${hour}:${get('minute')}`,
  }
}

export function formatDateTimeInChile(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}
