import { MainLayout } from "@/components/layout/main-layout"
import { VerificarCertificado } from "@/components/certificados/verificar-certificado"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: Promise<{ folio?: string }>
}

export default async function VerificarCertificadoPage({ searchParams }: PageProps) {
  const { folio } = await searchParams

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/certificados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Verificar Certificado</h1>
            <p className="text-muted-foreground">Compruebe la autenticidad y vigencia de un certificado sanitario</p>
          </div>
        </div>

        {/* Verificador */}
        <div className="mx-auto max-w-2xl">
          <VerificarCertificado initialFolio={folio} />
        </div>
      </div>
    </MainLayout>
  )
}
