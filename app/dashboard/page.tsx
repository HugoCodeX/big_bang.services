import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardShell } from '@/components/dashboard/shell'
import { EquipmentTable } from '@/components/dashboard/equipment-table'
import { StatCards } from '@/components/dashboard/stat-cards'
import { getEquipos, getEstadisticas } from '@/lib/queries/dashboard'

export default async function DashboardPage() {
  const [stats, equipos] = await Promise.all([
    getEstadisticas(),
    getEquipos(),
  ])

  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHeader />

        <StatCards
          totalActivos={stats.totalActivos}
          ingresados={stats.ingresados}
          enDiagnostico={stats.enDiagnostico}
          esperandoRepuesto={stats.esperandoRepuesto}
        />

        <EquipmentTable initialEquipos={equipos} />
      </div>
    </DashboardShell>
  )
}
