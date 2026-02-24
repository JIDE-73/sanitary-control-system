"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { StatisticsCharts } from "@/components/dashboard/statistics-charts";
import { TestResultsChart } from "@/components/dashboard/test-results-chart";
import { CertificatesExpiring } from "@/components/dashboard/certificates-expiring";
import { ReportsSection } from "@/components/dashboard/reports-section";
import {
  getFirstAccessibleRoute,
  useAuth,
} from "@/components/auth/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { loading, isAuthenticated, hasPermission, user } = useAuth();
  const canReadDashboard = hasPermission("dashboard", "read");
  const fallbackRoute = getFirstAccessibleRoute(user);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }
    if (!canReadDashboard) {
      router.replace(fallbackRoute);
    }
  }, [loading, isAuthenticated, canReadDashboard, fallbackRoute, router]);

  return (
    <MainLayout>
      {loading || !isAuthenticated || !canReadDashboard ? (
        <div className="px-4 sm:px-0 text-sm text-muted-foreground">
          Redirigiendo a un módulo disponible...
        </div>
      ) : (
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

          {/* Reports */}
          <ReportsSection />
        </div>
      )}
    </MainLayout>
  );
}
