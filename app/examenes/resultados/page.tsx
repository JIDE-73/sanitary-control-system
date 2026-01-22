"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ResultadosTable } from "@/components/examenes/resultados-table";
import { useAuth } from "@/components/auth/auth-context";

export default function ResultadosExamenesPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("examenes_cs", "read");

  if (!canRead) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            No tienes permisos para ver esta sección.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Resultados de Exámenes
          </h1>
          <p className="text-muted-foreground">
            Consulta y visualiza los resultados de exámenes de laboratorio
          </p>
        </div>

        <ResultadosTable />
      </div>
    </MainLayout>
  );
}

