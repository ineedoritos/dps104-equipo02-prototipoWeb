"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, UserCheck, Users } from "lucide-react";

import {
  CONTEXTOS_BASE,
  type ContextoPortal,
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
  const router = useRouter();
  const { contextoActivo, seleccionarGrupo, seleccionarPersonal } =
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

  function entrarAGrupo(grupo: ContextoPortal) {
    seleccionarGrupo(grupo.id);
    if (grupo.rol === "responsable") {
      router.push("/dashboard");
      return;
    }
    router.push("/mi-reporte");
  }

  function irAMiReporte() {
    seleccionarPersonal();
    router.push("/mi-reporte");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Seleccionar grupo
          </h1>
          <p className="text-sm text-muted-foreground">
            Elige el grupo que deseas consultar o abre tu reporte personal.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={irAMiReporte}
          className="gap-2 self-start sm:self-auto"
        >
          <UserCheck className="h-4 w-4" />
          <span>Mi reporte personal</span>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              Intenta con otro nombre o limpia el filtro de búsqueda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gruposFiltrados.map((grupo) => {
            const esActivo = contextoActivo?.id === grupo.id;
            return (
              <Card
                key={grupo.id}
                className={esActivo ? "border-primary/60" : undefined}
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
                    {esActivo ? "Contexto actual" : "Disponible"}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant={esActivo ? "default" : "outline"}
                    onClick={() => entrarAGrupo(grupo)}
                    className="gap-1.5"
                  >
                    <span>{esActivo ? "Continuar" : "Entrar"}</span>
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
