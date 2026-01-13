"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardPlus, RefreshCcw, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { NotasMedicasALMTable } from "@/components/notas-medicas-alm/notas-alm-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NotaMedicaALM } from "@/lib/notas-medicas-alm";
import {
  loadNotasAlm,
  notasAlmSeed,
  persistNotasAlm,
} from "@/lib/notas-medicas-alm";

export default function NotasMedicasALMPage() {
  const [notas, setNotas] = useState<NotaMedicaALM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const data = loadNotasAlm();
    setNotas(data);
    setLoading(false);
  }, []);

  const filteredNotas = useMemo(() => {
    if (!search.trim()) return notas;
    const term = search.toLowerCase();
    return notas.filter(
      (nota) =>
        nota.folio.toLowerCase().includes(term) ||
        nota.pacienteNombre.toLowerCase().includes(term) ||
        nota.pacienteCurp.toLowerCase().includes(term) ||
        nota.medicoNombre.toLowerCase().includes(term) ||
        nota.motivoConsulta.toLowerCase().includes(term) ||
        nota.impresionDiagnostica.toLowerCase().includes(term)
    );
  }, [search, notas]);

  const handleResetSeed = () => {
    setNotas(notasAlmSeed);
    persistNotasAlm(notasAlmSeed);
  };

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
            <Button variant="outline" onClick={handleResetSeed}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Restaurar ejemplos
            </Button>
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
              placeholder="Buscar por folio, paciente, CURP, médico..."
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
