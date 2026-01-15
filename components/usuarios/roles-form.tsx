"use client";

import { useState } from "react";
import { Loader2, RefreshCcw, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import { useRouter } from "next/navigation";

type PermissionAction = "create" | "read" | "update" | "delete";

type ModuleConfig = {
  key: string;
  label: string;
  actions: PermissionAction[];
};

type RoleState = {
  nombre: string;
  modulos: Record<string, PermissionAction[]>;
};

const modulosConfig: ModuleConfig[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "afiliados",
    label: "Afiliados",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "ciudadanos",
    label: "Ciudadanos",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "usuarios",
    label: "Usuarios",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "medicos",
    label: "Médicos",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "lugares_trabajo",
    label: "Lugares de trabajo",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "laboratorios",
    label: "Laboratorios",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "notas_medicas_cs",
    label: "Notas médicas CS",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "notas_medicas_alm",
    label: "Notas médicas ALM",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "examenes_cs",
    label: "Exámenes CS",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "certificados_alm",
    label: "Certificados ALM",
    actions: ["create", "read", "update", "delete"],
  },
];

const ACTION_LABELS: Record<PermissionAction, string> = {
  create: "Crear",
  read: "Leer",
  update: "Actualizar",
  delete: "Eliminar",
};

const buildInitialState = (): RoleState => ({
  nombre: "",
  modulos: modulosConfig.reduce<RoleState["modulos"]>((acc, module) => {
    acc[module.key] = [...module.actions];
    return acc;
  }, {}),
});

export function RolesForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [payload, setPayload] = useState<RoleState>(() => buildInitialState());
  const [submitting, setSubmitting] = useState(false);

  const togglePermission = (
    moduleKey: string,
    action: PermissionAction,
    checked: boolean
  ) => {
    setPayload((prev) => {
      const current = prev.modulos[moduleKey] || [];
      const exists = current.includes(action);
      const nextActions = checked
        ? exists
          ? current
          : [...current, action]
        : current.filter((item) => item !== action);

      return {
        ...prev,
        modulos: {
          ...prev.modulos,
          [moduleKey]: nextActions,
        },
      };
    });
  };

  const setAllForModule = (
    module: ModuleConfig,
    actions: PermissionAction[]
  ) => {
    setPayload((prev) => ({
      ...prev,
      modulos: {
        ...prev.modulos,
        [module.key]: actions,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const nombre = payload.nombre.trim();
    if (!nombre) {
      toast({
        title: "Falta el nombre del rol",
        description: "Ingresa un nombre para el rol antes de guardar.",
        variant: "destructive",
      });
      return;
    }

    const permisos = { modulos: payload.modulos };

    try {
      setSubmitting(true);
      const response = await request("/admin/rol/createRol", "POST", {
        nombre,
        permisos,
      });

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: "Rol creado",
          description: "Los permisos fueron registrados correctamente.",
        });
        router.push("/usuarios");
      } else {
        toast({
          title: "No se pudo crear el rol",
          description:
            response?.message || "Verifica los datos e inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear rol", error);
      toast({
        title: "Error al crear rol",
        description: "Revisa tu conexión o vuelve a intentarlo.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderModule = (module: ModuleConfig) => (
    <div
      key={module.key}
      className="rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{module.label}</p>
          <p className="text-xs text-muted-foreground">
            Selecciona los permisos que aplican. Dejar vacío significa sin
            permisos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAllForModule(module, module.actions)}
          >
            Todo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAllForModule(module, [])}
          >
            Sin permisos
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {module.actions.map((action) => {
          const checked =
            payload.modulos[module.key]?.includes(action) ?? false;
          return (
            <Label
              key={`${module.key}-${action}`}
              className="flex cursor-pointer items-center gap-2 text-sm font-normal"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(value) =>
                  togglePermission(module.key, action, value === true)
                }
              />
              {ACTION_LABELS[action]}
            </Label>
          );
        })}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del rol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nombre del rol</Label>
            <Input
              id="role-name"
              value={payload.nombre}
              onChange={(e) =>
                setPayload((prev) => ({ ...prev, nombre: e.target.value }))
              }
              placeholder="Ej. Médico, Supervisor, Operador"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permisos por módulo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modulosConfig.map((module) => renderModule(module))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar rol
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPayload(buildInitialState())}
          disabled={submitting}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Restaurar predeterminado
        </Button>
      </div>
    </form>
  );
}
