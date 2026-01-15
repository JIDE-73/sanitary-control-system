"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = usuario.trim();
    const userPassword = password.trim();
    if (!username || !userPassword) {
      toast({
        title: "Faltan datos",
        description: "Ingresa tu usuario y contraseña para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await request("/admin/users/login", "POST", {
        usuario: username,
        password: userPassword,
      });

      if (!response || response.status < 200 || response.status >= 300) {
        toast({
          title: "No se pudo iniciar sesión",
          description:
            response?.message ||
            "Credenciales inválidas o servicio no disponible.",
          variant: "destructive",
        });
        return;
      }

      const activo = Boolean(
        response?.findUser?.activo ?? response?.activo ?? false
      );

      if (!activo) {
        toast({
          title: "Cuenta inactiva",
          description: "Contacta a un administrador para reactivarla.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: response?.message || "Sesión iniciada",
        description:
          "Redirigiendo al Dashboard del Sistema Integral de Control Sanitario",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      toast({
        title: "Error al iniciar sesión",
        description: "Revisa tu conexión e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted px-4">
      <Card className="w-full max-w-md border-border/80 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Iniciar sesión
          </CardTitle>
          <CardDescription>
            Accede al Sistema Integral de Control Sanitario con tu cuenta
            institucional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                placeholder="admin"
                required
                value={usuario}
                onChange={(event) => setUsuario(event.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
