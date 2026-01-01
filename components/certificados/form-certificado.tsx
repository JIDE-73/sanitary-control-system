"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  Save,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { afiliados, medicos, examenesClinicosData } from "@/lib/mock-data";
import type { CertificadoSanitario, Afiliado } from "@/lib/types";

interface FormCertificadoProps {
  onSubmit: (data: Partial<CertificadoSanitario>) => void;
}

export function FormCertificado({ onSubmit }: FormCertificadoProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afiliadoIdParam = searchParams.get("afiliado");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(
    afiliadoIdParam
      ? afiliados.find((a) => a.id === afiliadoIdParam) || null
      : null
  );
  const [searchResults, setSearchResults] = useState<Afiliado[]>([]);
  const [formData, setFormData] = useState<Partial<CertificadoSanitario>>({
    afiliadoId: afiliadoIdParam || "",
    fechaEmision: new Date().toISOString().split("T")[0],
  });

  // Calcular fecha de vigencia (30 días por defecto)
  const calcularVigencia = (fechaEmision: string, dias = 30) => {
    const fecha = new Date(fechaEmision);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split("T")[0];
  };

  const handleSearch = () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const term = searchQuery.toLowerCase();
    const results = afiliados.filter(
      (a) =>
        a.curp.toLowerCase().includes(term) ||
        a.id.includes(term) ||
        a.nombres.toLowerCase().includes(term) ||
        a.apellidoPaterno.toLowerCase().includes(term)
    );
    setSearchResults(results);
  };

  const handleSelectAfiliado = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado);
    setFormData((prev) => ({ ...prev, afiliadoId: afiliado.id }));
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleChange = (field: keyof CertificadoSanitario, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "fechaEmision") {
        newData.fechaVigencia = calcularVigencia(value);
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const folio = `SICS-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 100000)
    ).padStart(5, "0")}`;
    onSubmit({
      ...formData,
      folio,
      fechaVigencia:
        formData.fechaVigencia ||
        calcularVigencia(
          formData.fechaEmision || new Date().toISOString().split("T")[0]
        ),
      estatus: "vigente",
      qrCode: `https://sics.gob.mx/verificar/${folio}`,
    });
  };

  // Obtener exámenes del afiliado para verificar requisitos
  const examenesAfiliado = selectedAfiliado
    ? examenesClinicosData.filter((e) => e.afiliadoId === selectedAfiliado.id)
    : [];

  const tieneVDRL = examenesAfiliado.some(
    (e) => e.tipoExamen === "VDRL" && e.resultadoVDRL === "negativo"
  );
  const tieneVIH = examenesAfiliado.some(
    (e) =>
      e.tipoExamen === "VIH" &&
      e.resultado?.toLowerCase().includes("no reactivo")
  );

  const requisitosCompletos = tieneVDRL && tieneVIH;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda de Afiliado */}
      {!selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Buscar Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por CURP, número de afiliado o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleSearch())
                }
              />
              <Button type="button" onClick={handleSearch}>
                Buscar
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((afiliado) => (
                  <div
                    key={afiliado.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectAfiliado(afiliado)}
                  >
                    <div>
                      <p className="font-medium">
                        {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
                        {afiliado.apellidoMaterno}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {afiliado.curp}
                      </p>
                    </div>
                    <Button type="button" size="sm">
                      Seleccionar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Datos del Afiliado */}
      {selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Datos del Afiliado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {selectedAfiliado.nombres}{" "}
                    {selectedAfiliado.apellidoPaterno}{" "}
                    {selectedAfiliado.apellidoMaterno}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CURP</p>
                  <p className="font-mono font-medium">
                    {selectedAfiliado.curp}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Género</p>
                  <p className="font-medium capitalize">
                    {selectedAfiliado.genero}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estatus</p>
                  <Badge
                    variant={
                      selectedAfiliado.estatus === "activo"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedAfiliado.estatus}
                  </Badge>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAfiliado(null)}
              >
                Cambiar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verificación de Requisitos */}
      {selectedAfiliado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {requisitosCompletos ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              Verificación de Requisitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {tieneVDRL ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <div>
                  <p className="font-medium">Examen VDRL</p>
                  <p className="text-sm text-muted-foreground">
                    {tieneVDRL
                      ? "Resultado negativo vigente"
                      : "Pendiente o no vigente"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {tieneVIH ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <div>
                  <p className="font-medium">Examen VIH</p>
                  <p className="text-sm text-muted-foreground">
                    {tieneVIH
                      ? "Resultado no reactivo vigente"
                      : "Pendiente o no vigente"}
                  </p>
                </div>
              </div>
            </div>
            {!requisitosCompletos && (
              <p className="mt-4 text-sm text-warning">
                El afiliado no cumple con todos los requisitos. Se puede emitir
                el certificado bajo responsabilidad del médico.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Datos del Certificado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Datos del Certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="medicoId">Médico Emisor *</Label>
            <Select
              value={formData.medicoId || ""}
              onValueChange={(value) => handleChange("medicoId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar médico" />
              </SelectTrigger>
              <SelectContent>
                {medicos
                  .filter((m) => m.estatus === "activo")
                  .map((medico) => (
                    <SelectItem key={medico.id} value={medico.id}>
                      Dr(a). {medico.nombres} {medico.apellidoPaterno} -{" "}
                      {medico.especialidad}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
            <Input
              id="fechaEmision"
              type="date"
              value={formData.fechaEmision || ""}
              onChange={(e) => handleChange("fechaEmision", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaVigencia">Fecha de Vigencia *</Label>
            <Input
              id="fechaVigencia"
              type="date"
              value={
                formData.fechaVigencia ||
                calcularVigencia(
                  formData.fechaEmision ||
                    new Date().toISOString().split("T")[0]
                )
              }
              onChange={(e) => handleChange("fechaVigencia", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!selectedAfiliado || !formData.medicoId}
        >
          <Save className="mr-2 h-4 w-4" />
          Emitir Certificado
        </Button>
      </div>
    </form>
  );
}
