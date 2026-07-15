import { Inbox, Wrench } from 'lucide-react'

export function StatCards({
  totalActivos,
  ingresados,
}: {
  totalActivos: number
  ingresados: number
}) {
  const stats = [
    {
      label: 'Equipos activos',
      value: totalActivos,
      icon: Wrench,
    },
    {
      label: 'Ingresados',
      value: ingresados,
      icon: Inbox,
    },
  ]

  return (
    <section
      aria-label="Estadísticas principales"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group rounded-lg border border-border bg-card p-5 motion-safe:transition-shadow motion-safe:duration-200 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <stat.icon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-card-foreground">
            {stat.value}
          </p>
        </div>
      ))}
    </section>
  )
}
