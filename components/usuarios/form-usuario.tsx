"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  KeyRound,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { request } from "@/lib/request";
import type { GeneroBackend, UserPayload, UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type UserFormState = UserPayload & { confirm_password: string };

const initialForm: UserFormState = {
  curp: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  fecha_nacimiento: "",
  genero: "masculino",
  direccion: "",
  telefono: "",
  email: "",
  nombre_usuario: "",
  password: "",
  confirm_password: "",
  activo: true,
  rol_id: "",
  ultimo_login: "",
};

const passwordPattern =
  "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]).{8,}$";

interface FormUsuarioProps {
  onSubmit: (data: UserPayload) => void;
}

export function FormUsuario({ onSubmit }: FormUsuarioProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await request("/admin/rol/getRoles", "GET");
        if (response?.roles?.length) {
          setRoles(response.roles);
        } else {
          toast({
            title: "No se pudieron cargar los roles",
            description: response?.message || "Inténtalo más tarde.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al obtener roles", error);
        toast({
          title: "Error al obtener roles",
          description: "Revisa tu conexión o inténtalo más tarde.",
          variant: "destructive",
        });
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [toast]);

  const normalizeGenero = (value?: string): GeneroBackend => {
    if (value === "LGBTQ+") return "LGBTQ+";
    if (value?.toLowerCase() === "lgbt+") return "LGBTQ+";
    if (value === "femenino") return "femenino";
    return "masculino";
  };

  const handleChange = <K extends keyof UserFormState>(
    field: K,
    value: UserFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!new RegExp(passwordPattern).test(formData.password)) {
      toast({
        title: "Contraseña inválida",
        description:
          "Debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Verifica la contraseña y la confirmación.",
        variant: "destructive",
      });
      return;
    }

    const { confirm_password, ...rest } = formData;

    const payload: UserPayload = {
      ...rest,
      curp: formData.curp.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      apellido_paterno: formData.apellido_paterno.trim(),
      apellido_materno: formData.apellido_materno?.trim() || undefined,
      fecha_nacimiento: formData.fecha_nacimiento,
      genero: normalizeGenero(formData.genero),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      email: formData.email.trim(),
      nombre_usuario: formData.nombre_usuario.trim(),
      password: formData.password,
      rol_id: formData.rol_id,
      activo: Boolean(formData.activo),
      ultimo_login: formData.ultimo_login
        ? new Date(formData.ultimo_login).toISOString()
        : undefined,
    };

    try {
      setSubmitting(true);
      const response = await request(
        "/admin/users/createUser",
        "POST",
        payload
      );

      if (response.status >= 200 && response.status < 300) {
        onSubmit(payload);
        toast({
          title: "Usuario creado",
          description: "El usuario se registró correctamente.",
        });
        router.push("/usuarios");
      } else {
        toast({
          title: "No se pudo registrar",
          description:
            response?.message || "Ocurrió un error al registrar el usuario.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al crear usuario", error);
      toast({
        title: "Error al crear usuario",
        description: "Revisa tu conexión o inténtalo más tarde.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Datos personales
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="curp">CURP *</Label>
            <Input
              id="curp"
              value={formData.curp}
              onChange={(e) =>
                handleChange(
                  "curp",
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 18)
                )
              }
              placeholder="XXXX000000XXXXXX00"
              maxLength={18}
              minLength={18}
              pattern="[A-Z0-9]{18}"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                handleChange(
                  "nombre",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
                )
              }
              pattern="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
            <Input
              id="apellido_paterno"
              value={formData.apellido_paterno}
              onChange={(e) =>
                handleChange(
                  "apellido_paterno",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
                )
              }
              pattern="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido_materno">Apellido Materno</Label>
            <Input
              id="apellido_materno"
              value={formData.apellido_materno || ""}
              onChange={(e) =>
                handleChange(
                  "apellido_materno",
                  e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "")
                )
              }
              pattern="^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{2,60}$"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento *</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genero">Género *</Label>
            <Select
              value={formData.genero}
              onValueChange={(value) =>
                handleChange("genero", value as GeneroBackend)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="LGBTQ+">LGBTQ+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Contacto y ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange("direccion", e.target.value)}
              minLength={5}
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) =>
                handleChange(
                  "telefono",
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="6641234567"
              maxLength={10}
              pattern="[0-9]{10}"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Acceso y permisos
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="nombre_usuario">Nombre de usuario *</Label>
            <Input
              id="nombre_usuario"
              value={formData.nombre_usuario}
              onChange={(e) =>
                handleChange(
                  "nombre_usuario",
                  e.target.value.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 40)
                )
              }
              pattern="^[A-Za-z0-9._-]{4,40}$"
              placeholder="usuario.sics"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                pattern={passwordPattern}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Al menos 8 caracteres, 1 mayúscula, 1 número y 1 carácter
              especial.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar contraseña *</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={(e) =>
                  handleChange("confirm_password", e.target.value)
                }
                minLength={8}
                autoComplete="new-password"
                required
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
          <div className="space-y-2">
            <Label htmlFor="rol_id">Rol *</Label>
            <Select
              value={formData.rol_id}
              onValueChange={(value) => handleChange("rol_id", value)}
              disabled={rolesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    rolesLoading ? "Cargando roles..." : "Seleccionar rol"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {rolesLoading && (
                  <SelectItem value="loading" disabled>
                    Cargando roles...
                  </SelectItem>
                )}
                {!rolesLoading && roles.length === 0 && (
                  <SelectItem value="no-data" disabled>
                    No hay roles disponibles
                  </SelectItem>
                )}
                {!rolesLoading &&
                  roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="activo"
              checked={formData.activo}
              onCheckedChange={(value) => handleChange("activo", value)}
            />
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-emerald-600" />
              <Label htmlFor="activo" className="mt-0.5">
                Usuario activo
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          <KeyRound className="mr-2 h-4 w-4" />
          {submitting ? "Guardando..." : "Registrar usuario"}
        </Button>
      </div>
    </form>
  );
}
