"use client";

import type React from "react";

import { useState } from "react";
import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchCiudadanoProps {
  onSearch: (
    query: string,
    filters: { genero?: string; estatus?: string }
  ) => void;
}

export function SearchCiudadano({ onSearch }: SearchCiudadanoProps) {
  const [query, setQuery] = useState("");
  const [genero, setGenero] = useState<string>("");
  const [estatus, setEstatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, {
      genero: genero || undefined,
      estatus: estatus || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por CURP, nombre, apellido o identificador..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Buscar</Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="flex gap-4 rounded-lg border border-border p-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">Género</label>
                <Select value={genero} onValueChange={setGenero}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los géneros" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="lgbt+">LGBT+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium">
                  Estatus
                </label>
                <Select value={estatus} onValueChange={setEstatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estatus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="suspendido">Suspendido</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGenero("");
                    setEstatus("");
                  }}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
