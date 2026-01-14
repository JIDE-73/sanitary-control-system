"use client";

import { Suspense } from "react";
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

function FormCertificadoWrapper() {
  const router = useRouter();

  const handleSubmit = (data: CertificadoFormPayload) => {
    toast.success("Certificado emitido exitosamente", {
      description: `Folio: ${data.folio}`,
    });
    router.push("/certificados");
  };

  return <FormCertificado onSubmit={handleSubmit} />;
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
              Emitir Certificado Sanitario
            </h1>
            <p className="text-muted-foreground">
              Complete los datos para emitir un nuevo certificado
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
