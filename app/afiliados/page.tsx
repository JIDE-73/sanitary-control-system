"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { SearchAfiliado } from "@/components/afiliados/search-afiliado"
import { AfiliadosTable } from "@/components/afiliados/afiliados-table"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import Link from "next/link"
import { afiliados as mockAfiliados } from "@/lib/mock-data"
import type { Afiliado } from "@/lib/types"

export default function AfiliadosPage() {
  const [filteredAfiliados, setFilteredAfiliados] = useState<Afiliado[]>(mockAfiliados)

  const handleSearch = (query: string, filters: { genero?: string; estatus?: string }) => {
    let results = [...mockAfiliados]

    if (query) {
      const searchTerm = query.toLowerCase()
      results = results.filter(
        (a) =>
          a.curp.toLowerCase().includes(searchTerm) ||
          a.nombres.toLowerCase().includes(searchTerm) ||
          a.apellidoPaterno.toLowerCase().includes(searchTerm) ||
          a.apellidoMaterno.toLowerCase().includes(searchTerm) ||
          a.id.includes(searchTerm),
      )
    }

    if (filters.genero && filters.genero !== "all") {
      results = results.filter((a) => a.genero === filters.genero)
    }

    if (filters.estatus && filters.estatus !== "all") {
      results = results.filter((a) => a.estatus === filters.estatus)
    }

    setFilteredAfiliados(results)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Afiliados</h1>
            <p className="text-muted-foreground">Buscar y gestionar expedientes de afiliados</p>
          </div>
          <Link href="/afiliados/nuevo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Afiliado
            </Button>
          </Link>
        </div>

        {/* Search */}
        <SearchAfiliado onSearch={handleSearch} />

        {/* Results */}
        <AfiliadosTable afiliados={filteredAfiliados} />
      </div>
    </MainLayout>
  )
}
