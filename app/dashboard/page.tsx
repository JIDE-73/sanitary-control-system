import { MainLayout } from "@/components/layout/main-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { TestResultsChart } from "@/components/dashboard/test-results-chart";
import { CertificatesExpiring } from "@/components/dashboard/certificates-expiring";
import { RequireModuleAccess } from "@/components/auth/auth-context";

export default function DashboardPage() {
  return (
    <RequireModuleAccess module="dashboard" action="read">
      <MainLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Sistema Integral de Control Medico - Resumen general
            </p>
          </div>

          {/* Stats */}
          <StatsCards />

          {/* Statistics Charts */}
          <StatisticsCharts />

          {/* Test Results Charts */}
          <TestResultsChart />

          {/* Certificates Expiring */}

        </div>
      </MainLayout>
    </RequireModuleAccess>
  );
}
