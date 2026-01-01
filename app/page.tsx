import { MainLayout } from "@/components/layout/main-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { CertificatesExpiring } from "@/components/dashboard/certificates-expiring"

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Sistema Integral de Control Sanitario - Resumen general</p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RecentActivity />
          <CertificatesExpiring />
        </div>
      </div>
    </MainLayout>
  )
}
