"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ConsultasTable } from "@/components/consultas/consultas-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClipboardPlus, Search } from "lucide-react"
import Link from "next/link"
import { consultasClinicas, afiliados, medicos } from "@/lib/mock-data"
import type { ConsultaClinica } from "@/lib/types"

export default function ConsultasPage() {
  const [filteredConsultas, setFilteredConsultas] = useState<ConsultaClinica[]>(consultasClinicas)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      setFilteredConsultas(consultasClinicas)
      return
    }
    const term = query.toLowerCase()
    setFilteredConsultas(
      consultasClinicas.filter((c) => {
        const afiliado = afiliados.find((a) => a.id === c.afiliadoId)
        const medico = medicos.find((m) => m.id === c.medicoId)
        return (
          afiliado?.curp.toLowerCase().includes(term) ||
          afiliado?.nombres.toLowerCase().includes(term) ||
          afiliado?.apellidoPaterno.toLowerCase().includes(term) ||
          medico?.nombres.toLowerCase().includes(term) ||
          c.diagnostico.toLowerCase().includes(term)
        )
      }),
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Consultas Clínicas</h1>
            <p className="text-muted-foreground">Historial de consultas médicas registradas</p>
          </div>
          <Link href="/consultas/nueva">
            <Button>
              <ClipboardPlus className="mr-2 h-4 w-4" />
              Nueva Consulta
            </Button>
          </Link>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por CURP, nombre o diagnóstico..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <ConsultasTable consultas={filteredConsultas} afiliados={afiliados} medicos={medicos} />
      </div>
    </MainLayout>
  )
}
