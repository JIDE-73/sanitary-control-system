"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardPlus, Search } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import {
  NotasMedicasTable,
  type AfiliadoTabla,
  type MedicoTabla,
  type NotaMedica,
} from "@/components/notas-medicas/consultas-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

const extractArray = (response: any) => {
  const candidate = Array.isArray(response?.data)
    ? response.data
    : response?.data ?? response;

  if (Array.isArray(candidate)) return candidate;

  if (candidate && typeof candidate === "object") {
    const numericKeys = Object.keys(candidate).filter((k) => /^\d+$/.test(k));
    if (numericKeys.length) {
      return numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => (candidate as any)[k])
        .filter(Boolean);
    }
  }

  return [];
};

export default function NotasMedicasPage() {
  const { toast } = useToast();
  const [notas, setNotas] = useState<NotaMedica[]>([]);
  const [afiliados, setAfiliados] = useState<AfiliadoTabla[]>([]);
  const [medicos, setMedicos] = useState<MedicoTabla[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeAfiliado = (item: any): AfiliadoTabla => {
    const persona = item?.persona ?? {};
    const nombre = `${persona.nombre ?? ""} ${persona.apellido_paterno ?? ""} ${
      persona.apellido_materno ?? ""
    }`
      .replace(/\s+/g, " ")
      .trim();
    return {
      id: item?.persona_id ?? persona?.id ?? "",
      nombre: nombre || "Sin nombre",
      curp: persona?.curp ?? "",
      numeroAfiliacion: item?.no_Afiliacion ?? item?.no_afiliacion,
    };
  };

  const normalizeMedico = (item: any): MedicoTabla => {
    const persona = item?.persona ?? {};
    const nombre = `${persona.nombre ?? ""} ${persona.apellido_paterno ?? ""} ${
      persona.apellido_materno ?? ""
    }`
      .replace(/\s+/g, " ")
      .trim();
    return {
      id: item?.persona_id ?? persona?.id ?? "",
      nombre: nombre || "Médico sin nombre",
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [notasResp, afiliadosResp, medicosResp] = await Promise.all([
        request("/sics/medical/getMedicalNotes", "GET"),
        request("/sics/affiliates/getAffiliattes", "GET"),
        request("/sics/doctors/getDoctors", "GET"),
      ]);

      const notasData = (notasResp?.medicalNotes ??
        extractArray(notasResp)) as NotaMedica[];
      setNotas(Array.isArray(notasData) ? notasData : []);

      const afiliadosData = extractArray(afiliadosResp).map(normalizeAfiliado);
      setAfiliados(afiliadosData);

      const medicosData = extractArray(medicosResp).map(normalizeMedico);
      setMedicos(medicosData);
    } catch (error) {
      console.error("No se pudieron cargar las notas médicas", error);
      toast({
        title: "Error al cargar notas médicas",
        description: "Inténtalo nuevamente en unos minutos.",
        variant: "destructive",
      });
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarNotas = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      await loadData();
      return;
    }

    setLoading(true);
    try {
      const response = await request(
        `/sics/medical/getMedicalNotesById/${encodeURIComponent(trimmed)}`,
        "GET"
      );

      // La API devuelve un objeto con persona y sus Nota_Medica
      const medicalNotes = response?.medicalNotes;
      if (medicalNotes?.persona) {
        const notasPersona = Array.isArray(medicalNotes.persona.Nota_Medica)
          ? medicalNotes.persona.Nota_Medica
          : extractArray(medicalNotes.persona.Nota_Medica);

        setNotas(
          Array.isArray(notasPersona) ? (notasPersona as NotaMedica[]) : []
        );
        setAfiliados([normalizeAfiliado(medicalNotes)]);
      } else {
        const notasData = (medicalNotes ??
          extractArray(response)) as NotaMedica[];
        setNotas(Array.isArray(notasData) ? notasData : []);
      }
    } catch (error) {
      console.error("Error al buscar notas médicas", error);
      toast({
        title: "No se pudo buscar",
        description: "Intenta nuevamente o revisa el parámetro ingresado.",
        variant: "destructive",
      });
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchClick = () => {
    buscarNotas(searchQuery);
  };

  const filteredNotas = useMemo(() => {
    if (!searchQuery) return notas;
    const term = searchQuery.toLowerCase();
    return notas.filter((nota) => {
      const afiliado = afiliados.find((a) => a.id === nota.persona_id);
      const medico = medicos.find((m) => m.id === nota.medico_id);
      return (
        nota.diagnostico?.toLowerCase().includes(term) ||
        nota.tratamiento?.toLowerCase().includes(term) ||
        nota.comentario?.toLowerCase().includes(term) ||
        afiliado?.curp.toLowerCase().includes(term) ||
        afiliado?.nombre.toLowerCase().includes(term) ||
        medico?.nombre.toLowerCase().includes(term)
      );
    });
  }, [searchQuery, notas, afiliados, medicos]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notas médicas</h1>
            <p className="text-muted-foreground">Historial de notas médicas</p>
          </div>
          <Link href="/notas-medicas/nueva">
            <Button>
              <ClipboardPlus className="mr-2 h-4 w-4" />
              Nueva nota médica
            </Button>
          </Link>
        </div>

        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por CURP, nombre, apellidos, # de afiliado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearchClick();
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearchClick}>Buscar</Button>
        </div>

        <NotasMedicasTable
          loading={loading}
          notas={filteredNotas}
          afiliados={afiliados}
          medicos={medicos}
        />
      </div>
    </MainLayout>
  );
}
