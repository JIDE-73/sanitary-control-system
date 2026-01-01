"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { LugaresTable } from "@/components/lugares-trabajo/lugares-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Search } from "lucide-react"
import Link from "next/link"
import { lugaresTrabajo as mockLugares } from "@/lib/mock-data"
import type { LugarTrabajo } from "@/lib/types"

export default function LugaresTrabajoPage() {
  const [filteredLugares, setFilteredLugares] = useState<LugarTrabajo[]>(mockLugares)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      setFilteredLugares(mockLugares)
      return
    }
    const searchTerm = query.toLowerCase()
    setFilteredLugares(
      mockLugares.filter(
        (l) =>
          l.codigo.toLowerCase().includes(searchTerm) ||
          l.nombre.toLowerCase().includes(searchTerm) ||
          l.zonaTrabajo.toLowerCase().includes(searchTerm) ||
          l.ciudad.toLowerCase().includes(searchTerm),
      ),
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Lugares de Trabajo</h1>
            <p className="text-muted-foreground">Catálogo de establecimientos registrados</p>
          </div>
          <Link href="/lugares-trabajo/nuevo">
            <Button>
              <Building2 className="mr-2 h-4 w-4" />
              Nuevo Lugar
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código, nombre o zona..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <LugaresTable lugares={filteredLugares} />
      </div>
    </MainLayout>
  )
}
