"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, UserCheck, Users } from "lucide-react";

import {
  CONTEXTOS_BASE,
  rutaPortal,
  useContextoPortal,
} from "@/components/layout/contexto-portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function GruposPage() {
  const { contextoActivo } =
    useContextoPortal();
  const [busqueda, setBusqueda] = useState("");

  const gruposFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return CONTEXTOS_BASE;
    return CONTEXTOS_BASE.filter(
      (grupo) =>
        grupo.nombre.toLowerCase().includes(termino) ||
        grupo.descripcion.toLowerCase().includes(termino),
    );
  }, [busqueda]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-forma-ink">
            Seleccionar grupo
          </h1>
          <p className="text-sm text-muted-foreground">
            Elige el grupo que deseas consultar o abre tu reporte personal.
          </p>
        </div>

        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={rutaPortal("/mi-reporte", contextoActivo?.id)} />}
          className="gap-2 self-start sm:self-auto"
        >
          <UserCheck className="h-4 w-4" />
          <span>Mi reporte personal</span>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <Input
          type="search"
          placeholder="Buscar grupo por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9 bg-card"
          aria-label="Buscar grupo"
        />
      </div>

      {gruposFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">
              No se encontraron grupos con ese criterio
            </p>
            <p className="text-xs text-muted-foreground">
              Prueba con otro nombre.
            </p>
            <Button variant="ghost" onClick={() => setBusqueda("")}>Limpiar búsqueda</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid max-w-4xl gap-3">
          {gruposFiltrados.map((grupo) => {
            const esActivo = contextoActivo?.id === grupo.id;
            return (
              <Card
                key={grupo.id}
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">
                      {grupo.nombre}
                    </CardTitle>
                    {grupo.rol && (
                      <Badge
                        variant={
                          grupo.rol === "responsable" ? "default" : "secondary"
                        }
                      >
                        {grupo.rol === "responsable"
                          ? "Responsable"
                          : "Participante"}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{grupo.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {esActivo ? "Grupo actual" : null}
                  </span>
                  <Button
                    nativeButton={false}
                    variant="outline"
                    render={
                      <Link href={grupo.rol === "responsable"
                        ? rutaPortal("/dashboard", grupo.id)
                        : rutaPortal("/mi-reporte", grupo.id, { alcance: grupo.id })
                      } />
                    }
                    className="gap-1.5"
                  >
                    <span>{grupo.rol === "responsable" ? "Ver resumen" : "Ver mi reporte"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
