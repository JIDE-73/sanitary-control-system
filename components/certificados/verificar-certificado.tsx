"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { certificados, afiliados, medicos } from "@/lib/mock-data";
import type { CertificadoSanitario } from "@/lib/types";

interface VerificarCertificadoProps {
  initialFolio?: string;
}

export function VerificarCertificado({
  initialFolio,
}: VerificarCertificadoProps) {
  const [folio, setFolio] = useState(initialFolio || "");
  const [resultado, setResultado] = useState<{
    certificado: CertificadoSanitario | null;
    encontrado: boolean;
    buscado: boolean;
  }>({ certificado: null, encontrado: false, buscado: false });

  const handleVerificar = () => {
    const certificado = certificados.find(
      (c) => c.folio.toLowerCase() === folio.toLowerCase()
    );
    setResultado({
      certificado: certificado || null,
      encontrado: !!certificado,
      buscado: true,
    });
  };

  const getAfiliado = (afiliadoId: string) =>
    afiliados.find((a) => a.id === afiliadoId);

  const getMedico = (medicoId: string) =>
    medicos.find((m) => m.id === medicoId);

  const isVigente = (fechaVigencia: string) => {
    return new Date(fechaVigencia) >= new Date();
  };

  return (
    <div className="space-y-6">
      {/* Formulario de Verificación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5 text-primary" />
            Verificar Certificado Sanitario
          </CardTitle>
          <CardDescription>
            Ingrese el folio del certificado para verificar su autenticidad y
            vigencia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folio">Folio del Certificado</Label>
            <div className="flex gap-2">
              <Input
                id="folio"
                placeholder="Ej: SICS-2024-00001"
                value={folio}
                onChange={(e) => setFolio(e.target.value.toUpperCase())}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleVerificar())
                }
                className="font-mono"
              />
              <Button onClick={handleVerificar} disabled={!folio}>
                <Search className="mr-2 h-4 w-4" />
                Verificar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultado de Verificación */}
      {resultado.buscado && (
        <>
          {resultado.encontrado && resultado.certificado ? (
            <Card
              className={
                resultado.certificado.estatus === "vigente" &&
                isVigente(resultado.certificado.fechaVigencia)
                  ? "border-success"
                  : resultado.certificado.estatus === "cancelado"
                  ? "border-destructive"
                  : "border-warning"
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {resultado.certificado.estatus === "vigente" &&
                  isVigente(resultado.certificado.fechaVigencia) ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-success" />
                      <span className="text-success">Certificado Válido</span>
                    </>
                  ) : resultado.certificado.estatus === "cancelado" ? (
                    <>
                      <XCircle className="h-6 w-6 text-destructive" />
                      <span className="text-destructive">
                        Certificado Cancelado
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-6 w-6 text-warning" />
                      <span className="text-warning">Certificado Vencido</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Datos del Certificado */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Folio</p>
                      <p className="font-mono font-bold text-lg">
                        {resultado.certificado.folio}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Fecha de Emisión
                        </p>
                        <p className="font-medium">
                          {new Date(
                            resultado.certificado.fechaEmision
                          ).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Vigente hasta
                        </p>
                        <p
                          className={`font-medium ${
                            !isVigente(resultado.certificado.fechaVigencia)
                              ? "text-destructive"
                              : ""
                          }`}
                        >
                          {new Date(
                            resultado.certificado.fechaVigencia
                          ).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estatus</p>
                      <Badge
                        variant={
                          resultado.certificado.estatus === "vigente" &&
                          isVigente(resultado.certificado.fechaVigencia)
                            ? "default"
                            : resultado.certificado.estatus === "cancelado"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          resultado.certificado.estatus === "vigente" &&
                          isVigente(resultado.certificado.fechaVigencia)
                            ? "bg-success"
                            : ""
                        }
                      >
                        {resultado.certificado.estatus === "vigente" &&
                        !isVigente(resultado.certificado.fechaVigencia)
                          ? "Vencido"
                          : resultado.certificado.estatus
                              .charAt(0)
                              .toUpperCase() +
                            resultado.certificado.estatus.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Datos del Afiliado */}
                    {(() => {
                      const afiliado = getAfiliado(
                        resultado.certificado.afiliadoId
                      );
                      return afiliado ? (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                          <User className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Titular del Certificado
                            </p>
                            <p className="font-medium">
                              {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                              {afiliado.apellidoMaterno}
                            </p>
                            <p className="font-mono text-sm text-muted-foreground">
                              {afiliado.curp}
                            </p>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Datos del Médico */}
                    {(() => {
                      const medico = getMedico(resultado.certificado.medicoId);
                      return medico ? (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                          <Stethoscope className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Médico Emisor
                            </p>
                            <p className="font-medium">
                              Dr(a). {medico.nombres} {medico.apellidoPaterno}{" "}
                              {medico.apellidoMaterno}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cédula: {medico.cedulaProfesional}
                            </p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-6 w-6" />
                  Certificado No Encontrado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No se encontró ningún certificado con el folio{" "}
                  <span className="font-mono font-medium">{folio}</span>.
                  Verifique que el folio esté escrito correctamente.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
