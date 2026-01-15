"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { RolesForm } from "@/components/usuarios/roles-form";

export default function RolesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Crea o ajusta los permisos que se enviarán al endpoint de creación
            de roles.
          </p>
        </div>

        <RolesForm />
      </div>
    </MainLayout>
  );
}
