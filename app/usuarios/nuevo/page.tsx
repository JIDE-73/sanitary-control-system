"use client";

import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormUsuario } from "@/components/usuarios/form-usuario";
import type { UserPayload } from "@/lib/types";

export default function NuevoUsuarioPage() {
  const router = useRouter();

  const handleSubmit = (_data: UserPayload) => {
    router.push("/usuarios");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Usuario</h1>
          <p className="text-muted-foreground">
            Registra un usuario con las mismas validaciones que ciudadanos y
            afiliados.
          </p>
        </div>

        <FormUsuario onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
}
