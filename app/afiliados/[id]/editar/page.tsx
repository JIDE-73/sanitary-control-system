"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormAfiliado } from "@/components/afiliados/form-afiliado";
import type { AfiliadoListado } from "@/components/afiliados/afiliados-table";
import { request } from "@/lib/request";
import type {
  Afiliado,
  EstatusAfiliado,
  Genero,
  EstadoCivil,
  LugarTrabajo,
} from "@/lib/types";

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default function EditarAfiliadoPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const [lugaresTrabajo, setLugaresTrabajo] = useState<LugarTrabajo[]>([]);
  const [lugaresLoading, setLugaresLoading] = useState<boolean>(true);
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loadingAfiliado, setLoadingAfiliado] = useState<boolean>(true);

  const normalizeGenero = (value?: string): Genero => {
    if (!value) return "masculino";
    const lower = value.toLowerCase();
    if (lower === "femenino") return "femenino";
    if (lower === "lgbt+" || lower === "lgbtq+") return "lgbt+";
    return "masculino";
  };

  const mapListadoToAfiliado = (item: AfiliadoListado): Afiliado => ({
    id: item.id,
    curp: item.curp ?? "",
    nombres: item.nombres ?? "",
    apellidoPaterno: item.apellidoPaterno ?? "",
    apellidoMaterno: item.apellidoMaterno ?? "",
    fechaNacimiento: item.fechaNacimiento ?? "",
    genero: normalizeGenero(item.genero),
    estatus: (item.estatus ?? "activo") as EstatusAfiliado,
    calle: item.catalogoCalle ?? "",
    colonia: item.catalogoColonia ?? "",
    codigoPostal: item.catalogoCodigoPostal ?? "",
    ciudad: item.catalogoCiudad ?? item.ciudad ?? "",
    estado: item.catalogoEstado ?? "",
    telefono: item.telefono ?? "",
    email: item.email ?? "",
    lugarTrabajoId: item.lugarTrabajoId ?? item.lugarTrabajoCodigo ?? "",
    ocupacion: item.ocupacion,
    lugarProcedencia: item.lugarProcedencia ?? "",
    direccion: item.direccion,
    estadoCivil: item.estadoCivil as EstadoCivil | undefined,
    fechaInicio: item.fechaInicio,
    fechaInicioTijuana: item.fechaInicioTijuana,
    actaNacimiento: item.actaNacimiento,
    fechaRegistro: item.fechaRegistro ?? "",
    fechaActualizacion: item.fechaActualizacion ?? "",
    avatar: item.foto
      ? `${baseUrl}/${item.foto.replace(/^\//, "")}`
      : undefined,
  });

  const getCachedActual = (): AfiliadoListado | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("afiliado-current");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object")
        return parsed as AfiliadoListado;
      return null;
    } catch {
      return null;
    }
  };

  const getCachedAfiliados = (): AfiliadoListado[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem("afiliados-cache");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const loadAfiliado = async () => {
    setLoadingAfiliado(true);
    try {
      // Primero intentar desde cache
      const actual = getCachedActual();
      const data = getCachedAfiliados();
      const fromList =
        data.find((item) => String(item.id) === String(id)) ?? null;
      const fuente =
        fromList ?? (actual && String(actual.id) === String(id) ? actual : null);
      
      if (fuente) {
        setAfiliado(mapListadoToAfiliado(fuente));
        setLoadingAfiliado(false);
        return;
      }

      // Si no está en cache, cargar desde API
      const response = await request(
        `/sics/affiliates/getAffiliateById/${encodeURIComponent(id)}`,
        "GET"
      );
      
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

          if (
            "persona" in candidate ||
            "persona_id" in candidate ||
            "no_Afiliacion" in candidate ||
            "no_afiliacion" in candidate
          ) {
            return [candidate];
          }
        }

        return [];
      };

      const dataArray = extractArray(response);
      if (dataArray.length > 0) {
        // Normalizar usando la misma función que en page.tsx
        const normalizeAfiliado = (item: any): AfiliadoListado => ({
          id: String(item?.persona_id ?? item?.persona?.id ?? item?.id ?? ""),
          noAfiliacion:
            item?.no_Afiliacion ?? item?.no_afiliacion ?? item?.noAfiliacion,
          sidmoCodigo: item?.sidmo_codigo ?? null,
          curp: item?.persona?.curp ?? "",
          nombres: item?.persona?.nombre ?? "",
          apellidoPaterno: item?.persona?.apellido_paterno ?? "",
          apellidoMaterno: item?.persona?.apellido_materno ?? "",
          genero: (item?.persona?.genero ?? "masculino") as AfiliadoListado["genero"],
          telefono: item?.persona?.telefono ?? "",
          ciudad:
            item?.catalogo?.ciudad ??
            item?.persona?.ciudad ??
            item?.lugar_procedencia ??
            "",
          lugarTrabajoId:
            item?.catalogo?.id ?? item?.persona?.catalogo_id ?? item?.lugar_trabajo,
          lugarTrabajoCodigo: item?.catalogo?.codigo ?? item?.lugar_trabajo,
          lugarTrabajoNombre: item?.catalogo?.nombre,
          estatus: (item?.estatus ?? "activo") as AfiliadoListado["estatus"],
          fechaNacimiento: item?.persona?.fecha_nacimiento,
          fechaInicio: item?.fecha_inicio,
          fechaInicioTijuana: item?.fecha_inicio_tijuana,
          estadoCivil: item?.estado_civil,
          actaNacimiento: item?.acta_nacimiento,
          lugarProcedencia: item?.lugar_procedencia,
          email: item?.persona?.email,
          direccion: item?.persona?.direccion,
          fechaRegistro: item?.persona?.created_at,
          catalogoCalle: item?.catalogo?.calle,
          catalogoColonia: item?.catalogo?.colonia,
          catalogoCodigoPostal: item?.catalogo?.codigo_postal,
          catalogoCiudad: item?.catalogo?.ciudad,
          catalogoEstado: item?.catalogo?.estado,
          catalogoTelefono: item?.catalogo?.telefono,
          foto: item?.persona?.foto ?? null,
        });

        const normalizado = normalizeAfiliado(dataArray[0]);
        setAfiliado(mapListadoToAfiliado(normalizado));
      } else {
        setAfiliado(null);
      }
    } catch (error) {
      console.error("Error al cargar afiliado", error);
      setAfiliado(null);
    } finally {
      setLoadingAfiliado(false);
    }
  };

  useEffect(() => {
    const fetchLugaresTrabajo = async () => {
      setLugaresLoading(true);
      try {
        const response = await request("/sics/workPlace/getWorkPlace", "GET");
        const lugares = Array.isArray(response?.Laboratorios)
          ? response.Laboratorios.map((item: any) => ({
              id: item.id,
              codigo: item.codigo,
              nombre: item.nombre,
              calle: item.calle,
              colonia: item.colonia,
              codigo_postal: item.codigo_postal,
              telefono: item.telefono,
              ciudad: item.ciudad,
              estado: item.estado,
            }))
          : [];
        setLugaresTrabajo(lugares);
      } catch (error) {
        console.error("No se pudieron cargar los lugares de trabajo", error);
        setLugaresTrabajo([]);
      } finally {
        setLugaresLoading(false);
      }
    };

    fetchLugaresTrabajo();
    loadAfiliado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const titulo = useMemo(() => {
    if (!afiliado) return "Editar Afiliado";
    return `Editar Afiliado - ${afiliado.nombres} ${afiliado.apellidoPaterno} ${
      afiliado.apellidoMaterno ?? ""
    }`.trim();
  }, [afiliado]);

  if (loadingAfiliado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Cargando afiliado...</p>
        </div>
      </MainLayout>
    );
  }

  if (!afiliado) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">
            Afiliado no encontrado
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
          <p className="text-muted-foreground">
            {afiliado.nombres} {afiliado.apellidoPaterno}{" "}
            {afiliado.apellidoMaterno}
          </p>
        </div>

        <FormAfiliado
          afiliado={afiliado}
          lugaresTrabajo={lugaresTrabajo}
          lugaresLoading={lugaresLoading}
          onSubmit={() => {}}
        />
      </div>
    </MainLayout>
  );
}
