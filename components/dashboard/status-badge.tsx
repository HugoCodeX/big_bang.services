import type { EstadoEquipo } from '@/lib/equipos'

const estilos: Record<EstadoEquipo, string> = {
  Ingresado: 'bg-primary/10 text-primary',
  'En diagnóstico': 'bg-accent/10 text-accent',
  'En reparación': 'bg-warning/15 text-warning-foreground',
  'Esperando repuesto': 'bg-warning/15 text-warning-foreground',
  'Listo para retiro': 'bg-success/15 text-success',
  Entregado: 'bg-muted text-muted-foreground',
}

const punto: Record<EstadoEquipo, string> = {
  Ingresado: 'bg-primary',
  'En diagnóstico': 'bg-accent',
  'En reparación': 'bg-warning-foreground',
  'Esperando repuesto': 'bg-warning-foreground',
  'Listo para retiro': 'bg-success',
  Entregado: 'bg-muted-foreground',
}

export function StatusBadge({ estado }: { estado: EstadoEquipo }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${estilos[estado]}`}
    >
      <span className={`size-1.5 rounded-full ${punto[estado]}`} />
      {estado}
    </span>
  )
}
