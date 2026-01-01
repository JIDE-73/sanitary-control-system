"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ExamenesTable } from "@/components/examenes/examenes-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TestTube, Search } from "lucide-react"
import Link from "next/link"
import { examenesClinicosData, afiliados, tiposExamen } from "@/lib/mock-data"
import type { ExamenClinico } from "@/lib/types"

export default function ExamenesPage() {
  const [filteredExamenes, setFilteredExamenes] = useState<ExamenClinico[]>(examenesClinicosData)
  const [searchQuery, setSearchQuery] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterExamenes(query, tipoFilter)
  }

  const handleTipoFilter = (tipo: string) => {
    setTipoFilter(tipo)
    filterExamenes(searchQuery, tipo)
  }

  const filterExamenes = (query: string, tipo: string) => {
    let results = [...examenesClinicosData]

    if (query) {
      const term = query.toLowerCase()
      results = results.filter((e) => {
        const afiliado = afiliados.find((a) => a.id === e.afiliadoId)
        return (
          afiliado?.curp.toLowerCase().includes(term) ||
          afiliado?.nombres.toLowerCase().includes(term) ||
          afiliado?.apellidoPaterno.toLowerCase().includes(term)
        )
      })
    }

    if (tipo && tipo !== "all") {
      results = results.filter((e) => e.tipoExamen === tipo)
    }

    setFilteredExamenes(results)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exámenes Clínicos</h1>
            <p className="text-muted-foreground">Historial y seguimiento de exámenes de laboratorio</p>
          </div>
          <Link href="/examenes/nuevo">
            <Button>
              <TestTube className="mr-2 h-4 w-4" />
              Ordenar Examen
            </Button>
          </Link>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por CURP o nombre..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={tipoFilter} onValueChange={handleTipoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de examen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {tiposExamen.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.codigo}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ExamenesTable examenes={filteredExamenes} afiliados={afiliados} />
      </div>
    </MainLayout>
  )
}
