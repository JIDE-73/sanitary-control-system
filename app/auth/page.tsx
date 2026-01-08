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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    toast({
      title: "Sesión iniciada",
      description:
        "Redirigiendo al Dashboard del Sistema Integral de Control Sanitario",
    });

    router.push("/dashboard");
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
              <Label htmlFor="email">Correo institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@salud.gob.mx"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
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
