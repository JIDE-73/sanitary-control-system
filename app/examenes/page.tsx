"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { ExamenesTable } from "@/components/examenes/examenes-table";
import { Button } from "@/components/ui/button";
import { TestTube } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

export default function ExamenesPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("examenes_cs", "create");

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Exámenes Clínicos
            </h1>
            <p className="text-muted-foreground">
              Historial y seguimiento de exámenes de laboratorio
            </p>
          </div>
          {canCreate && (
            <Link href="/examenes/nuevo">
              <Button>
                <TestTube className="mr-2 h-4 w-4" />
                Ordenar Examen
              </Button>
            </Link>
          )}
        </div>

        <ExamenesTable />
      </div>
    </MainLayout>
  );
}
