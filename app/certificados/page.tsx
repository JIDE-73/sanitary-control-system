import { MainLayout } from "@/components/layout/main-layout";
import { CertificadosTable } from "@/components/certificados/certificados-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, QrCode } from "lucide-react";
import Link from "next/link";

export default function CertificadosPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Certificados Sanitarios
            </h1>
            <p className="text-muted-foreground">
              Gestión y emisión de certificados sanitarios
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/certificados/verificar">
              <Button variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                Verificar Certificado
              </Button>
            </Link>
            <Link href="/certificados/nuevo">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Emitir Certificado
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por folio o nombre del afiliado..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select defaultValue="todos">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="vigente">Vigentes</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <CertificadosTable />
      </div>
    </MainLayout>
  );
}
