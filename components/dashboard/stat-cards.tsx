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
          className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 motion-safe:transition-all motion-safe:duration-200 hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg dark:hover:shadow-[0_8px_24px_-8px_rgb(0_0_0_/_0.5)]"
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
