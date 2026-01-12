"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UsuariosListado } from "@/components/usuarios/ususarios-table";

export default function UsuariosPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground">
              Gestiona los usuarios del sistema y crea nuevos registros.
            </p>
          </div>
          <Button asChild>
            <Link href="/usuarios/nuevo">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </Button>
        </div>

        <UsuariosListado ciudadanos={[]} />
      </div>
    </MainLayout>
  );
}
