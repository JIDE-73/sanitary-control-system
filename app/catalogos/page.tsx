"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { RequireModuleAccess } from "@/components/auth/auth-context";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Treatment {
  id: string;
  nombre: string;
  descripcion: string;
}

interface DiagnosticCatalog {
  id: string;
  codigo_cie10: string;
  descripcion_cie10: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toTreatment(item: unknown): Treatment | null {
  if (!isRecord(item)) return null;
  const id = typeof item.id === "string" ? item.id : "";
  const nombre = typeof item.nombre === "string" ? item.nombre : "";
  const descripcion = typeof item.descripcion === "string" ? item.descripcion : "";
  if (!id || !nombre) return null;
  return { id, nombre, descripcion };
}

function toDiagnostic(item: unknown): DiagnosticCatalog | null {
  if (!isRecord(item)) return null;
  const id = typeof item.id === "string" ? item.id : "";
  const codigo_cie10 = typeof item.codigo_cie10 === "string" ? item.codigo_cie10 : "";
  const descripcion_cie10 =
    typeof item.descripcion_cie10 === "string" ? item.descripcion_cie10 : "";
  if (!id || !codigo_cie10) return null;
  return { id, codigo_cie10, descripcion_cie10 };
}

export default function CatalogosPage() {
  const { toast } = useToast();

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticCatalog[]>([]);
  const [loadingTreatments, setLoadingTreatments] = useState(true);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(true);

  const [newTreatmentNombre, setNewTreatmentNombre] = useState("");
  const [newTreatmentDescripcion, setNewTreatmentDescripcion] = useState("");
  const [newDiagnosticCodigo, setNewDiagnosticCodigo] = useState("");
  const [newDiagnosticDescripcion, setNewDiagnosticDescripcion] = useState("");

  const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(null);
  const [editingTreatmentNombre, setEditingTreatmentNombre] = useState("");
  const [editingTreatmentDescripcion, setEditingTreatmentDescripcion] = useState("");

  const [editingDiagnosticId, setEditingDiagnosticId] = useState<string | null>(null);
  const [editingDiagnosticCodigo, setEditingDiagnosticCodigo] = useState("");
  const [editingDiagnosticDescripcion, setEditingDiagnosticDescripcion] = useState("");

  const loadTreatments = async () => {
    setLoadingTreatments(true);
    try {
      const response = await request("/sics/tratamientos/getAllTreatments", "GET");
      const raw = isRecord(response) && Array.isArray(response.treatments) ? response.treatments : [];
      const normalized = raw.map(toTreatment).filter((item): item is Treatment => item !== null);
      setTreatments(normalized);
    } catch (error) {
      console.error("No se pudieron cargar los tratamientos", error);
      setTreatments([]);
      toast({
        title: "Error",
        description: "No se pudo cargar el catálogo de tratamientos.",
        variant: "destructive",
      });
    } finally {
      setLoadingTreatments(false);
    }
  };

  const loadDiagnostics = async () => {
    setLoadingDiagnostics(true);
    try {
      const response = await request("/sics/catalog/getDiagnosticCatalog", "GET");
      const raw = isRecord(response) && Array.isArray(response.getCatalog) ? response.getCatalog : [];
      const normalized = raw
        .map(toDiagnostic)
        .filter((item): item is DiagnosticCatalog => item !== null);
      setDiagnostics(normalized);
    } catch (error) {
      console.error("No se pudieron cargar los catalogos diagnosticos", error);
      setDiagnostics([]);
      toast({
        title: "Error",
        description: "No se pudo cargar el catálogo diagnóstico.",
        variant: "destructive",
      });
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  useEffect(() => {
    loadTreatments();
    loadDiagnostics();
  }, []);

  const handleCreateTreatment = async () => {
    if (!newTreatmentNombre.trim() || !newTreatmentDescripcion.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Nombre y descripción son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    try {
      await request("/sics/tratamientos/createTreatment", "POST", {
        nombre: newTreatmentNombre.trim(),
        descripcion: newTreatmentDescripcion.trim(),
      });
      setNewTreatmentNombre("");
      setNewTreatmentDescripcion("");
      await loadTreatments();
      toast({ title: "Tratamiento creado correctamente" });
    } catch (error) {
      console.error("No se pudo crear el tratamiento", error);
      toast({
        title: "Error",
        description: "No se pudo crear el tratamiento.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTreatment = async () => {
    if (!editingTreatmentId) return;
    if (!editingTreatmentNombre.trim() || !editingTreatmentDescripcion.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Nombre y descripción son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    try {
      await request(`/sics/tratamientos/updateTreatment/${editingTreatmentId}`, "PUT", {
        nombre: editingTreatmentNombre.trim(),
        descripcion: editingTreatmentDescripcion.trim(),
      });
      setEditingTreatmentId(null);
      setEditingTreatmentNombre("");
      setEditingTreatmentDescripcion("");
      await loadTreatments();
      toast({ title: "Tratamiento actualizado correctamente" });
    } catch (error) {
      console.error("No se pudo actualizar el tratamiento", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tratamiento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTreatment = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar este tratamiento?")) return;
    try {
      await request(`/sics/tratamientos/deleteTreatment/${id}`, "DELETE");
      await loadTreatments();
      toast({ title: "Tratamiento eliminado correctamente" });
    } catch (error) {
      console.error("No se pudo eliminar el tratamiento", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tratamiento.",
        variant: "destructive",
      });
    }
  };

  const handleCreateDiagnostic = async () => {
    if (!newDiagnosticCodigo.trim() || !newDiagnosticDescripcion.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Código CIE10 y descripción son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    try {
      await request("/sics/catalog/createDiagnosticCatalog", "POST", {
        codigo_cie10: newDiagnosticCodigo.trim(),
        descripcion_cie10: newDiagnosticDescripcion.trim(),
      });
      setNewDiagnosticCodigo("");
      setNewDiagnosticDescripcion("");
      await loadDiagnostics();
      toast({ title: "Diagnóstico creado correctamente" });
    } catch (error) {
      console.error("No se pudo crear el diagnostico", error);
      toast({
        title: "Error",
        description: "No se pudo crear el diagnóstico.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDiagnostic = async () => {
    if (!editingDiagnosticId) return;
    if (!editingDiagnosticCodigo.trim() || !editingDiagnosticDescripcion.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Código CIE10 y descripción son obligatorios.",
        variant: "destructive",
      });
      return;
    }
    try {
      await request(`/sics/catalog/updateDiagnosticCatalog/${editingDiagnosticId}`, "PUT", {
        codigo_cie10: editingDiagnosticCodigo.trim(),
        descripcion_cie10: editingDiagnosticDescripcion.trim(),
      });
      setEditingDiagnosticId(null);
      setEditingDiagnosticCodigo("");
      setEditingDiagnosticDescripcion("");
      await loadDiagnostics();
      toast({ title: "Diagnóstico actualizado correctamente" });
    } catch (error) {
      console.error("No se pudo actualizar el diagnostico", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el diagnóstico.",
        variant: "destructive",
      });
    }
  };

  return (
    <RequireModuleAccess module="usuarios" action="read">
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Catálogos</h1>
            <p className="text-muted-foreground">
              Administra tratamientos y catálogos diagnósticos CIE10.
            </p>
          </div>

          <Tabs defaultValue="tratamientos" className="w-full">
            <TabsList>
              <TabsTrigger value="tratamientos">Tratamientos</TabsTrigger>
              <TabsTrigger value="diagnosticos">Diagnósticos CIE10</TabsTrigger>
            </TabsList>

            <TabsContent value="tratamientos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nuevo tratamiento</CardTitle>
                  <CardDescription>
                    Registra un nuevo tratamiento con nombre y descripción.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Nombre del tratamiento"
                    value={newTreatmentNombre}
                    onChange={(event) => setNewTreatmentNombre(event.target.value)}
                  />
                  <Textarea
                    placeholder="Descripción del tratamiento"
                    value={newTreatmentDescripcion}
                    onChange={(event) => setNewTreatmentDescripcion(event.target.value)}
                  />
                  <Button onClick={handleCreateTreatment}>Guardar tratamiento</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Listado de tratamientos</CardTitle>
                  <CardDescription>
                    Edita o elimina tratamientos existentes del catálogo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingTreatments ? (
                        <TableRow>
                          <TableCell colSpan={3}>Cargando tratamientos...</TableCell>
                        </TableRow>
                      ) : treatments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>No hay tratamientos registrados.</TableCell>
                        </TableRow>
                      ) : (
                        treatments.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-[220px] truncate">{item.nombre}</TableCell>
                            <TableCell className="max-w-[380px] truncate">{item.descripcion}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingTreatmentId(item.id);
                                    setEditingTreatmentNombre(item.nombre);
                                    setEditingTreatmentDescripcion(item.descripcion);
                                  }}
                                >
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteTreatment(item.id)}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {editingTreatmentId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar tratamiento</CardTitle>
                    <CardDescription>Actualiza nombre y descripción del tratamiento.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={editingTreatmentNombre}
                      onChange={(event) => setEditingTreatmentNombre(event.target.value)}
                    />
                    <Textarea
                      value={editingTreatmentDescripcion}
                      onChange={(event) => setEditingTreatmentDescripcion(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateTreatment}>Guardar cambios</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingTreatmentId(null);
                          setEditingTreatmentNombre("");
                          setEditingTreatmentDescripcion("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="diagnosticos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nuevo diagnóstico CIE10</CardTitle>
                  <CardDescription>
                    Registra un nuevo diagnóstico con su código CIE10.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Código CIE10"
                    value={newDiagnosticCodigo}
                    onChange={(event) => setNewDiagnosticCodigo(event.target.value)}
                  />
                  <Textarea
                    placeholder="Descripción CIE10"
                    value={newDiagnosticDescripcion}
                    onChange={(event) => setNewDiagnosticDescripcion(event.target.value)}
                  />
                  <Button onClick={handleCreateDiagnostic}>Guardar diagnóstico</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Listado de diagnósticos CIE10</CardTitle>
                  <CardDescription>Consulta y edita el catálogo diagnóstico.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código CIE10</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingDiagnostics ? (
                        <TableRow>
                          <TableCell colSpan={3}>Cargando diagnósticos...</TableCell>
                        </TableRow>
                      ) : diagnostics.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>No hay diagnósticos registrados.</TableCell>
                        </TableRow>
                      ) : (
                        diagnostics.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.codigo_cie10}</TableCell>
                            <TableCell className="max-w-[380px] truncate">
                              {item.descripcion_cie10}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingDiagnosticId(item.id);
                                  setEditingDiagnosticCodigo(item.codigo_cie10);
                                  setEditingDiagnosticDescripcion(item.descripcion_cie10);
                                }}
                              >
                                Editar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {editingDiagnosticId && (
                <Card>
                  <CardHeader>
                    <CardTitle>Editar diagnóstico CIE10</CardTitle>
                    <CardDescription>
                      Actualiza código y descripción del diagnóstico seleccionado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={editingDiagnosticCodigo}
                      onChange={(event) => setEditingDiagnosticCodigo(event.target.value)}
                    />
                    <Textarea
                      value={editingDiagnosticDescripcion}
                      onChange={(event) => setEditingDiagnosticDescripcion(event.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateDiagnostic}>Guardar cambios</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingDiagnosticId(null);
                          setEditingDiagnosticCodigo("");
                          setEditingDiagnosticDescripcion("");
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </RequireModuleAccess>
  );
}

