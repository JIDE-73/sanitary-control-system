"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { RolesForm } from "@/components/usuarios/roles-form";
import { RolesTable } from "@/components/usuarios/roles-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RolesPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">
            Consulta los roles registrados y sus permisos por módulo.
          </p>
        </div>

        <div className="flex justify-end">
          <Button asChild>
            <Link href="/usuarios/roles/nuevo">Nuevo rol</Link>
          </Button>
        </div>

        <RolesTable />
      </div>
    </MainLayout>
  );
}
