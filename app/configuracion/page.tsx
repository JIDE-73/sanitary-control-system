"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Bell,
  Building2,
  FileText,
  Palette,
  Save,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function ConfiguracionPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const currentTheme =
    (resolvedTheme as "light" | "dark" | undefined) ?? "light";

  const [notificaciones, setNotificaciones] = useState({
    certificadosVencer: true,
    examenesVencer: true,
    nuevoAfiliado: false,
    resultadosPendientes: true,
    emailNotificaciones: true,
  });

  const [general, setGeneral] = useState({
    nombreOrganizacion: "Secretaría de Salud - Tijuana",
    direccion: "Av. Revolución 1000, Centro, 22000 Tijuana, BC",
    telefono: "6641000000",
    email: "sics@salud.gob.mx",
    vigenciaCertificado: "30",
    diasAlertaVencimiento: "7",
  });

  const handleSaveGeneral = () => {
    toast.success("Configuración guardada correctamente");
  };

  const handleSaveNotificaciones = () => {
    toast.success("Preferencias de notificaciones actualizadas");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Administra las preferencias del sistema
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="apariencia" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Apariencia</span>
            </TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Parámetros del Sistema
                </CardTitle>
                <CardDescription>
                  Configuración de tiempos y alertas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vigencia">
                      Vigencia por defecto de certificados (días)
                    </Label>
                    <Select
                      value={general.vigenciaCertificado}
                      onValueChange={(v) =>
                        setGeneral((p) => ({ ...p, vigenciaCertificado: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 días</SelectItem>
                        <SelectItem value="30">30 días</SelectItem>
                        <SelectItem value="60">60 días</SelectItem>
                        <SelectItem value="90">90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apariencia */}
          <TabsContent value="apariencia" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Tema y Apariencia
                </CardTitle>
                <CardDescription>
                  Personaliza la apariencia del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Tema del Sistema</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        currentTheme === "light"
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-background border" />
                        <span className="font-medium">Claro</span>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full ${
                          currentTheme === "light"
                            ? "bg-primary"
                            : "border border-muted"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        currentTheme === "dark"
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-foreground" />
                        <span className="font-medium">Oscuro</span>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full ${
                          currentTheme === "dark"
                            ? "bg-primary"
                            : "border border-muted"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
