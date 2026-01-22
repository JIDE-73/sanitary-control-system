"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { BitacoraTable } from "@/components/usuarios/bitacora-table";

export default function BitacoraPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bitácora de Auditoría</h1>
          <p className="text-muted-foreground">
            Registro de todas las acciones realizadas en el sistema.
          </p>
        </div>

        <BitacoraTable />
      </div>
    </MainLayout>
  );
}

