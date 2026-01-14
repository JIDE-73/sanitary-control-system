"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardPlus, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { NotasMedicasALMTable } from "@/components/notas-medicas-alm/notas-alm-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NotaMedicaALMRecord } from "@/lib/notas-medicas-alm";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

export default function NotasMedicasALMPage() {
  const [notas, setNotas] = useState<NotaMedicaALMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchNotas = async () => {
      setLoading(true);
      try {
        const response = await request(
          "/alcoholimetria/medicalNotes/getMedicalNotes",
          "GET"
        );

        if (response.status >= 200 && response.status < 300) {
          setNotas(Array.isArray(response.notes) ? response.notes : []);
        } else {
          toast({
            title: "No se pudieron obtener las notas",
            description:
              response?.message ||
              "El backend devolvió un error al listar las notas.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al cargar notas ALM", error);
        toast({
          title: "Error de red",
          description: "No se pudo comunicar con el backend.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotas();
  }, []);

  const filteredNotas = useMemo(() => {
    if (!search.trim()) return notas;
    const term = search.toLowerCase();
    return notas.filter(
      (nota) =>
        nota.nombre_oficial.toLowerCase().includes(term) ||
        nota.dependencia.toLowerCase().includes(term) ||
        `${nota.noOficial}`.includes(term) ||
        `${nota.noUnidad}`.includes(term) ||
        nota.recomendacion_medico.toLowerCase().includes(term)
    );
  }, [search, notas]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Notas Médicas ALM
            </h1>
            <p className="text-muted-foreground">
              Historial y trazabilidad de notas médicas para ALM
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/notas-medicas-alm/nueva">
              <Button>
                <ClipboardPlus className="mr-2 h-4 w-4" />
                Nueva nota ALM
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por oficial, dependencia, no. oficial o unidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="ghost" onClick={() => setSearch("")}>
            Limpiar
          </Button>
        </div>

        <NotasMedicasALMTable notas={filteredNotas} loading={loading} />
      </div>
    </MainLayout>
  );
}
