"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { MedicosTable } from "@/components/medicos/medicos-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserPlus, Search } from "lucide-react"
import Link from "next/link"
import { medicos as mockMedicos } from "@/lib/mock-data"
import type { Medico } from "@/lib/types"

export default function MedicosPage() {
  const [filteredMedicos, setFilteredMedicos] = useState<Medico[]>(mockMedicos)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      setFilteredMedicos(mockMedicos)
      return
    }
    const searchTerm = query.toLowerCase()
    setFilteredMedicos(
      mockMedicos.filter(
        (m) =>
          m.cedulaProfesional.toLowerCase().includes(searchTerm) ||
          m.nombres.toLowerCase().includes(searchTerm) ||
          m.apellidoPaterno.toLowerCase().includes(searchTerm) ||
          m.apellidoMaterno.toLowerCase().includes(searchTerm) ||
          m.especialidad.toLowerCase().includes(searchTerm),
      ),
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Médicos</h1>
            <p className="text-muted-foreground">Gestión de médicos autorizados para emitir certificados</p>
          </div>
          <Link href="/medicos/nuevo">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Médico
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cédula, nombre o especialidad..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <MedicosTable medicos={filteredMedicos} />
      </div>
    </MainLayout>
  )
}
