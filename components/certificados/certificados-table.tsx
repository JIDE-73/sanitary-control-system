"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { request } from "@/lib/request";
import type { AlcoholCertificate } from "@/lib/types";

const formatBoolean = (value: any) => {
  if (value === null || value === undefined) return "Sin dato";
  return value ? "Sí" : "No";
};

const formatDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("es-MX");
};

const prettyLabel = (key: string) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export function CertificadosTable() {
  const [certificates, setCertificates] = useState<AlcoholCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AlcoholCertificate | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await request(
          "/alcoholimetria/certificates/getCertificates",
          "GET"
        );

        if (!active) return;

        if (
          response.status >= 200 &&
          response.status < 300 &&
          Array.isArray(response.certificates)
        ) {
          setCertificates(response.certificates);
        } else {
          setError(
            response.message || "No se pudieron cargar los certificados"
          );
        }
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Error al cargar certificados"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCertificates();

    return () => {
      active = false;
    };
  }, []);

  const modalFields = useMemo(() => {
    if (!selected) return [];
    return Object.entries(selected).map(([key, value]) => ({
      key,
      label: prettyLabel(key),
      value:
        typeof value === "boolean"
          ? formatBoolean(value)
          : key.includes("fecha")
          ? formatDate(String(value))
          : value === null || value === undefined || value === ""
          ? "Sin dato"
          : String(value),
    }));
  }, [selected]);

  const handleOpenDetails = (certificate: AlcoholCertificate) => {
    setSelected(certificate);
    setOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Codigo de documento</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Edad</TableHead>
              <TableHead>Fecha de expedición</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando certificados...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-6 text-center text-destructive"
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </TableCell>
              </TableRow>
            ) : certificates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  No se encontraron certificados
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((certificate) => {
                const isEbrio = Boolean((certificate as any).estado_ebriedad);
                return (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {certificate.id?.slice(0, 8) ?? "Sin ID"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {certificate.nombre || "Sin nombre"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {certificate.genero || "N/D"}
                    </TableCell>
                    <TableCell>{certificate.edad ?? "N/D"}</TableCell>
                    <TableCell>
                      {formatDate(certificate.fecha_expedicion)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isEbrio ? "destructive" : "secondary"}>
                        {isEbrio
                          ? "En estado de ebriedad"
                          : "Sin ebriedad aparente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDetails(certificate)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={open}
        onOpenChange={(value) => {
          setOpen(value);
          if (!value) setSelected(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.nombre
                ? `Certificado de ${selected.nombre}`
                : "Detalle del certificado"}
            </DialogTitle>
            <DialogDescription>
              {selected?.fecha_expedicion
                ? `Emitido el ${formatDate(selected.fecha_expedicion)}`
                : null}
              {selected?.id ? ` • ID: ${selected.id}` : null}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <ScrollArea className="max-h-[70vh] pr-2">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {modalFields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-lg border bg-muted/40 p-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="text-sm font-semibold wrap-break-word">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
