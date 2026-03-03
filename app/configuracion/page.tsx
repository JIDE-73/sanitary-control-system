"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/components/auth/auth-context";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Palette,
  Save,
  Clock,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/request";

export default function ConfiguracionPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();
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
    vigenciaCertificado: (() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("config_vigenciaCertificado");
        return stored || "30";
      }
      return "30";
    })(),
    diasAlertaVencimiento: "7",
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveGeneral = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("config_vigenciaCertificado", general.vigenciaCertificado);
    }
    toast.success("Configuración guardada correctamente");
  };

  const handleSaveNotificaciones = () => {
    toast.success("Preferencias de notificaciones actualizadas");
  };

  const handleUpdatePassword = async () => {
    const password = passwordData.password;
    const confirmPassword = passwordData.confirmPassword;

    if (!password || !confirmPassword) {
      toast.error("Ingresa y confirma la nueva contraseña");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (!user?.id) {
      toast.error("No se pudo identificar al usuario autenticado");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await request(
        `/admin/users/updatePassword/${encodeURIComponent(user.id)}`,
        "PUT",
        { password }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Contraseña actualizada correctamente");
        setPasswordData({ password: "", confirmPassword: "" });
        setShowPassword(false);
        setShowConfirmPassword(false);
        return;
      }

      toast.error(response.message || "No se pudo actualizar la contraseña");
    } catch (error) {
      console.error("Error al actualizar contraseña", error);
      toast.error("Ocurrió un error al actualizar la contraseña");
    } finally {
      setSavingPassword(false);
    }
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
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
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
                  Configuración de valides de certificados
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

          {/* Seguridad */}
          <TabsContent value="seguridad" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Cambiar Contraseña
                </CardTitle>
                <CardDescription>
                  Actualiza tu contraseña de acceso al sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={passwordData.password}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        autoComplete="new-password"
                        disabled={savingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">
                      Confirmar contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-new-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        autoComplete="new-password"
                        disabled={savingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={
                          showConfirmPassword
                            ? "Ocultar confirmación"
                            : "Mostrar confirmación"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleUpdatePassword} disabled={savingPassword}>
                    <Save className="mr-2 h-4 w-4" />
                    {savingPassword ? "Guardando..." : "Actualizar contraseña"}
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
