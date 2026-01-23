"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import {
  FormCertificado,
  type CertificadoFormPayload,
} from "@/components/certificados/form-certificado";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { request } from "@/lib/request";

function FormCertificadoWrapper() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: CertificadoFormPayload) => {
    try {
      setSaving(true);
      const response = await request(
        "/alcoholimetria/certificates/createCertificate",
        "POST",
        data
      );

      if (response.status >= 200 && response.status < 300) {
        const folio = response?.result?.folio || data.folio;
        toast.success("Certificado emitido exitosamente", {
          description: `Folio: ${folio}`,
        });
        router.push("/certificados");
        return;
      }

      toast.error("No se pudo emitir el certificado", {
        description:
          response?.message ||
          "El backend respondió con un error. Revisa los datos e intenta nuevamente.",
      });
    } catch (error) {
      console.error("Error al enviar el certificado", error);
      toast.error("Error de red", {
        description: "No se pudo comunicar con el backend.",
      });
    } finally {
      setSaving(false);
    }
  };

  return <FormCertificado onSubmit={handleSubmit} submitting={saving} />;
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function NuevoCertificadoPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Emitir Certificado de Alcoholimetría
            </h1>
            <p className="text-muted-foreground">
              Complete los datos para emitir un nuevo certificado de alcoholimetría
            </p>
          </div>
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense fallback={<FormSkeleton />}>
          <FormCertificadoWrapper />
        </Suspense>
      </div>
    </MainLayout>
  );
}
