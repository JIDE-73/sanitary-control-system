"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { FormEvidencias } from "@/components/certificados/form-evidencias";
import { GaleriaEvidencias } from "@/components/certificados/galeria-evidencias";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";

export default function EvidenciasPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Forzar recarga de la galería
    setRefreshKey((prev) => prev + 1);
  };

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
              Evidencias de Alcoholimetría
            </h1>
            <p className="text-muted-foreground">
              Sube y gestiona las evidencias fotográficas de los certificados de alcoholimetría
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="galeria" className="space-y-4">
          <TabsList>
            <TabsTrigger value="galeria">
              <ImageIcon className="mr-2 h-4 w-4" />
              Galería
            </TabsTrigger>
            <TabsTrigger value="subir">
              <Upload className="mr-2 h-4 w-4" />
              Subir Evidencias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="galeria" className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <GaleriaEvidencias key={refreshKey} onRefresh={() => setRefreshKey((prev) => prev + 1)} />
            </div>
          </TabsContent>

          <TabsContent value="subir" className="space-y-4">
            <div className="rounded-lg border bg-card p-6">
              <FormEvidencias onUploadSuccess={handleUploadSuccess} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

