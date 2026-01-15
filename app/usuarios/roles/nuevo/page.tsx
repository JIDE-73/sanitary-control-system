"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { RolesForm } from "@/components/usuarios/roles-form";

export default function NuevoRolPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo rol</h1>
          <p className="text-muted-foreground">
            Define un rol y sus permisos por módulo.
          </p>
        </div>

        <RolesForm />
      </div>
    </MainLayout>
  );
}

