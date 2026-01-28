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
        <div className="space-y-6 px-4 sm:px-0">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <img
              src="/Logo_XXVAyto_Vertical.png"
              alt="SICS - Sistema Integral de Control Sanitario"
              className="h-12 w-auto object-contain sm:h-16"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sistema Integral de Control Medico - Resumen general
              </p>
            </div>
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
