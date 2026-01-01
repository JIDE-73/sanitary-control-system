import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Phone, Mail, Briefcase, Globe } from "lucide-react"
import type { Afiliado, LugarTrabajo } from "@/lib/types"

interface DatosPersonalesProps {
  afiliado: Afiliado
  lugarTrabajo?: LugarTrabajo
}

const generoLabels = {
  masculino: "Masculino",
  femenino: "Femenino",
  "lgbt+": "LGBT+",
}

export function DatosPersonales({ afiliado, lugarTrabajo }: DatosPersonalesProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">CURP</p>
              <p className="font-mono font-medium">{afiliado.curp}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estatus</p>
              <Badge
                variant={
                  afiliado.estatus === "activo" ? "default" : afiliado.estatus === "pendiente" ? "outline" : "secondary"
                }
              >
                {afiliado.estatus.charAt(0).toUpperCase() + afiliado.estatus.slice(1)}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nombre Completo</p>
            <p className="font-medium">
              {afiliado.nombres} {afiliado.apellidoPaterno} {afiliado.apellidoMaterno}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
              <p className="font-medium">{new Date(afiliado.fechaNacimiento).toLocaleDateString("es-MX")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Género</p>
              <p className="font-medium">{generoLabels[afiliado.genero]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección y Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            Dirección y Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium">{afiliado.calle}</p>
            <p className="text-sm text-muted-foreground">
              {afiliado.colonia}, C.P. {afiliado.codigoPostal}
            </p>
            <p className="text-sm text-muted-foreground">
              {afiliado.ciudad}, {afiliado.estado}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{afiliado.telefono}</p>
              </div>
            </div>
            {afiliado.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{afiliado.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información Laboral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            Información Laboral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lugarTrabajo ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Lugar de Trabajo</p>
                <p className="font-medium">{lugarTrabajo.nombre}</p>
                <p className="text-sm text-muted-foreground">Código: {lugarTrabajo.codigo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zona de Trabajo</p>
                <p className="font-medium">{lugarTrabajo.zonaTrabajo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ocupación</p>
                <p className="font-medium">{afiliado.ocupacion || "No especificada"}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Sin lugar de trabajo asignado</p>
          )}
        </CardContent>
      </Card>

      {/* Lugar de Procedencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Lugar de Procedencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Procedencia</p>
            <p className="font-medium">{afiliado.lugarProcedencia || "No especificado"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de Registro</p>
              <p className="font-medium">{new Date(afiliado.fechaRegistro).toLocaleDateString("es-MX")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Actualización</p>
              <p className="font-medium">{new Date(afiliado.fechaActualizacion).toLocaleDateString("es-MX")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
